'use client';

// Gráfico de tendencia — principio Tufte (17-VISUALIZACION-DATOS.md): máximo dato, mínima
// tinta. Sin rejilla de fondo, sin 3D, un solo color (el acento de marca), eje mínimo.

import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PuntoSerieDiaria } from '@/lib/data/admin';

export default function TendenciaCuentas({ datos }: { datos: PuntoSerieDiaria[] }) {
  const total = datos.reduce((acc, d) => acc + d.total, 0);

  if (total === 0) {
    return <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">Sin datos en este período.</p>;
  }

  const conEtiqueta = datos.map((d) => ({
    ...d,
    etiqueta: new Date(`${d.fecha}T00:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={conEtiqueta} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="tendenciaCuentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="etiqueta"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            interval={Math.ceil(conEtiqueta.length / 6)}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-2)',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value) => [value, 'Cuentas nuevas'] as [number, string]}
          />
          <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} fill="url(#tendenciaCuentas)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
