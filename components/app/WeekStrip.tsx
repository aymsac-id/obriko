'use client';

// Dispositivo ownable de FICHA-ARTE.md: "franja de disponibilidad semanal en 7 barritas".
// Primera implementación real (pendiente desde la landing/paywall) — el lugar correcto es
// aquí, la pantalla de buscador, donde la disponibilidad es el dato que decide la búsqueda.
// Cada barrita crece al montar (motion signature: nada estático en la pantalla protagonista).

import { motion, useReducedMotion } from 'motion/react';
import { getProximosDias } from '@/lib/data/fechas';
import type { EstadoDisponibilidad } from '@/lib/data/trabajadores';

export default function WeekStrip({
  disponibilidad,
  compacto = false,
}: {
  disponibilidad: Record<string, EstadoDisponibilidad>;
  compacto?: boolean;
}) {
  const reduce = useReducedMotion();
  const dias = getProximosDias(7);
  const alto = compacto ? 16 : 28;
  const primerMes = dias[0]?.mesCorto ?? '';

  return (
    <span
      className={compacto ? 'inline-flex flex-wrap items-end gap-1' : 'inline-flex items-end gap-2'}
      role="img"
      aria-label={`Disponibilidad del ${dias[0]?.diaCorto} ${dias[0]?.diaNumero} de ${primerMes} al ${dias[6]?.diaCorto} ${dias[6]?.diaNumero}`}
    >
      {dias.map((d, i) => {
        const estado = disponibilidad[d.iso] ?? 'consultar';
        const color =
          estado === 'disponible'
            ? 'var(--success)'
            : estado === 'ocupado'
              ? 'var(--danger)'
              : 'color-mix(in oklab, var(--text-tertiary) 45%, transparent)';
        const mesCambio = i > 0 && d.mesCorto !== dias[i - 1]?.mesCorto;
        return (
          <span key={d.iso} className="flex flex-col items-center gap-1">
            <motion.span
              title={`${d.diaCorto} ${d.diaNumero} ${d.mesCorto}: ${estado}`}
              initial={{ height: reduce ? alto : 0 }}
              animate={{ height: alto }}
              transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.035, ease: [0.16, 1, 0.3, 1] }}
              className={compacto ? 'w-[4px] rounded-full' : 'w-2 rounded-full'}
              style={{ backgroundColor: color }}
            />
            {compacto ? (
              // Apilado (letra arriba, número abajo) en vez de "Ju/5" en una sola línea — mismo
              // ancho angosto de columna, pero sin perder la fecha (pedido explícito del usuario:
              // "tanto en fecha como en día").
              <span
                className="flex flex-col items-center leading-none font-semibold"
                style={{ color: d.esHoy ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                <span className="text-[9px]">{d.diaDosLetras}</span>
                <span className="text-[9px] tabular-nums">{d.diaNumero}</span>
              </span>
            ) : (
              <span
                className="text-xs leading-tight font-semibold"
                style={{ color: d.esHoy ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                {`${d.diaCorto}/${d.diaNumero}`}
                {(i === 0 || mesCambio) && <span className="block font-normal">{d.mesCorto}</span>}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
