'use client';

// Card de la libreta (Mi Cuadrilla) — oficio, tarifa, obras juntos, teléfono y score.

import { motion } from 'motion/react';
import { Phone } from 'lucide-react';
import ScoreBadge from '@/components/app/ScoreBadge';
import { iniciales, type Trabajador } from '@/lib/data/trabajadores';

export default function TrabajadorCard({ trabajador, onClick }: { trabajador: Trabajador; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-3.5 py-3 text-left [touch-action:manipulation]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[15px] font-bold [font-family:var(--font-heading-name)]">
        {iniciales(trabajador.nombre)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold [font-family:var(--font-heading-name)]">
          {trabajador.nombre}
        </span>
        <span className="block text-[13px] text-[var(--text-secondary)]">
          {trabajador.oficio} · S/ {trabajador.tarifaDia}/día ·{' '}
          {trabajador.obrasJuntos === 1 ? '1 obra contigo' : `${trabajador.obrasJuntos} obras contigo`}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--text-tertiary)]">
          <Phone size={11} aria-hidden="true" /> {trabajador.telefono}
        </span>
      </span>
      <ScoreBadge score={trabajador.confiabilidad} />
    </motion.button>
  );
}
