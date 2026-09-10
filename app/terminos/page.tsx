// Términos y Condiciones — auditoría legal completa (47-LEGAL-FISCAL-Y-PRIVACIDAD.md), 2026-09-06.
// Refleja el estado REAL del producto: hoy no hay cobro activo (Hotmart sin conectar), la app no
// usa IA, y no es un marketplace/bolsa de trabajo — es la libreta privada del dueño.

const ACTUALIZADO = '6 de septiembre de 2026';
const CONTACTO = 'josskgp@gmail.com';

export default function TerminosPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-16 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a href="/" className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline">
        ← Volver al inicio
      </a>
      <h1 className="mt-6 text-3xl font-bold [font-family:var(--font-display)]">Términos y Condiciones</h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: {ACTUALIZADO}</p>

      <div className="mt-8 flex flex-col gap-8 text-base leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Qué es Jornivo</h2>
          <p className="mt-2">
            Jornivo es tu libreta privada de personal: te ayuda a guardar, calificar y encontrar rápido a los
            trabajadores de confianza (albañiles, electricistas, etc.) para tus obras. Es operada por Jossef
            Montiveros Toribio, persona natural, desde Perú.
          </p>
          <p className="mt-2">
            <strong className="text-[var(--text-primary)]">Jornivo NO es</strong> un marketplace ni una bolsa de
            trabajo: no publicamos a tus trabajadores para que otros los contraten, ni verificamos su identidad,
            certificaciones o antecedentes. Es tu red privada, construida con la gente que ya conoces.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Quién puede usar Jornivo</h2>
          <p className="mt-2">
            Jornivo está pensado para dueños y encargados de negocios de construcción o remodelación, mayores de 18
            años. Al crear una cuenta, declaras que cumples con esa condición y que la información que ingresas es
            veraz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Planes y precios</h2>
          <p className="mt-2">
            El <strong className="text-[var(--text-primary)]">plan Gratis</strong> incluye hasta 10 trabajadores en tu
            libreta, sin costo y sin tarjeta, de forma indefinida. El{' '}
            <strong className="text-[var(--text-primary)]">plan Starter</strong> amplía ese límite a 50 trabajadores.
          </p>
          <p className="mt-2">
            ⚠️ <strong className="text-[var(--text-primary)]">Hoy, elegir el plan Starter no genera ningún cobro</strong>{' '}
            — todavía no conectamos una pasarela de pago real (usaremos Hotmart). El precio de referencia que ves en
            la app ($12/mes, o $10/mes facturado anual) es el que se activará cuando el cobro esté listo. Antes de cobrarte por primera vez, te
            avisaremos con claridad la fecha, el monto y que la suscripción se renueva automáticamente, y podrás
            cancelar cuando quieras desde tu cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Los datos de tu cuadrilla</h2>
          <p className="mt-2">
            Tú decides qué información guardas sobre las personas con las que trabajas. Eres responsable de tener una
            razón legítima para guardar esos datos (una relación de trabajo existente) — ver el detalle en la{' '}
            <a href="/privacidad" className="text-[var(--accent)] underline-offset-4 hover:underline">
              Política de Privacidad
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Qué NO garantiza Jornivo</h2>
          <p className="mt-2">
            La disponibilidad que ves en la app refleja lo último que alguien marcó — tú o el propio trabajador desde
            su enlace. Jornivo no verifica en tiempo real si esa información sigue siendo exacta, ni garantiza que un
            trabajador marcado como "disponible" acepte finalmente la obra. La decisión de contratar o no a alguien es
            siempre tuya, bajo tu propio criterio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">6. Tu cuenta</h2>
          <p className="mt-2">
            Eres responsable de mantener tu contraseña segura y de todo lo que ocurra dentro de tu cuenta. Puedes
            eliminar tu cuenta y todos tus datos en cualquier momento desde Ajustes.
          </p>
          <p className="mt-2">
            Podemos suspender o cerrar una cuenta si detectamos uso indebido (por ejemplo, intentar acceder a datos de
            otra cuenta, o usar la plataforma para fines distintos a gestionar tu propia cuadrilla), avisándote por
            correo salvo que la ley nos pida no hacerlo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">7. Límite de responsabilidad</h2>
          <p className="mt-2">
            Jornivo se ofrece "tal cual", como una herramienta de organización. En la medida permitida por la ley, no
            respondemos por pérdidas o daños derivados de decisiones que tomes basándote en la información de la app
            (por ejemplo, contratar a un trabajador que resultó no estar disponible), ni por interrupciones del
            servicio fuera de nuestro control razonable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">8. Ley aplicable</h2>
          <p className="mt-2">
            Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa se resolverá ante los
            juzgados de Perú, salvo que la ley aplicable a tu país de residencia exija otra cosa.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">9. Cambios a estos términos</h2>
          <p className="mt-2">
            Si hacemos un cambio importante a estos términos, actualizaremos la fecha de arriba y avisaremos por
            correo a las cuentas activas antes de que el cambio entre en vigor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">10. Contacto</h2>
          <p className="mt-2">
            Si tienes preguntas, escríbenos a{' '}
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
