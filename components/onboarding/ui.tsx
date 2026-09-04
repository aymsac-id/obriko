'use client';

// KIT DEL FUNNEL — onboarding/paywall/login comparten estas piezas (50-DISENO-ONBOARDING-PAYWALL.md).
// Reusa los tokens de components/landing/tokens.css (ya importados globalmente en app/globals.css)
// y los componentes premium del kit de landing (Hairline, CheckCustom, IconChip) — misma identidad,
// nunca un sistema visual paralelo.

import { ChevronLeft } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLockup } from '@/components/LogoMark';

/* ── <FunnelHeader> — logo + nombre (vuelve a "/") + atrás opcional + barra de progreso.
   Regla de marca de 50: SIEMPRE visible en onboarding/paywall/login; el usuario nunca se
   siente en una pantalla anónima. ── */
export function FunnelHeader({
  onBack,
  progreso,
}: {
  onBack?: () => void;
  /** 0-100. Si se omite, no se muestra barra (pantallas de paywall/login). */
  progreso?: number;
}) {
  return (
    <header className="mx-auto w-full max-w-md px-4 pt-4">
      <div className="flex h-11 items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a la pregunta anterior"
            className="-ml-2 flex size-11 shrink-0 items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ChevronLeft size={22} strokeWidth={2.25} aria-hidden="true" />
          </button>
        ) : null}
        <Link
          href="/"
          aria-label="Obriko — salir al inicio"
          className="flex items-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <BrandLockup size={32} />
        </Link>
        {!onBack ? (
          <Link
            href="/"
            className="ml-2 text-[12px] font-medium text-[var(--text-tertiary)] underline-offset-2 transition-colors hover:text-[var(--text-secondary)] hover:underline"
          >
            Salir
          </Link>
        ) : null}
        {typeof progreso === 'number' ? (
          <span className="ml-auto tabular-nums text-[12px] font-semibold text-[var(--text-tertiary)]">
            {Math.round(progreso)}%
          </span>
        ) : null}
      </div>
      {typeof progreso === 'number' ? (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            initial={false}
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      ) : null}
    </header>
  );
}

/* ── <PasoShell> — contenedor centrado 480px máx, fondo con profundidad (2 radiales),
   min-h-dvh, safe-area abajo para el CTA fijo.
   Intensidad subida tras revisor-visual (docs/revisiones/onboarding-veredicto.md, craft
   profundidad 1/4: "se lee como fondo plano") — de 10% a 20% de acento arriba-derecha, más
   un segundo radial neutro abajo-izquierda para separar el fondo de las superficies. ── */
export function PasoShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]"
      style={{
        backgroundImage:
          'radial-gradient(620px 380px at 88% -10%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 62%), ' +
          'radial-gradient(520px 320px at -10% 100%, color-mix(in oklab, var(--text-tertiary) 14%, transparent), transparent 60%)',
      }}
    >
      {children}
    </div>
  );
}

/* ── <PrimaryCta> — botón 52-56px, ancho completo, acento pleno, fijo al fondo del paso. ── */
export function PrimaryCta({
  children,
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[16px] font-semibold text-[var(--bg)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_25%,transparent)] transition-opacity duration-150 [touch-action:manipulation] ${
        disabled ? 'opacity-50' : 'hover:bg-[color-mix(in_oklab,var(--accent)_88%,var(--text-primary))]'
      }`}
    >
      {children}
    </motion.button>
  );
}

/* ── <SecondaryCta> — borde neutro, para acciones secundarias (Google, "empezar con Starter"). ── */
export function SecondaryCta({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    'flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-6 text-[16px] font-semibold text-[var(--text-primary)] transition-colors [touch-action:manipulation] hover:bg-[var(--surface-2)]';
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.98 }} className={className}>
      {children}
    </motion.button>
  );
}

/* ── <StepFooter> — CTA(s) fijos abajo con safe-area, gap 12px entre botones. ── */
export function StepFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

/* ── useStepReveal — entrada stagger top-down de un paso (headline → cuerpo → CTA). ── */
export function useStepReveal(stagger = 0.07): { contenedor: Variants; item: Variants } {
  const reduce = useReducedMotion();
  return {
    contenedor: { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : stagger } } },
    item: {
      hidden: { opacity: 0, y: reduce ? 0 : 16 },
      visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.35, ease: [0.16, 1, 0.3, 1] } },
    },
  };
}

/* ── <ChipOpcion> — chip de selección múltiple tipo toggle (paso 3: marcar confiables). ── */
export function ChipOpcion({
  seleccionado,
  onToggle,
  children,
}: {
  seleccionado: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      aria-pressed={seleccionado}
      className={`flex w-full items-center justify-between rounded-[var(--radius-card)] border px-4 py-3.5 text-left transition-colors ${
        seleccionado
          ? 'border-[color-mix(in_oklab,var(--accent)_70%,transparent)] bg-[var(--chip-bg)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)]'
      }`}
    >
      {children}
    </motion.button>
  );
}
