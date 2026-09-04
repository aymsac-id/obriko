'use client';

// Insignia de confiabilidad — se usa en el buscador, la libreta y la ficha del trabajador.
// Color semántico según el score (17: color con significado). Conteo ascendente al montar
// (motion signature de FICHA-ARTE.md: "transición de score con conteo ascendente").

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export default function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const reduce = useReducedMotion();
  const [valor, setValor] = useState(reduce ? score : 0);
  const color = score >= 85 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  const dim = size === 'sm' ? 'size-9 text-[13px]' : 'size-11 text-[15px]';

  useEffect(() => {
    if (reduce) {
      setValor(score);
      return;
    }
    let frame: number;
    const inicio = performance.now();
    const duracion = 500;
    const tick = (ahora: number) => {
      const progreso = Math.min(1, (ahora - inicio) / duracion);
      setValor(Math.round(score * (1 - (1 - progreso) ** 2)));
      if (progreso < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, reduce]);

  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full border-2 font-bold tabular-nums`}
      style={{ borderColor: color, color }}
      aria-label={`Confiabilidad ${score} de 100`}
    >
      {valor}
    </span>
  );
}
