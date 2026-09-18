// Webhook de Hotmart — 09-VENTA-HOTMART.md "SEGURIDAD DEL WEBHOOK". Verifica el hottok en
// tiempo constante ANTES de tocar cualquier dato (autenticidad) → chequea que no sea una
// petición vieja reenviada (frescura) → aplica el evento de forma atómica e idempotente vía
// la función `apply_hotmart_event` (Postgres hace el dedupe + la transición de estado, no este
// archivo). Sin esto, cualquiera podría regalarse el plan Starter con un POST falso.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { verifyHotmart } from '@/lib/hotmart-verify';
import { estadoParaEvento } from '@/lib/hotmart-fsm';
import { resend, REMITENTE_TRANSACCIONAL } from '@/lib/email/resend';
import { correoAccesoCuentaNueva, correoConfirmacionStarter } from '@/lib/email/plantillas';

export const runtime = 'nodejs'; // necesita node:crypto y el raw body — no corre en Edge.

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

function admin() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error('Falta SUPABASE_SECRET_KEY — el webhook no puede aplicar cambios.');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Registrar el intento nunca debe poder tumbar la respuesta real (sobre todo la de rechazo):
 * si el log falla (ej. falta SUPABASE_SECRET_KEY todavía), se traga el error y sigue. */
async function logSilencioso(fila: { event_id?: string; type?: string; result: string }) {
  try {
    const supabase = admin();
    await supabase.from('webhook_log').insert(fila);
  } catch {
    // sin SUPABASE_SECRET_KEY configurada aún, o error de red — no hay dónde loguear, y eso
    // no es razón para fallar la respuesta de seguridad.
  }
}

export async function POST(req: NextRequest) {
  // 1. RAW body — los bytes exactos, antes de cualquier parseo (necesario si el día de mañana
  //    hay que verificar una firma documentada por Hotmart sobre el cuerpo crudo).
  const rawBody = await req.text();

  // 2. Autenticidad — hottok en tiempo constante. Hotmart lo manda como campo del body en la
  //    mayoría de cuentas (algunas también lo repiten en un header) — se acepta cualquiera de
  //    los dos, verificado recién DESPUÉS de parsear para leer el campo (el parseo en sí no
  //    toca la base de datos, así que no hay riesgo en parsear antes de este paso).
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const hottokHeader = req.headers.get('x-hotmart-hottok');
  const hottokBody = typeof payload.hottok === 'string' ? payload.hottok : undefined;
  if (!verifyHotmart(hottokHeader ?? hottokBody)) {
    await logSilencioso({ result: 'unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 3. Frescura (anti-replay) — solo si el payload trae una fecha fiable.
  const data = (payload.data as Record<string, unknown> | undefined) ?? {};
  const purchase = (data.purchase as Record<string, unknown> | undefined) ?? {};
  const ts = Number(payload.creation_date ?? purchase.approved_date ?? 0);
  if (ts && Date.now() - ts > REPLAY_WINDOW_MS) {
    return NextResponse.json({ error: 'stale' }, { status: 400 });
  }

  // 4. Datos del evento. La forma real varía por tipo de evento: una compra trae `data.buyer`,
  //    pero una cancelación/reembolso de suscripción trae `data.subscriber` directo (sin envolver
  //    en `data.subscription`) — confirmado con el payload real de Hotmart, no un placeholder.
  const event = String(payload.event ?? '');
  const nuevoEstado = estadoParaEvento(event);
  const buyer = data.buyer as Record<string, unknown> | undefined;
  const subscriber =
    (data.subscriber as Record<string, unknown> | undefined) ??
    ((data.subscription as Record<string, unknown> | undefined)?.subscriber as Record<string, unknown> | undefined);
  const email = (buyer?.email as string | undefined) ?? (subscriber?.email as string | undefined);
  const nombre = (buyer?.name as string | undefined) ?? (subscriber?.name as string | undefined) ?? 'Hola';
  const subscriberCode = subscriber?.code as string | undefined;
  const eventId = String(payload.id ?? payload.event_id ?? purchase.transaction ?? `${event}:${email ?? ''}:${ts}`);

  if (!nuevoEstado) {
    // Evento que no nos interesa (ej. SWITCH_PLAN, todavía sin manejar — Jornivo solo tiene 1
    // plan pago hoy) — se responde 200 para que Hotmart no reintente, sin tocar la base.
    return NextResponse.json({ received: true, ignored: event });
  }

  const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
  let supabase: ReturnType<typeof admin>;
  try {
    supabase = admin();
  } catch (err) {
    console.error('webhook hotmart: falta configuración del servidor', err);
    await logSilencioso({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }

  const { data: resultado, error } = await supabase.rpc('apply_hotmart_event', {
    p_event_id: eventId,
    p_event_type: event,
    p_payload_hash: payloadHash,
    p_email: email ?? null,
    p_subscriber_code: subscriberCode ?? null,
    p_new_status: nuevoEstado,
  });

  if (error) {
    console.error('webhook hotmart error', { event, code: error.code });
    await logSilencioso({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }

  // Jornivo no tiene trial (FICHA-MERCADO.md §4) — 'active' es el único estado que otorga acceso.
  const otorgaAcceso = nuevoEstado === 'active';

  // Compró directo (ej. el botón "Comprar Starter" de la landing) SIN haberse registrado antes —
  // sin esto, la persona paga y no tiene forma de entrar (18-VENTA-HOTMART.md, "ticket #1").
  // No se reintenta apply_hotmart_event: el intento anterior YA consumió el slot de idempotencia
  // de este event_id, un segundo llamado devolvería 'duplicate' sin aplicar nada — se actualiza
  // la empresa directo (el trigger on_auth_user_created ya la creó en plan 'gratis' al invitar).
  if (resultado === 'no_account' && otorgaAcceso && email) {
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email,
        options: { data: { nombre } },
      });
      if (linkError || !linkData?.properties?.action_link || !linkData.user) throw linkError ?? new Error('sin action_link');

      const { error: updateError } = await supabase
        .from('empresas')
        .update({
          subscription_status: nuevoEstado,
          hotmart_subscriber_code: subscriberCode ?? null,
          first_paid_at: new Date().toISOString(),
          plan: 'starter',
        })
        .eq('owner_id', linkData.user.id);
      if (updateError) throw updateError;

      const correo = correoAccesoCuentaNueva(nombre, linkData.properties.action_link);
      await resend().emails.send({ from: REMITENTE_TRANSACCIONAL, to: email, subject: correo.asunto, html: correo.html });
      await supabase.from('webhook_log').insert({ event_id: eventId, type: event, result: 'applied' });
      return NextResponse.json({ received: true, result: 'applied_cuenta_nueva' });
    } catch (err) {
      console.error('webhook hotmart: fallo creando cuenta nueva', err);
      await logSilencioso({ event_id: eventId, type: event, result: 'error' });
      return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
  }

  // Cuenta que YA existía (modelo gratis→onboarding→paywall) y se acaba de activar — confirmación,
  // no acceso (ya lo tenía). Falla silenciosa: un correo que no salió no debe hacer que Hotmart
  // reintente un evento que SÍ se aplicó a la base de datos.
  if (resultado === 'applied' && otorgaAcceso && email) {
    try {
      const correo = correoConfirmacionStarter(nombre);
      await resend().emails.send({ from: REMITENTE_TRANSACCIONAL, to: email, subject: correo.asunto, html: correo.html });
    } catch (err) {
      console.error('webhook hotmart: fallo enviando confirmación (no bloqueante)', err);
    }
  }

  return NextResponse.json({ received: true, result: resultado });
}
