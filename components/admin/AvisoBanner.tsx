// Banner de avisos automáticos del dueño (21-BACKOFFICE.md) — el panel no solo muestra, AVISA.
// Cada aviso: qué pasa → por qué importa → qué hacer, en lenguaje simple. Si no hay nada
// urgente, dice "Todo en orden" — también es información.

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export interface Aviso {
  nivel: 'critico' | 'atencion' | 'info';
  texto: string;
}

const ESTILO = {
  critico: { icono: AlertTriangle, color: 'var(--danger)' },
  atencion: { icono: AlertTriangle, color: 'var(--warning)' },
  info: { icono: Info, color: 'var(--text-tertiary)' },
} as const;

export default function AvisoBanner({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--success)_35%,transparent)] bg-[color-mix(in_oklab,var(--success)_10%,transparent)] px-4 py-3">
        <CheckCircle2 size={18} color="var(--success)" aria-hidden="true" />
        <p className="text-[14px] font-medium">Todo en orden este mes</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {avisos.map((aviso, i) => {
        const { icono: Icono, color } = ESTILO[aviso.nivel];
        return (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-[var(--radius-card)] px-4 py-3"
            style={{ backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)` }}
          >
            <Icono size={18} color={color} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-[14px] leading-snug text-[var(--text-primary)]">{aviso.texto}</p>
          </div>
        );
      })}
    </div>
  );
}
