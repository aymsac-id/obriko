'use client';

// Paywall de Obriko — Sesión 4. Modelo onboarding-first/freemium (ESTADO.md): esta
// pantalla es una INVITACIÓN tras vivir el valor, nunca un bloqueo — el CTA principal
// siempre puede seguir gratis. Estructura de 50-DISENO-ONBOARDING-PAYWALL.md §C adaptada
// (sin trial: no hay fecha de cobro que prometer todavía, ver C3ter "mockups honestos").
// TODO Sesión 6: conectar el botón de Starter/Pro al checkout real de Hotmart (18-VENTA-HOTMART.md).
//
// Correcciones tras revisor-visual (docs/revisiones/paywall-veredicto.md, NO LISTA 31/40·14/20·14/20):
// PasoShell (profundidad) + onBack (control/libertad) + CTAs 1ª persona con la promesa junto al
// botón + whileTap en PlanCard + línea de agitación con la escena real del avatar antes del value stack.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, Sparkles, type LucideIcon } from 'lucide-react';
import { guardarEstadoOnboarding } from '@/lib/onboarding-storage';
import { FunnelHeader, PasoShell, PrimaryCta, SecondaryCta, StepFooter, useStepReveal } from '@/components/onboarding/ui';
import { CheckCustom, Hairline, IconChip } from '@/components/landing/ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';

const BENEFICIOS = [
  'Búsqueda instantánea: filtra por oficio y ve quién está libre',
  'Calificar toma 10 segundos y tu búsqueda de mañana mejora',
  'Marca quién está disponible en segundos, sin llamar a nadie',
];

export default function PaywallPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<'gratis' | 'starter'>('gratis');
  const [error, setError] = useState<string | null>(null);
  const { contenedor, item } = useStepReveal(0.08);

  function continuar() {
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
              precio="S/39/mes"
              detalle="Hasta 50 trabajadores · sin permanencia"
              seleccionado={plan === 'starter'}
              onSelect={() => setPlan('starter')}
              icon={Sparkles}
            />
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
  seleccionado,
  onSelect,
  icon,
}: {
  nombre: string;
  badge: string;
  precio: string;
  detalle: string;
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
