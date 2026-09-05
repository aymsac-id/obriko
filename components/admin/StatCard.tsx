// Card de dato héroe para el panel — principio Tufte (17-VISUALIZACION-DATOS.md): máximo dato,
// mínima tinta. Un número grande + su etiqueta + un insight interpretado, nunca solo el número.

export default function StatCard({
  etiqueta,
  valor,
  insight,
  sinDatos,
}: {
  etiqueta: string;
  valor: string;
  /** Interpretación en una frase — "↑ 12% vs semana pasada", no solo el número. */
  insight?: string;
  /** Cuando true, `valor` se ignora y se muestra "Sin datos" — nunca inventar una cifra. */
  sinDatos?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">{etiqueta}</p>
      {sinDatos ? (
        <p className="mt-1.5 text-[15px] font-medium text-[var(--text-tertiary)]">Sin datos</p>
      ) : (
        <>
          <p className="mt-1 text-[28px] font-bold tabular-nums leading-none [font-family:var(--font-display)]">
            {valor}
          </p>
          {insight ? <p className="mt-1.5 text-[12px] text-[var(--text-secondary)]">{insight}</p> : null}
        </>
      )}
    </div>
  );
}
