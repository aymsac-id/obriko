// Salud — errores reales de la app (error_log, alimentado por app/global-error.tsx y por
// logErrorApp() en los catch de código real). "0 errores" es información buena, no un
// placeholder vacío.

import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { getErroresRecientes, getTotalErrores } from '@/lib/data/admin';
import StatCard from '@/components/admin/StatCard';

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default async function AdminSaludPage() {
  const supabase = await crearClienteSupabaseServidor();
  const [errores7d, errores30d, recientes] = await Promise.all([
    getTotalErrores(supabase, 7),
    getTotalErrores(supabase, 30),
    getErroresRecientes(supabase, 20),
  ]);

  const agrupados = new Map<string, number>();
  for (const e of recientes) agrupados.set(e.mensaje, (agrupados.get(e.mensaje) ?? 0) + 1);
  const masFrecuentes = Array.from(agrupados.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold [font-family:var(--font-display)]">Salud</h1>
        <p className="text-[13px] text-[var(--text-secondary)]">Errores reales de la app — no jerga técnica.</p>
      </div>

      <div className="flex items-center gap-2.5 rounded-[var(--radius-card)] border px-4 py-3"
        style={{
          borderColor: errores7d === 0 ? 'color-mix(in oklab, var(--success) 35%, transparent)' : 'color-mix(in oklab, var(--warning) 35%, transparent)',
          backgroundColor: errores7d === 0 ? 'color-mix(in oklab, var(--success) 10%, transparent)' : 'color-mix(in oklab, var(--warning) 10%, transparent)',
        }}
      >
        {errores7d === 0 ? (
          <>
            <CheckCircle2 size={18} color="var(--success)" aria-hidden="true" />
            <p className="text-[14px] font-medium">Todo bien — 0 errores esta semana</p>
          </>
        ) : (
          <>
            <AlertTriangle size={18} color="var(--warning)" aria-hidden="true" />
            <p className="text-[14px] font-medium">
              {errores7d} {errores7d === 1 ? 'error' : 'errores'} esta semana — revisa el detalle abajo.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard etiqueta="Errores (7 días)" valor={String(errores7d)} />
        <StatCard etiqueta="Errores (30 días)" valor={String(errores30d)} />
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Más frecuentes (los que más urge arreglar primero)
        </p>
        {masFrecuentes.length === 0 ? (
          <p className="text-[13px] text-[var(--text-tertiary)]">Sin errores registrados.</p>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-[var(--radius-card)] bg-[var(--surface)] p-2">
            {masFrecuentes.map(([mensaje, veces]) => (
              <div key={mensaje} className="flex items-center justify-between gap-3 px-2 py-1.5 text-[13px]">
                <span className="min-w-0 truncate text-[var(--text-secondary)]">{mensaje}</span>
                <span className="shrink-0 font-semibold tabular-nums">{veces}×</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Últimos registrados
        </p>
        {recientes.length === 0 ? (
          <p className="text-[13px] text-[var(--text-tertiary)]">Sin errores registrados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recientes.map((e) => (
              <div key={e.id} className="rounded-[var(--radius-card)] bg-[var(--surface)] px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">{e.mensaje}</p>
                  <p className="shrink-0 text-[11px] text-[var(--text-tertiary)]">{formatearFecha(e.creado_en)}</p>
                </div>
                {e.contexto ? <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">{e.contexto}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
