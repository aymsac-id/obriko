// Uso — activación, retención D1/D7/D30 y el registro real de eventos (21-BACKOFFICE.md). La
// retención recién empieza a acumularse desde hoy (se instaló junto con este panel), así que
// mostrará "Sin datos" hasta que pase el tiempo — nunca un porcentaje inventado.

import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { getCuentasPorDia, getEmbudo, getResumenEventos, getResumenNegocio, getRetencion } from '@/lib/data/admin';
import StatCard from '@/components/admin/StatCard';
import TendenciaCuentas from '@/components/admin/TendenciaCuentas';

const ETIQUETA_EVENTO: Record<string, string> = {
  cuenta_creada: 'Cuentas creadas',
  primer_trabajador_agregado: 'Primer trabajador agregado (activación)',
  evaluacion_registrada: 'Calificaciones registradas',
  disponibilidad_marcada_publica: 'Disponibilidad marcada (enlace del trabajador)',
  disponibilidad_marcada_manual: 'Disponibilidad marcada (a mano por el dueño)',
  sesion_abierta: 'Sesiones abiertas',
  visita_landing: 'Visitas a la página de ventas',
  onboarding_iniciado: 'Recorridos de inicio empezados',
  registro_enviado: 'Registros enviados',
  paywall_visto: 'Pantalla de planes vista',
  checkout_abierto: 'Página de pago abierta',
};

const ETIQUETA_ORIGEN: Record<string, string> = { directo: 'Directo (escribió la dirección o enlace sin etiqueta)' };

function tarjetaRetencion(etiqueta: string, r: { cohorteSize: number; retenidos: number } | null) {
  if (!r) return <StatCard etiqueta={etiqueta} valor="" sinDatos />;
  const pct = Math.round((r.retenidos / r.cohorteSize) * 100);
  return <StatCard etiqueta={etiqueta} valor={`${pct}%`} insight={`${r.retenidos} de ${r.cohorteSize} cuentas de esa cohorte`} />;
}

export default async function AdminUsoPage() {
  const supabase = await crearClienteSupabaseServidor();
  const [embudo, resumen, eventos, serie, d1, d7, d30] = await Promise.all([
    getEmbudo(supabase, 30),
    getResumenNegocio(supabase),
    getResumenEventos(supabase, 30),
    getCuentasPorDia(supabase, 30),
    getRetencion(supabase, 1),
    getRetencion(supabase, 7),
    getRetencion(supabase, 30),
  ]);

  const conActivacion = eventos.find((e) => e.tipo === 'primer_trabajador_agregado')?.total ?? 0;
  const activacion = resumen.totalCuentas > 0 ? Math.round((conActivacion / resumen.totalCuentas) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold [font-family:var(--font-display)]">Uso</h1>
        <p className="text-[13px] text-[var(--text-secondary)]">¿La gente usa Jornivo de verdad, y vuelve?</p>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Camino de venta — últimos 30 días
        </p>
        {embudo.pasos[0].total === 0 ? (
          <p className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 text-[13px] text-[var(--text-tertiary)]">
            Sin visitas registradas todavía. Se cuentan desde que se instaló la medición.
          </p>
        ) : (
          <ol className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-4">
            {embudo.pasos.map((paso, i) => {
              const base = embudo.pasos[0].total;
              const anterior = i > 0 ? embudo.pasos[i - 1].total : null;
              return (
                <li key={paso.clave}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="text-[var(--text-secondary)]">{paso.etiqueta}</span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {paso.total}
                      {anterior ? (
                        <span className="ml-1.5 text-[12px] font-normal text-[var(--text-tertiary)]">
                          {Math.round((paso.total / anterior) * 100)}% del paso anterior
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${Math.min(100, (paso.total / base) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
          Visitantes únicos por navegador. Cuentas nuevas y primeros pagos son datos reales de la base.
        </p>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          De dónde llegan — últimos 30 días
        </p>
        {embudo.origenes.length === 0 ? (
          <p className="text-[13px] text-[var(--text-tertiary)]">Sin datos todavía.</p>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-[var(--radius-card)] bg-[var(--surface)] p-2">
            {embudo.origenes.map((o) => (
              <div key={o.origen} className="flex items-center justify-between gap-3 px-2 py-1.5 text-[13px]">
                <span className="min-w-0 truncate text-[var(--text-secondary)]">{ETIQUETA_ORIGEN[o.origen] ?? o.origen}</span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-semibold">{o.visitantes}</span>
                  <span className="text-[var(--text-tertiary)]"> visitas · {o.registros} registros</span>
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
          Para saber qué grupo funciona, comparte el enlace con una etiqueta: jornivo.app/?de=nombre-del-grupo
        </p>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Cuentas nuevas — últimos 30 días
        </p>
        <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4">
          <TendenciaCuentas datos={serie} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Activación</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {activacion === null ? (
            <StatCard etiqueta="Agregó su primer trabajador" valor="" sinDatos />
          ) : (
            <StatCard
              etiqueta="Agregó su primer trabajador"
              valor={`${activacion}%`}
              insight={`${conActivacion} de ${resumen.totalCuentas} cuentas`}
            />
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Retención (¿vuelven?)
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {tarjetaRetencion('Retención D1', d1)}
          {tarjetaRetencion('Retención D7', d7)}
          {tarjetaRetencion('Retención D30', d30)}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Eventos registrados (últimos 30 días)
        </p>
        {eventos.length === 0 ? (
          <p className="text-[13px] text-[var(--text-tertiary)]">Sin datos todavía.</p>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-[var(--radius-card)] bg-[var(--surface)] p-2">
            {eventos
              .sort((a, b) => b.total - a.total)
              .map((e) => (
                <div key={e.tipo} className="flex items-center justify-between px-2 py-1.5 text-[13px]">
                  <span className="text-[var(--text-secondary)]">{ETIQUETA_EVENTO[e.tipo] ?? e.tipo}</span>
                  <span className="font-semibold tabular-nums">{e.total}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
