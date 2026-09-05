// Ventas — estructura completa (21-BACKOFFICE.md + 40-UNIT-ECONOMICS.md) lista para cuando se
// conecte Hotmart. Hasta entonces, CADA número dice "Sin datos" — nunca una cifra inventada.
// El día que exista el webhook de Hotmart, estas mismas tarjetas se llenan solas.

import { Info } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

export default function AdminVentasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold [font-family:var(--font-display)]">Ventas</h1>
        <p className="text-[13px] text-[var(--text-secondary)]">Ingresos, ganancia real y la salud del negocio.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--chip-bg)] px-4 py-3">
        <Info size={18} color="var(--accent)" className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-[13px] leading-snug text-[var(--text-primary)]">
          Esta sección se llena sola en cuanto conectemos Hotmart (el webhook que avisa cuando alguien paga o cancela).
          Por ahora todo dice "Sin datos" a propósito — nunca se inventa una cifra de ventas.
        </p>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Ingresos y ganancia real
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard etiqueta="Ingresos del mes" valor="" sinDatos />
          <StatCard etiqueta="MRR" valor="" sinDatos />
          <StatCard etiqueta="Ganancia real" valor="" sinDatos />
          <StatCard etiqueta="Margen %" valor="" sinDatos />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Cancelaciones y churn
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard etiqueta="Cancelaciones (mes)" valor="" sinDatos />
          <StatCard etiqueta="Churn voluntario" valor="" sinDatos />
          <StatCard etiqueta="Churn involuntario" valor="" sinDatos />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          LTV, CAC y canal
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard etiqueta="LTV" valor="" sinDatos />
          <StatCard etiqueta="CAC" valor="" sinDatos />
          <StatCard etiqueta="Ratio LTV:CAC" valor="" sinDatos />
          <StatCard etiqueta="Payback" valor="" sinDatos />
        </div>
      </div>
    </div>
  );
}
