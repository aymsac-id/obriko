'use client';

// PASO 2 — Importar cuadrilla. Es la fricción real e inevitable del reporte de validación
// ("la app está vacía al inicio"). Se resuelve con importación REAL (Sesión 5): Excel/CSV
// parseado con `xlsx` o Contact Picker del teléfono (components/app/ImportarTrabajadoresSheet.tsx,
// modo "pantalla") — cada trabajador que Carlos importa aquí queda de verdad en su libreta
// (lib/data/trabajadores.ts), no es una simulación (32: nunca app vacía + dato real).

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FunnelHeader, PrimaryCta, StepFooter, useStepReveal } from './ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';
import ImportarTrabajadoresSheet from '@/components/app/ImportarTrabajadoresSheet';
import type { NuevoTrabajadorInput } from '@/lib/data/trabajadores';
import { leerEstadoOnboarding, guardarEstadoOnboarding } from '@/lib/onboarding-storage';

export function Paso2Importar({
  onContinuar,
  onAtras,
}: {
  onContinuar: () => void;
  onAtras: () => void;
}) {
  const [importados, setImportados] = useState<NuevoTrabajadorInput[] | null>(null);
  const { contenedor, item } = useStepReveal();

  const porOficio = importados
    ? Object.entries(
        importados.reduce<Record<string, number>>((acc, t) => {
          acc[t.oficio] = (acc[t.oficio] ?? 0) + 1;
          return acc;
        }, {})
      )
    : [];

  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <FunnelHeader onBack={onAtras} progreso={25} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-4 pt-6 pb-4">
        <motion.div variants={contenedor} initial="hidden" animate="visible">
          <motion.h1
            variants={item}
            className="text-balance text-[32px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
          >
            <MarkedCopy text="Importa tu [acento]cuadrilla[/acento]" />
          </motion.h1>
          <motion.p variants={item} className="mt-3 text-[length:var(--text-body)] leading-relaxed text-[var(--text-secondary)]">
            Sube tus contactos de Excel o del teléfono. Nosotros los organizamos por oficio.
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {importados === null ? (
            <motion.div
              key="importar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 flex min-h-0 flex-1 flex-col"
            >
              <ImportarTrabajadoresSheet
                modo="pantalla"
                plan={leerEstadoOnboarding().planElegido ?? 'gratis'}
                totalActual={0}
                onImportado={async (nuevos) => {
                  guardarEstadoOnboarding({ trabajadoresImportados: nuevos });
                  setImportados(nuevos);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="listo"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <p className="text-[length:var(--text-body)] font-semibold text-[var(--accent)]">
                Listo — {importados.length}{' '}
                {importados.length === 1 ? 'trabajador organizado' : 'trabajadores organizados'}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {porOficio.map(([oficio, cantidad], i) => (
                  <motion.div
                    key={oficio}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] px-4 py-3"
                  >
                    <span className="text-[length:var(--text-body)] font-medium">{oficio}</span>
                    <span className="rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[length:var(--text-small)] font-semibold tabular-nums text-[var(--accent)]">
                      {cantidad}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <StepFooter>
        <PrimaryCta onClick={onContinuar} disabled={importados === null}>
          Continuar
        </PrimaryCta>
      </StepFooter>
    </div>
  );
}
