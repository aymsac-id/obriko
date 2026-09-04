'use client';

// Card de la lista de Proyectos — nombre de la obra, ubicación, estado y un vistazo rápido
// de quién está asignado (avatares apilados, igual criterio visual que el resto de la app).

import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import EstadoProyectoBadge from '@/components/app/EstadoProyectoBadge';
import { iniciales, type Trabajador } from '@/lib/data/trabajadores';
import type { Proyecto } from '@/lib/data/proyectos';

export default function ProyectoCard({
  proyecto,
  cuadrilla,
  onClick,
}: {
  proyecto: Proyecto;
  cuadrilla: Trabajador[];
  onClick: () => void;
}) {
  const visibles = cuadrilla.slice(0, 4);
  const restantes = cuadrilla.length - visibles.length;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className="flex w-full flex-col gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-4 text-left shadow-[var(--shadow-1)] [touch-action:manipulation]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[16px] font-semibold leading-tight [font-family:var(--font-heading-name)]">
          {proyecto.nombre}
        </h3>
        <EstadoProyectoBadge estado={proyecto.estado} />
      </div>

      <p className="flex items-center gap-1 text-[12.5px] text-[var(--text-secondary)]">
        <MapPin size={12} aria-hidden="true" />
        {proyecto.ubicacion} · desde{' '}
        {new Date(`${proyecto.fechaInicio}T00:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
      </p>

      <div className="flex items-center justify-between">
        {cuadrilla.length === 0 ? (
          <span className="text-[12.5px] text-[var(--text-tertiary)]">Sin cuadrilla asignada todavía</span>
        ) : (
          <span className="flex items-center">
            <span className="flex -space-x-2">
              {visibles.map((t) => (
                <span
                  key={t.id}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-2)] text-[12px] font-bold [font-family:var(--font-heading-name)]"
                >
                  {iniciales(t.nombre)}
                </span>
              ))}
              {restantes > 0 ? (
                <span className="flex size-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--chip-bg)] text-[12px] font-bold text-[var(--accent)]">
                  +{restantes}
                </span>
              ) : null}
            </span>
            <span className="ml-2.5 text-[12.5px] font-medium text-[var(--text-secondary)]">
              {cuadrilla.length === 1 ? '1 trabajador' : `${cuadrilla.length} trabajadores`}
            </span>
          </span>
        )}
      </div>
    </motion.button>
  );
}
