// Página de Reembolsos — versión inicial simple. La política final se conecta a la cobertura
// real de Hotmart en la Sesión 6 (18-VENTA-HOTMART.md). Se anota en ESTADO.md.

export default function ReembolsosPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-16 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a href="/" className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline">
        ← Volver al inicio
      </a>
      <h1 className="mt-6 text-3xl font-bold [font-family:var(--font-display)]">
        Política de Reembolsos
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: 2026-09-01</p>
      <div className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-[var(--text-secondary)]">
        <p>
          Puedes probar Obriko gratis, sin tarjeta, con hasta 10 trabajadores. Si más
          adelante pasas a un plan pago, puedes cancelarlo cuando quieras desde tu cuenta.
        </p>
        <p>
          Esta versión es un borrador inicial: la política de reembolsos definitiva se
          publicará cuando conectemos el cobro real (Hotmart) y sus condiciones oficiales.
        </p>
        <p>
          Si tienes preguntas, escríbenos a{' '}
          <a href="mailto:soporte@obriko.com" className="text-[var(--accent)] underline-offset-4 hover:underline">
            soporte@obriko.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
