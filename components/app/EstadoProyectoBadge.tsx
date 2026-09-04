'use client';

// Badge de estado de un proyecto (activo/pausado/terminado) — mismo criterio de color
// semántico que ScoreBadge/WeekStrip (17: color con significado).

import { ChevronDown } from 'lucide-react';
import type { EstadoProyecto } from '@/lib/data/proyectos';

const ESTADO_LABEL: Record<EstadoProyecto, string> = {
  activo: 'Activo',
  pausado: 'Pausado',
  terminado: 'Terminado',
};

const ESTADO_COLOR: Record<EstadoProyecto, string> = {
  activo: 'var(--success)',
  pausado: 'var(--warning)',
  terminado: 'var(--text-tertiary)',
};

export default function EstadoProyectoBadge({
  estado,
  interactivo = false,
}: {
  estado: EstadoProyecto;
  /** true cuando el badge es tocable (cicla el estado) — agrega el chevron de affordance. */
  interactivo?: boolean;
}) {
  const color = ESTADO_COLOR[estado];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {ESTADO_LABEL[estado]}
      {interactivo ? <ChevronDown size={13} aria-hidden="true" /> : null}
    </span>
  );
}
