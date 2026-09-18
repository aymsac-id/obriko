// Plantillas de correo transaccional — voz del arquetipo (FICHA-ARTE.md: Directo · Confiable ·
// Curtido en obra). Fondo CLARO a propósito (no el oscuro de la app): los clientes de correo
// renderizan mal el modo oscuro completo y arriesgan legibilidad — el acento de marca (#e8432e)
// va en el botón y el encabezado, que es donde SÍ se reconoce consistente.

const ACENTO = '#e8432e';
const TEXTO = '#1a1a1a';
const TEXTO_SECUNDARIO = '#6b6b6b';

function envoltura(cuerpoHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f2f0ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:20px;font-weight:800;color:${TEXTO};letter-spacing:-0.02em;">JORNIVO</span>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:32px 24px;">
      ${cuerpoHtml}
    </div>
    <p style="text-align:center;color:${TEXTO_SECUNDARIO};font-size:12px;margin-top:24px;">
      Jornivo — tu libreta privada de personal de confianza.<br/>
      ¿Dudas? Escríbenos a reclamos@jornivo.app
    </p>
  </div>
</body>
</html>`;
}

function boton(texto: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACENTO};color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">${texto}</a>`;
}

export interface CorreoAccesoNuevo {
  asunto: string;
  preheader: string;
  html: string;
}

/** Cuenta creada AHORA por el webhook (compró directo, sin haberse registrado antes) — el hueco
 * crítico del modelo: si esto no llega, la persona pagó y no tiene forma de entrar. */
export function correoAccesoCuentaNueva(nombre: string, enlaceAcceso: string): CorreoAccesoNuevo {
  const primerNombre = nombre.split(' ')[0] || 'Hola';
  return {
    asunto: `${primerNombre}, tu Jornivo Starter ya está listo`,
    preheader: 'Un clic y entras — sin instalar nada, sin contraseña que inventar todavía.',
    html: envoltura(`
      <p style="color:${TEXTO};font-size:17px;margin:0 0 12px;">Hola ${primerNombre},</p>
      <p style="color:${TEXTO};font-size:15px;line-height:1.5;margin:0 0 20px;">
        Tu pago se confirmó y tu cuenta Starter de Jornivo ya está activa — hasta 50 trabajadores
        en tu libreta, búsqueda con filtros y disponibilidad en tiempo real, sin llamar a nadie.
      </p>
      <div style="text-align:center;margin:24px 0;">
        ${boton('Entrar a Jornivo →', enlaceAcceso)}
      </div>
      <p style="color:${TEXTO_SECUNDARIO};font-size:13px;line-height:1.5;margin:0;">
        Este enlace te deja entrar directo, sin contraseña. Si ya no funciona, entra en
        jornivo.app/login con este mismo correo y pide uno nuevo.
      </p>
    `),
  };
}

/** Cadencia de dunning (58-RETENCION-DE-INGRESOS.md): 4 correos sobre el estado `past_due`,
 * tono servicial, nunca acusatorio (el cliente no falló a propósito, fue la tarjeta). El enlace
 * lleva al panel de comprador de Hotmart, donde SÍ se puede actualizar el método de pago (la app
 * no procesa pagos). */
const ENLACE_ACTUALIZAR_PAGO = 'https://sac.hotmart.com/';

export function correoDunning(nombre: string, dia: 1 | 3 | 5 | 7): CorreoAccesoNuevo {
  const primerNombre = nombre.split(' ')[0] || 'Hola';
  const variantes: Record<1 | 3 | 5 | 7, { asunto: string; preheader: string; cuerpo: string }> = {
    1: {
      asunto: `${primerNombre}, no pudimos procesar tu pago`,
      preheader: 'Suele ser la tarjeta — un clic y lo resuelves.',
      cuerpo: `No pudimos cobrar tu suscripción Starter. Lo más común es que la tarjeta esté vencida
        o sin el límite disponible. Tu cuenta sigue activa por ahora — solo actualiza tu método de
        pago y seguimos sin interrupciones.`,
    },
    3: {
      asunto: `${primerNombre}, tu cuenta Starter sigue esperando el pago`,
      preheader: 'Sin esto, en unos días vuelves al plan Gratis (10 trabajadores).',
      cuerpo: `Todavía no logramos procesar tu pago de Starter. Si esto sigue así, tu cuenta vuelve
        al plan Gratis y pierdes el cupo de 50 trabajadores y la búsqueda ilimitada. Actualiza tu
        método de pago para seguir como estás ahora.`,
    },
    5: {
      asunto: `${primerNombre}, tu acceso Starter se suspende en 2 días`,
      preheader: 'Un clic y mantienes todo tal como está.',
      cuerpo: `En 2 días tu cuenta pasa a Gratis si no logramos cobrar tu suscripción. Actualiza tu
        método de pago ahora y no pierdes nada de lo que ya armaste en tu libreta.`,
    },
    7: {
      asunto: `${primerNombre}, hoy es el último día antes de suspender tu Starter`,
      preheader: 'Después de hoy, tu cuenta vuelve a Gratis automáticamente.',
      cuerpo: `Último aviso: hoy es el día antes de que tu cuenta pase a Gratis por falta de pago.
        Actualiza tu método ahora si quieres seguir con hasta 50 trabajadores y búsqueda ilimitada.`,
    },
  };
  const v = variantes[dia];
  return {
    asunto: v.asunto,
    preheader: v.preheader,
    html: envoltura(`
      <p style="color:${TEXTO};font-size:17px;margin:0 0 12px;">Hola ${primerNombre},</p>
      <p style="color:${TEXTO};font-size:15px;line-height:1.5;margin:0 0 20px;">${v.cuerpo}</p>
      <div style="text-align:center;margin:24px 0;">
        ${boton('Actualizar mi método de pago →', ENLACE_ACTUALIZAR_PAGO)}
      </div>
      <p style="color:${TEXTO_SECUNDARIO};font-size:13px;line-height:1.5;margin:0;">
        Se actualiza en tu panel de comprador de Hotmart, con el mismo correo con el que compraste.
      </p>
    `),
  };
}

/** Win-back (58-RETENCION-DE-INGRESOS.md): 3 correos a los 30/60/90 días de cancelar. Sin
 * descuento inventado — solo la invitación honesta a volver (el precio real ya está en /paywall). */
export function correoWinback(nombre: string, dia: 30 | 60 | 90): CorreoAccesoNuevo {
  const primerNombre = nombre.split(' ')[0] || 'Hola';
  const variantes: Record<30 | 60 | 90, { asunto: string; preheader: string; cuerpo: string }> = {
    30: {
      asunto: `${primerNombre}, tu libreta de Jornivo te sigue esperando`,
      preheader: 'Tus trabajadores y su historial siguen ahí, tal como los dejaste.',
      cuerpo: `Cancelaste hace un mes, pero tu libreta de trabajadores, sus calificaciones y su
        historial siguen guardados en Jornivo. Si quieres volver a tener disponibilidad en tiempo
        real sin llamar a nadie, tu cuenta está lista para reactivarse cuando quieras.`,
    },
    60: {
      asunto: `${primerNombre}, ¿cómo estás organizando tu cuadrilla ahora?`,
      preheader: 'Si volviste a las llamadas uno por uno, Jornivo sigue aquí.',
      cuerpo: `Han pasado 2 meses desde que cancelaste. Si volviste a organizar tu cuadrilla a mano
        o por WhatsApp, tu libreta en Jornivo sigue intacta — todo tu historial de trabajadores está
        guardado, listo para retomarlo en el momento que quieras.`,
    },
    90: {
      asunto: `${primerNombre}, último aviso antes de archivar tu libreta`,
      preheader: 'Tus datos siguen guardados — te avisamos antes de archivarlos.',
      cuerpo: `Han pasado 3 meses desde tu cancelación. Tu libreta de trabajadores sigue guardada,
        pero queremos avisarte con tiempo: si no vuelves a activar tu cuenta, en algún momento
        vamos a archivar los datos inactivos. Si quieres seguir usando Jornivo, tu cuenta te espera.`,
    },
  };
  const v = variantes[dia];
  return {
    asunto: v.asunto,
    preheader: v.preheader,
    html: envoltura(`
      <p style="color:${TEXTO};font-size:17px;margin:0 0 12px;">Hola ${primerNombre},</p>
      <p style="color:${TEXTO};font-size:15px;line-height:1.5;margin:0 0 20px;">${v.cuerpo}</p>
      <div style="text-align:center;margin:24px 0;">
        ${boton('Volver a Jornivo →', 'https://jornivo.app/paywall')}
      </div>
    `),
  };
}

/** Cuenta que YA existía (modelo gratis→onboarding→paywall) y acaba de subir a Starter — no es
 * un correo de acceso (ya tenía), es la confirmación de que el pago se aplicó. */
export function correoConfirmacionStarter(nombre: string): CorreoAccesoNuevo {
  const primerNombre = nombre.split(' ')[0] || 'Hola';
  return {
    asunto: `${primerNombre}, ya eres Starter en Jornivo`,
    preheader: 'Tu pago se confirmó — hasta 50 trabajadores y búsqueda ilimitada, ya activos.',
    html: envoltura(`
      <p style="color:${TEXTO};font-size:17px;margin:0 0 12px;">Hola ${primerNombre},</p>
      <p style="color:${TEXTO};font-size:15px;line-height:1.5;margin:0 0 20px;">
        Tu pago se confirmó. Tu cuenta ya pasó a <strong>Starter</strong>: hasta 50 trabajadores en
        tu libreta y búsqueda sin límite. Entra con tu cuenta de siempre, ya está activo.
      </p>
      <div style="text-align:center;margin:24px 0;">
        ${boton('Abrir Jornivo →', 'https://jornivo.app/login')}
      </div>
      <p style="color:${TEXTO_SECUNDARIO};font-size:13px;line-height:1.5;margin:0;">
        Cancelas cuando quieras desde tu panel de comprador de Hotmart, sin permanencia.
      </p>
    `),
  };
}
