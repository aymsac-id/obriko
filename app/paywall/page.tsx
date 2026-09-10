'use client';

// Paywall de Jornivo — Sesión 4. Modelo onboarding-first/freemium (ESTADO.md): esta
// pantalla es una INVITACIÓN tras vivir el valor, nunca un bloqueo — el CTA principal
// siempre puede seguir gratis. Estructura de 50-DISENO-ONBOARDING-PAYWALL.md §C adaptada
// (sin trial: no hay fecha de cobro que prometer todavía, ver C3ter "mockups honestos").
//
// Checkout real de Hotmart (Sesión 6.2, 18-VENTA-HOTMART.md): si YA hay sesión iniciada (el
// usuario llegó aquí desde Ajustes/"cupo lleno", no desde el onboarding de una cuenta nueva) y
// existe la URL de checkout del ciclo elegido, "Starter" abre el checkout real con su correo
// pre-llenado — así el webhook conecta la compra con SU cuenta ya creada, en vez de crear una
// segunda (el bug #1 de este modelo). Mientras el producto no exista en Hotmart (o el usuario
// todavía no tiene cuenta, camino de onboarding), sigue el flujo de siempre: se guarda la
// intención y se activa al crear la cuenta, sin cobro real.
//
// Plan anual (2026-09-10, pedido del usuario): mismo Starter, facturado una vez al año con
// descuento — precio decidido con el criterio estándar del sector ("paga 10 meses, usa 12"):
// S/390/año en vez de S/468 (12 × S/39). El total anual siempre visible en letra chica junto al
// precio mensual-equivalente grande (02C/19: transparencia obligatoria del checkout).
//
// Correcciones tras revisor-visual (docs/revisiones/paywall-veredicto.md, NO LISTA 31/40·14/20·14/20):
// PasoShell (profundidad) + onBack (control/libertad) + CTAs 1ª persona con la promesa junto al
// botón + whileTap en PlanCard + línea de agitación con la escena real del avatar antes del value stack.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, Sparkles, type LucideIcon } from 'lucide-react';
import { guardarEstadoOnboarding } from '@/lib/onboarding-storage';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { FunnelHeader, PasoShell, PrimaryCta, SecondaryCta, StepFooter, useStepReveal } from '@/components/onboarding/ui';
import { CheckCustom, Hairline, IconChip } from '@/components/landing/ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';

const BENEFICIOS = [
  'Búsqueda instantánea: filtra por oficio y ve quién está libre',
  'Calificar toma menos de un minuto y tu búsqueda de mañana mejora',
  'Marca quién está disponible en segundos, sin llamar a nadie',
];

export default function PaywallPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<'gratis' | 'starter'>('gratis');
  const [ciclo, setCiclo] = useState<'mensual' | 'anual'>('mensual');
  const [error, setError] = useState<string | null>(null);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const { contenedor, item } = useStepReveal(0.08);

  useEffect(() => {
    crearClienteSupabase()
      .auth.getUser()
      .then(({ data }) => setEmailUsuario(data.user?.email ?? null));
  }, []);

  function continuar() {
    const checkoutBase =
      ciclo === 'anual'
        ? process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL_ANUAL
        : process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL_MENSUAL;
    // Checkout real: solo si ya hay sesión (sabemos con qué cuenta conectar la compra) y el
    // producto ya existe en Hotmart. Si cualquiera falta, sigue el flujo de siempre (sin cobro).
    if (plan === 'starter' && checkoutBase && emailUsuario) {
      const url = new URL(checkoutBase);
      url.searchParams.set('email', emailUsuario);
      window.location.href = url.toString();
      return;
    }
    try {
      guardarEstadoOnboarding({ planElegido: plan });
      setError(null);
      router.push('/login');
    } catch {
      // localStorage lleno o modo privado — no seguimos con un estado a medio guardar.
      setError('No pudimos guardar tu plan. Revisa que tu navegador no esté en modo privado e intenta de nuevo.');
    }
  }

  return (
    <PasoShell>
      <FunnelHeader onBack={() => router.back()} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4">
        <motion.div variants={contenedor} initial="hidden" animate="visible">
          <motion.p variants={item} className="text-sm italic text-[var(--text-secondary)]">
            Son las 7 a.m., un maestro te avisa que no llega y la obra no puede esperar.
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-2 text-balance text-[32px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
          >
            <MarkedCopy text="Ya puedes saber [acento]en segundos[/acento] quién está libre" />
          </motion.h1>
          <motion.p variants={item} className="mt-2 text-sm text-[var(--text-secondary)]">
            Sigue gratis con hasta 10 trabajadores en tu cuadrilla — sin tarjeta.
          </motion.p>

          <motion.div variants={item} className="mt-5 flex flex-col gap-2.5">
            {BENEFICIOS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <CheckCustom />
                <span className="text-base leading-snug text-[var(--text-primary)]">{b}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={item} className="mt-6 flex flex-col gap-3">
            <PlanCard
              nombre="Gratis"
              badge="TU PLAN AHORA"
              precio="S/0"
              detalle="Hasta 10 trabajadores · búsqueda y disponibilidad incluidas"
              seleccionado={plan === 'gratis'}
              onSelect={() => setPlan('gratis')}
            />
            <PlanCard
              nombre="Starter"
              badge="CUANDO CREZCAS"
              precio={ciclo === 'anual' ? 'S/32.50/mes' : 'S/39/mes'}
              detalle="Hasta 50 trabajadores · sin permanencia"
              notaPrecio={ciclo === 'anual' ? 'Se cobra S/390 una vez al año' : undefined}
              seleccionado={plan === 'starter'}
              onSelect={() => setPlan('starter')}
              icon={Sparkles}
            />
            {plan === 'starter' ? (
              <div className="-mt-1 flex gap-2 self-start pl-1">
                <button
                  type="button"
                  onClick={() => setCiclo('mensual')}
                  aria-pressed={ciclo === 'mensual'}
                  className={`h-8 rounded-full px-3 text-[13px] font-semibold [touch-action:manipulation] ${
                    ciclo === 'mensual' ? 'bg-[var(--chip-bg)] text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setCiclo('anual')}
                  aria-pressed={ciclo === 'anual'}
                  className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold [touch-action:manipulation] ${
                    ciclo === 'anual' ? 'bg-[var(--chip-bg)] text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  Anual
                  <span className="rounded-[6px] bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-bold uppercase text-[var(--bg)]">
                    2 meses gratis
                  </span>
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      </div>
      <StepFooter>
        {error ? (
          <p role="alert" className="text-center text-[13px] font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : null}
        {plan === 'gratis' ? (
          <>
            <PrimaryCta onClick={continuar}>Quiero seguir gratis</PrimaryCta>
            <p className="text-center text-[12px] text-[var(--text-tertiary)]">
              Cancelas cuando quieras, sin letra chica · Tus datos son solo tuyos
            </p>
          </>
        ) : (
          <>
            <PrimaryCta onClick={continuar}>Quiero crecer con Starter</PrimaryCta>
            <p className="text-center text-[12px] text-[var(--text-tertiary)]">
              Cancelas cuando quieras, sin letra chica · sin permanencia
            </p>
            <SecondaryCta onClick={() => setPlan('gratis')}>Prefiero seguir gratis por ahora</SecondaryCta>
          </>
        )}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[12px] text-[var(--text-tertiary)]">
          <Lock size={13} aria-hidden="true" />
          Pago seguro cuando decidas crecer
        </div>
      </StepFooter>
    </PasoShell>
  );
}

function PlanCard({
  nombre,
  badge,
  precio,
  detalle,
  notaPrecio,
  seleccionado,
  onSelect,
  icon,
}: {
  nombre: string;
  badge: string;
  precio: string;
  detalle: string;
  /** Total real cuando el precio grande es un promedio mensual (ej. plan anual) — transparencia
   * obligatoria del checkout (02C/19): nunca mostrar solo el "por mes" de un cobro anual. */
  notaPrecio?: string;
  seleccionado: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
}) {
  const contenido = (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      aria-pressed={seleccionado}
      className={`relative flex w-full items-start gap-3 rounded-[var(--radius-card)] px-4 py-4 text-left transition-colors ${
        seleccionado ? 'bg-[var(--chip-bg)]' : 'bg-[var(--surface)]'
      }`}
    >
      <span className="absolute -top-2.5 left-4 rounded-[8px] bg-[var(--accent)] px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--bg)]">
        {badge}
      </span>
      {icon ? <IconChip icon={icon} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-semibold">{nombre}</p>
          <p className="tabular-nums text-lg font-bold text-[var(--accent)]">{precio}</p>
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{detalle}</p>
        {notaPrecio ? <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">{notaPrecio}</p> : null}
      </div>
    </motion.button>
  );

  if (!seleccionado) return <div className="mt-2.5">{contenido}</div>;

  return (
    <Hairline emphasis className="mt-2.5">
      {contenido}
    </Hairline>
  );
}
