// Política de Reembolsos — auditoría legal completa (47-LEGAL-FISCAL-Y-PRIVACIDAD.md), 2026-09-06.
// Hoy no hay cobros reales (Hotmart sin conectar) — la página lo dice tal cual, en vez de prometer
// una política de reembolso sobre un pago que todavía no existe. Se reemplaza cuando se conecte
// Hotmart, alineada con la garantía real configurada en el panel de Hotmart (18-VENTA-HOTMART.md).

const ACTUALIZADO = '6 de septiembre de 2026';
const CONTACTO = 'josskgp@gmail.com';

export default function ReembolsosPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-16 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a href="/" className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline">
        ← Volver al inicio
      </a>
      <h1 className="mt-6 text-3xl font-bold [font-family:var(--font-display)]">Política de Reembolsos</h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: {ACTUALIZADO}</p>

      <div className="mt-8 flex flex-col gap-8 text-base leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Hoy, Jornivo no cobra nada</h2>
          <p className="mt-2">
            El plan Gratis (hasta 10 trabajadores) no tiene costo. El plan Starter existe en la app como vista previa,
            pero <strong className="text-[var(--text-primary)]">todavía no está conectado a ningún cobro real</strong>{' '}
            — no procesamos pagos hoy, así que no hay nada que reembolsar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Cuando activemos cobros pagados</h2>
          <p className="mt-2">
            Vamos a procesar los pagos a través de Hotmart. Antes de la primera venta, publicaremos aquí la garantía
            exacta configurada en el panel de Hotmart para el producto (nunca menos de lo que prometamos en la página
            de precios ni menos de lo que Hotmart exige como piso — hoy ese piso es de 7 días), y esa misma ventana
            será la que veas en la página de precios. Los reembolsos, cuando existan, los gestiona directamente
            Hotmart desde el portal del comprador.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Cómo "cancelar" hoy</h2>
          <p className="mt-2">
            Como no hay ningún cobro activo, no hay nada que cancelar en el sentido de una suscripción. Si quieres
            dejar de usar Jornivo, puedes simplemente no volver a entrar, o eliminar tu cuenta y todos tus datos por
            completo desde <strong className="text-[var(--text-primary)]">Ajustes → Eliminar mi cuenta y mis datos</strong>.
            Cuando el cobro real esté activo, agregaremos aquí el enlace directo al portal de Hotmart para cancelar la
            renovación automática en un solo paso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Contacto</h2>
          <p className="mt-2">
            Si tienes cualquier duda sobre esto, escríbenos a{' '}
            <a href={`mailto:${CONTACTO}`} className="text-[var(--accent)] underline-offset-4 hover:underline">
              {CONTACTO}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
