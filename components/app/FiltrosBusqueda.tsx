'use client';

// Panel de filtros "siempre a mano arriba" (dirección B, Comando de Búsqueda): oficio,
// cuándo y confiabilidad mínima. Sticky para uso rápido todos los días (15: next-best-action).
// "Cuándo lo necesitas" admite un día suelto o un RANGO (obras de varios días, pedido explícito
// del usuario) — en modo rango, solo cuenta como disponible quien puede TODOS los días del rango.

import { ChevronDown } from 'lucide-react';
import { OFICIOS, type Oficio } from '@/components/onboarding/data';
import { etiquetaDia, getProximosDias } from '@/lib/data/fechas';

const HORIZONTE_DIAS = 14;

export default function FiltrosBusqueda({
  oficio,
  onOficio,
  fechaIso,
  onFecha,
  fechaHastaIso,
  onFechaHasta,
  confiabilidadMin,
  onConfiabilidadMin,
}: {
  oficio: Oficio | 'todos';
  onOficio: (o: Oficio | 'todos') => void;
  fechaIso: string;
  onFecha: (f: string) => void;
  /** null = un solo día (fechaIso). Con valor = rango [fechaIso, fechaHastaIso] inclusive. */
  fechaHastaIso: string | null;
  onFechaHasta: (f: string | null) => void;
  confiabilidadMin: number;
  onConfiabilidadMin: (n: number) => void;
}) {
  const dias = getProximosDias(HORIZONTE_DIAS);
  const progreso = Math.round((confiabilidadMin / 95) * 100);
  const modoRango = fechaHastaIso !== null;
  const diasDesdeInicio = dias.filter((d) => d.iso >= fechaIso);

  return (
    <div className="sticky top-0 z-20 border-b border-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)] bg-[var(--surface)] px-4 pb-4 pt-3 shadow-[var(--shadow-1)] backdrop-blur">
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(['todos', ...OFICIOS] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onOficio(o)}
            aria-pressed={oficio === o}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors [touch-action:manipulation] ${
              oficio === o
                ? 'border-transparent bg-[var(--accent)] text-[var(--bg)]'
                : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] text-[var(--text-secondary)]'
            }`}
          >
            {o === 'todos' ? 'Todos los oficios' : o}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[var(--text-secondary)]">Cuándo lo necesitas</span>
        <div className="flex gap-1 rounded-full bg-[var(--surface-2)] p-0.5">
          <button
            type="button"
            onClick={() => onFechaHasta(null)}
            aria-pressed={!modoRango}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold [touch-action:manipulation] ${
              !modoRango ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            Un día
          </button>
          <button
            type="button"
            onClick={() => onFechaHasta(dias.find((d) => d.iso > fechaIso)?.iso ?? fechaIso)}
            aria-pressed={modoRango}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold [touch-action:manipulation] ${
              modoRango ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            Un rango
          </button>
        </div>
      </div>

      <div className={`mt-1.5 grid gap-2 ${modoRango ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <label className="flex flex-col gap-1">
          {modoRango ? <span className="text-[11px] text-[var(--text-tertiary)]">Desde</span> : null}
          <span className="relative block">
            <select
              value={fechaIso}
              onChange={(e) => {
                onFecha(e.target.value);
                if (fechaHastaIso && e.target.value > fechaHastaIso) onFechaHasta(e.target.value);
              }}
              className="h-11 w-full appearance-none rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] px-3 pr-10 text-[14px] font-medium text-[var(--text-primary)]"
            >
              {dias.map((d) => (
                <option key={d.iso} value={d.iso}>
                  {etiquetaDia(d.iso, dias)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              color="var(--text-tertiary)"
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </span>
        </label>

        {modoRango ? (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-[var(--text-tertiary)]">Hasta</span>
            <span className="relative block">
              <select
                value={fechaHastaIso ?? fechaIso}
                onChange={(e) => onFechaHasta(e.target.value)}
                className="h-11 w-full appearance-none rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] px-3 pr-10 text-[14px] font-medium text-[var(--text-primary)]"
              >
                {diasDesdeInicio.map((d) => (
                  <option key={d.iso} value={d.iso}>
                    {etiquetaDia(d.iso, dias)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                color="var(--text-tertiary)"
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </span>
          </label>
        ) : null}
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--text-secondary)]">
          <span>Confiabilidad mínima</span>
          <span className="tabular-nums text-[var(--accent)]">{confiabilidadMin}+</span>
        </div>
        <input
          type="range"
          min={0}
          max={95}
          step={5}
          value={confiabilidadMin}
          onChange={(e) => onConfiabilidadMin(Number(e.target.value))}
          aria-label="Confiabilidad mínima"
          style={{
            background: `linear-gradient(to right, var(--accent) ${progreso}%, var(--surface-2) ${progreso}%)`,
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
        />
      </div>
    </div>
  );
}
