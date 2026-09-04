'use client';

// PASO 3 — Marcar confiables. Micro-compromiso de personalización (24: siembra el loop de
// retención — "el historial y la calificación por trabajador mejoran la búsqueda de mañana").
// Selección múltiple con CTA fijo (50 A3): nunca auto-avanza, el usuario decide cuándo.

import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { CUADRILLA_SEMILLA } from './data';
import { ChipOpcion, FunnelHeader, PrimaryCta, StepFooter, useStepReveal } from './ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';

const MINIMO = 3;

export function Paso3Marcar({
  confiables,
  onCambiar,
  onContinuar,
  onAtras,
}: {
  confiables: string[];
  onCambiar: (ids: string[]) => void;
  onContinuar: () => void;
  onAtras: () => void;
}) {
  const { contenedor, item } = useStepReveal(0.04);

  function toggle(id: string) {
    onCambiar(confiables.includes(id) ? confiables.filter((c) => c !== id) : [...confiables, id]);
  }

  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <FunnelHeader onBack={onAtras} progreso={55} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-4 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-balance text-[24px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
        >
          <MarkedCopy text="¿Quiénes son tus más [acento]confiables[/acento]?" />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-2 text-sm text-[var(--text-secondary)]"
        >
          Marca al menos 3 — los priorizamos primero en tus búsquedas. Elige todas las que apliquen.
        </motion.p>

        <motion.div variants={contenedor} initial="hidden" animate="visible" className="mt-6 flex flex-col gap-2">
          {CUADRILLA_SEMILLA.map((t) => {
            const marcado = confiables.includes(t.id);
            return (
              <motion.div key={t.id} variants={item}>
                <ChipOpcion seleccionado={marcado} onToggle={() => toggle(t.id)}>
                  <span className="flex flex-col">
                    <span className="text-base font-medium">{t.nombre}</span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {t.oficio} · {t.obrasJuntos} {t.obrasJuntos === 1 ? 'obra contigo' : 'obras contigo'}
                    </span>
                  </span>
                  <Star
                    size={20}
                    strokeWidth={2}
                    fill={marcado ? 'var(--accent)' : 'none'}
                    color={marcado ? 'var(--accent)' : 'var(--text-tertiary)'}
                    aria-hidden="true"
                  />
                </ChipOpcion>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <StepFooter>
        {confiables.length < MINIMO ? (
          <p className="text-center text-[12px] text-[var(--text-tertiary)]">
            Elige {MINIMO - confiables.length} más para continuar
          </p>
        ) : null}
        <PrimaryCta onClick={onContinuar} disabled={confiables.length < MINIMO}>
          Continuar
        </PrimaryCta>
      </StepFooter>
    </div>
  );
}
