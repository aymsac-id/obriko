'use client';

// PASO 4 — Resultado (el momento wow). Aquí Carlos SIENTE el mecanismo bautizado de la
// landing ("el Comando de Cuadrilla"): abre una búsqueda y ve, en segundos, quién de su
// gente confiable puede trabajar mañana — el deseo #1 exacto de FICHA-AVATAR.md.

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CircleCheck, MapPin, Search } from 'lucide-react';
import { trabajadoresConfiablesPrimero } from '@/lib/onboarding-storage';
import { FunnelHeader, PrimaryCta, StepFooter } from './ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';

export function Paso4Resultado({
  confiables,
  onContinuar,
  onAtras,
}: {
  confiables: string[];
  onContinuar: () => void;
  onAtras: () => void;
}) {
  const [buscando, setBuscando] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setBuscando(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  const disponibles = trabajadoresConfiablesPrimero(confiables)
    .filter((t) => t.disponibleManana && t.oficio === 'Albañil')
    .slice(0, 2);
  const resultado = disponibles.length > 0 ? disponibles : trabajadoresConfiablesPrimero(confiables).slice(0, 2);

  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <FunnelHeader onBack={onAtras} progreso={85} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-balance text-[24px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
        >
          <MarkedCopy text="Así de rápido sabrás quién está [acento]libre[/acento]" />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-sm text-[var(--text-secondary)]"
        >
          Probemos tu buscador: ¿quién puede trabajar mañana?
        </motion.p>

        <div className="mt-6 flex items-center gap-2 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 py-3">
          <Search size={18} color="var(--text-secondary)" aria-hidden="true" />
          <span className="text-base text-[var(--text-secondary)]">Albañil · disponible mañana</span>
        </div>

        <div className="mt-5 min-h-56">
          {buscando ? (
            <div className="flex flex-col gap-2" aria-live="polite" aria-busy="true">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
              <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">Buscando en tu cuadrilla…</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <p className="mb-3 text-base font-semibold text-[var(--accent)]">
                {resultado.length} albañiles disponibles mañana — ordenados por confianza
              </p>
              <div className="flex flex-col gap-2">
                {resultado.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.3 }}
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--chip-bg)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{t.nombre}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                        <MapPin size={13} aria-hidden="true" /> {t.obrasJuntos} obras contigo
                      </p>
                    </div>
                    <CircleCheck size={22} color="var(--success)" aria-hidden="true" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <StepFooter>
        <PrimaryCta onClick={onContinuar} disabled={buscando}>
          Ver mi plan
        </PrimaryCta>
      </StepFooter>
    </div>
  );
}
