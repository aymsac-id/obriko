// Página de Términos y Condiciones — versión inicial simple. Pendiente de revisión legal
// completa (47-LEGAL-FISCAL-Y-PRIVACIDAD.md) antes de vender: se anota en ESTADO.md.

export default function TerminosPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-16 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a href="/" className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline">
        ← Volver al inicio
      </a>
      <h1 className="mt-6 text-3xl font-bold [font-family:var(--font-display)]">
        Términos y Condiciones
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: 2026-09-01</p>
      <div className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-[var(--text-secondary)]">
        <p>
          Obriko es una libreta privada de personal para constructores y remodeladores.
          El plan gratis incluye hasta 10 trabajadores; los planes pagos amplían ese límite.
          Puedes cancelar cuando quieras.
        </p>
        <p>
          Esta versión es un borrador inicial mientras terminamos de construir la app.
          Antes del lanzamiento publicaremos la versión completa y definitiva, incluyendo las
          condiciones exactas de pago una vez estén conectadas a la pasarela.
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
