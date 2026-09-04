'use client';

// Fila de resultado del buscador — "Comando de Búsqueda" (dirección B elegida): dot de
// estado en vivo, franja semanal, score de confiabilidad, y modo selección para "Armar
// cuadrilla".

import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import ScoreBadge from '@/components/app/ScoreBadge';
import WeekStrip from '@/components/app/WeekStrip';
import { iniciales, type Trabajador } from '@/lib/data/trabajadores';

const ESTADO_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  consultar: 'Hay que consultarle',
};

export default function TrabajadorRow({
  trabajador,
  fechaIso,
  seleccionado,
  modoSeleccion,
  onToggleSeleccion,
  onAbrir,
  indice = 0,
}: {
  trabajador: Trabajador;
  fechaIso: string;
  seleccionado: boolean;
  modoSeleccion: boolean;
  onToggleSeleccion: () => void;
  onAbrir: () => void;
  /** Posición en la lista — alimenta el stagger de entrada (14: la mejora más barata). */
  indice?: number;
}) {
  const estadoHoy = trabajador.disponibilidad[fechaIso] ?? 'consultar';
  const colorEstado =
    estadoHoy === 'disponible' ? 'var(--success)' : estadoHoy === 'ocupado' ? 'var(--danger)' : 'var(--warning)';

  return (
    <motion.button
      type="button"
      onClick={modoSeleccion ? onToggleSeleccion : onAbrir}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(indice, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.985 }}
      aria-pressed={modoSeleccion ? seleccionado : undefined}
      className={`flex w-full items-center gap-3 rounded-[var(--radius-card)] border px-3.5 py-3.5 text-left shadow-[var(--shadow-1)] transition-colors [touch-action:manipulation] ${
        seleccionado
          ? 'border-[color-mix(in_oklab,var(--accent)_65%,transparent)] bg-[var(--chip-bg)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)]'
      }`}
    >
      <span className="relative shrink-0">
        <span className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[14px] font-bold [font-family:var(--font-heading-name)]">
          {iniciales(trabajador.nombre)}
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-[var(--surface)]"
          style={{ backgroundColor: colorEstado }}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold leading-tight [font-family:var(--font-heading-name)]">
          {trabajador.nombre}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-[var(--text-secondary)]">
          <MapPin size={11} aria-hidden="true" />
          {trabajador.ubicacion} · {ESTADO_LABEL[estadoHoy]}
        </span>
        <span className="mt-1.5 block">
          <WeekStrip disponibilidad={trabajador.disponibilidad} compacto />
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-center gap-2">
        <ScoreBadge score={trabajador.confiabilidad} size="sm" />
        {modoSeleccion ? (
          <span
            aria-hidden="true"
            className={`flex size-5 items-center justify-center rounded-[6px] border-2 ${
              seleccionado
                ? 'border-[var(--accent)] bg-[var(--accent)]'
                : 'border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]'
            }`}
          >
            {seleccionado ? <CheckMini /> : null}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

function CheckMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2 5 8.6 9.5 3.4" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
