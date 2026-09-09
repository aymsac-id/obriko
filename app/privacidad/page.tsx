// Política de Privacidad — auditoría legal completa (47-LEGAL-FISCAL-Y-PRIVACIDAD.md),
// 2026-09-06. Describe la app REAL: qué datos recopila Jornivo hoy, con qué proveedores reales
// (Supabase, Vercel, Hotmart cuando se active), y el camino real de eliminación de cuenta
// (app/app/ajustes/actions.ts). Se actualiza cada vez que cambie algo material — y ese cambio
// se avisa por correo a las cuentas activas (no en silencio).

const ACTUALIZADO = '6 de septiembre de 2026';
const CONTACTO = 'josskgp@gmail.com';

export default function PrivacidadPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-16 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a href="/" className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline">
        ← Volver al inicio
      </a>
      <h1 className="mt-6 text-3xl font-bold [font-family:var(--font-display)]">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última actualización: {ACTUALIZADO}</p>

      <div className="mt-8 flex flex-col gap-8 text-base leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Quién es el responsable</h2>
          <p className="mt-2">
            Jornivo es operado por <strong className="text-[var(--text-primary)]">Jossef Montiveros Toribio</strong>,
            persona natural, desde Perú. Cualquier duda sobre tus datos la puedes escribir a{' '}
            <a href={`mailto:${CONTACTO}`} className="text-[var(--accent)] underline-offset-4 hover:underline">
              {CONTACTO}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Qué datos recopilamos</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">De tu cuenta:</strong> tu correo y tu contraseña (guardada
              de forma segura por nuestro proveedor de autenticación, nunca en texto plano).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">De tu empresa:</strong> el nombre que le pones y el plan
              que usas (Gratis o Starter).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">De tu cuadrilla:</strong> los datos que TÚ ingresas sobre
              las personas que trabajan contigo — nombre, oficio, celular, tarifa por día y zona. Ver la sección 3,
              porque estos datos son de otras personas, no tuyos.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Evaluaciones y disponibilidad:</strong> las calificaciones
              que registras tras una obra (calidad, puntualidad, comentarios) y la disponibilidad de cada trabajador,
              que puedes marcar tú o que el propio trabajador puede marcar desde un enlace que le compartes (sin que
              él necesite crear una cuenta).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Datos de uso:</strong> registramos qué tipo de acción
              ocurre en la app (por ejemplo "se creó una cuenta" o "se agregó el primer trabajador") para entender si
              el producto funciona — nunca el contenido de tu libreta, solo el tipo de evento y cuándo pasó.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Registro técnico de errores:</strong> si algo falla,
              guardamos el mensaje del error para poder arreglarlo — no incluye tus contraseñas ni los datos de tu
              cuadrilla.
            </li>
          </ul>
          <p className="mt-3">
            No te pedimos ni guardamos datos que no necesitamos: no pedimos tu ubicación exacta, tu fecha de
            nacimiento, ni datos financieros tuyos (los pagos, cuando existan, los procesa directamente la pasarela de
            pago — nunca vemos ni guardamos tu tarjeta).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            3. Los datos de tu cuadrilla son de otras personas
          </h2>
          <p className="mt-2">
            Cuando agregas a alguien a tu libreta (por importación, tarjeta de contacto o a mano), tú decides guardar
            el nombre y el celular de esa persona porque ya tienes una relación de trabajo con ella. Al usar Jornivo,
            declaras que tienes una razón legítima para guardar esos datos (una relación laboral o de obra existente)
            y que eres tú, como dueño de la cuenta, quien responde por ese tratamiento frente a esa persona.
          </p>
          <p className="mt-2">
            Si uno de tus trabajadores quiere que sus datos se eliminen de Jornivo, puede escribirnos a{' '}
            <a href={`mailto:${CONTACTO}`} className="text-[var(--accent)] underline-offset-4 hover:underline">
              {CONTACTO}
            </a>{' '}
            y lo resolvemos, avisándote a ti como dueño de la cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Con quién compartimos datos</h2>
          <p className="mt-2">No vendemos tus datos a nadie. Los compartimos solo con quien nos ayuda a operar Jornivo:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Supabase</strong> — guarda tu base de datos, gestiona el
              inicio de sesión y envía los correos de acceso (confirmación de cuenta, recuperación de contraseña).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Vercel</strong> — aloja la aplicación web que usas ahora
              mismo.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Hotmart</strong> — cuando actives un plan pago, procesará
              tu cobro. Hoy el plan Starter NO tiene ningún cobro real activado — es gratis mientras terminamos de
              conectar la pasarela de pago.
            </li>
          </ul>
          <p className="mt-3">
            No usamos herramientas de publicidad ni de analítica de terceros (como Google Analytics o Meta Pixel) hoy.
            Si eso cambiara en el futuro, actualizaríamos esta página y te lo avisaríamos por correo antes de
            activarlo — nunca en silencio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Dónde viven tus datos</h2>
          <p className="mt-2">
            Supabase y Vercel procesan y guardan los datos en infraestructura fuera de Perú (Estados Unidos). Esto es
            una transferencia internacional necesaria para que el servicio funcione — ambos proveedores operan bajo
            sus propios estándares de seguridad y contratos de protección de datos. Al usar Jornivo, aceptas esta
            transferencia como parte indispensable del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">6. Cookies</h2>
          <p className="mt-2">
            Jornivo usa únicamente la cookie técnica que mantiene tu sesión iniciada — es indispensable para que la app
            funcione y no requiere tu consentimiento porque no rastrea nada. No usamos cookies de publicidad ni de
            analítica de terceros. Si eso cambia, te pediremos tu consentimiento antes con un aviso claro, no una
            casilla ya marcada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">7. Cómo eliminar tus datos</h2>
          <p className="mt-2">
            Desde <strong className="text-[var(--text-primary)]">Ajustes → Eliminar mi cuenta y mis datos</strong>{' '}
            puedes borrar, en el momento, toda tu libreta de trabajadores, tus proyectos, evaluaciones y tu cuenta de
            acceso — de forma permanente y sin poder deshacerlo. También puedes escribirnos a{' '}
            <a href={`mailto:${CONTACTO}`} className="text-[var(--accent)] underline-offset-4 hover:underline">
              {CONTACTO}
            </a>{' '}
            para pedir lo mismo o cualquier otro derecho sobre tus datos (acceso, rectificación, oposición).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">8. Edad mínima</h2>
          <p className="mt-2">
            Jornivo es una herramienta para dueños y encargados de negocios de construcción — su uso está pensado para
            mayores de 18 años.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">9. Cambios a esta política</h2>
          <p className="mt-2">
            Si hacemos un cambio importante a esta política (por ejemplo, agregar un nuevo proveedor o empezar a usar
            analítica de terceros), actualizaremos la fecha de arriba y avisaremos por correo a las cuentas activas
            antes de que el cambio entre en vigor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">10. Contacto</h2>
          <p className="mt-2">
            Para cualquier pregunta sobre esta política o tus datos, escríbenos a{' '}
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
