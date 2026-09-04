'use client';

// Editor de disponibilidad semanal desde la ficha del trabajador. Tocar un día rota
// disponible → ocupado → consultar. Respaldo manual del dueño — el trabajador también puede
// marcarla él mismo sin login desde EnlaceDisponibilidad.tsx / app/disponibilidad/[token].

import { getProximosDias } from '@/lib/data/fechas';
import { setDisponibilidad, type EstadoDisponibilidad } from '@/lib/data/trabajadores';

const ORDEN: EstadoDisponibilidad[] = ['disponible', 'ocupado', 'consultar'];
const ETIQUETA: Record<EstadoDisponibilidad, string> = {
  disponible: 'Libre',
  ocupado: 'Ocupado',
  consultar: '¿?',
};

export default function DisponibilidadEditor({
  trabajadorId,
  disponibilidad,
  onCambio,
}: {
  trabajadorId: string;
  disponibilidad: Record<string, EstadoDisponibilidad>;
  onCambio: () => void;
}) {
  const dias = getProximosDias(7);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {dias.map((d) => {
        const estado = disponibilidad[d.iso] ?? 'consultar';
        const color =
          estado === 'disponible' ? 'var(--success)' : estado === 'ocupado' ? 'var(--danger)' : 'var(--warning)';
        return (
          <button
            key={d.iso}
            type="button"
            onClick={() => {
              const siguiente = ORDEN[(ORDEN.indexOf(estado) + 1) % ORDEN.length] ?? 'disponible';
              setDisponibilidad(trabajadorId, d.iso, siguiente);
              onCambio();
            }}
            style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
            className="flex flex-col items-center gap-1 rounded-[var(--radius-button)] py-2 [touch-action:manipulation]"
            aria-label={`${d.diaCorto} ${d.diaNumero}: ${ETIQUETA[estado]}. Toca para cambiar.`}
          >
            <span className="text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">{d.diaCorto}</span>
            <span className="text-[13px] font-bold" style={{ color }}>
              {d.diaNumero}
            </span>
            <span className="text-[9px] font-semibold" style={{ color }}>
              {ETIQUETA[estado]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
