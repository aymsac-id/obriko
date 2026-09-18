// Plantillas de correo transaccional — voz del arquetipo (FICHA-ARTE.md: Directo · Confiable ·
// Curtido en obra). Fondo CLARO a propósito (no el oscuro de la app): los clientes de correo
// renderizan mal el modo oscuro completo y arriesgan legibilidad — el acento de marca (#e8432e)
// va en el botón y el encabezado, que es donde SÍ se reconoce consistente.

const ACENTO = '#e8432e';
const TEXTO = '#1a1a1a';
const TEXTO_SECUNDARIO = '#6b6b6b';

function envoltura(cuerpoHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f2f0ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:20px;font-weight:800;color:${TEXTO};letter-spacing:-0.02em;">JORNIVO</span>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:32px 24px;">
      ${cuerpoHtml}
    </div>
    <p style="text-align:center;color:${TEXTO_SECUNDARIO};font-size:12px;margin-top:24px;">
      Jornivo — tu libreta privada de personal de confianza.<br/>
      ¿Dudas? Escríbenos a reclamos@jornivo.app
    </p>
  </div>
</body>
</html>`;
}

function boton(texto: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACENTO};color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">${texto}</a>`;
}

export interface CorreoAccesoNuevo {
  asunto: string;
  preheader: string;
  html: string;
}

/** Cuenta creada AHORA por el webhook (compró directo, sin haberse registrado antes) — el hueco
 * crítico del modelo: si esto no llega, la persona pagó y no tiene forma de entrar. */
export function correoAccesoCuentaNueva(nombre: string, enlaceAcceso: string): CorreoAccesoNuevo {
  const primerNombre = nombre.split(' ')[0] || 'Hola';
  return {
    asunto: `${primerNombre}, tu Jornivo Starter ya está listo`,
    preheader: 'Un clic y entras — sin instalar nada, sin contraseña que inventar todavía.',
    html: envoltura(`
      <p style="color:${TEXTO};font-size:17px;margin:0 0 12px;">Hola ${primerNombre},</p>
      <p style="color:${TEXTO};font-size:15px;line-height:1.5;margin:0 0 20px;">
        Tu pago se confirmó y tu cuenta Starter de Jornivo ya está activa — hasta 50 trabajadores
        en tu libreta, búsqueda con filtros y disponibilidad en tiempo real, sin llamar a nadie.
      </p>
      <div style="text-align:center;margin:24px 0;">
        ${boton('Entrar a Jornivo →', enlaceAcceso)}
      </div>
      <p style="color:${TEXTO_SECUNDARIO};font-size:13px;line-height:1.5;margin:0;">
        Este enlace te deja entrar directo, sin contraseña. Si ya no funciona, entra en
        jornivo.app/login con este mismo correo y pide uno nuevo.
      </p>
    `),
  };
}

/** Cuenta que YA existía (modelo gratis→onboarding→paywall) y acaba de subir a Starter — no es
 * un correo de acceso (ya tenía), es la confirmación de que el pago se aplicó. */
export function correoConfirmacionStarter(nombre: string): CorreoAccesoNuevo {
  const primerNombre = nombre.split(' ')[0] || 'Hola';
  return {
    asunto: `${primerNombre}, ya eres Starter en Jornivo`,
    preheader: 'Tu pago se confirmó — hasta 50 trabajadores y búsqueda ilimitada, ya activos.',
    html: envoltura(`
      <p style="color:${TEXTO};font-size:17px;margin:0 0 12px;">Hola ${primerNombre},</p>
      <p style="color:${TEXTO};font-size:15px;line-height:1.5;margin:0 0 20px;">
        Tu pago se confirmó. Tu cuenta ya pasó a <strong>Starter</strong>: hasta 50 trabajadores en
        tu libreta y búsqueda sin límite. Entra con tu cuenta de siempre, ya está activo.
      </p>
      <div style="text-align:center;margin:24px 0;">
        ${boton('Abrir Jornivo →', 'https://jornivo.app/login')}
      </div>
      <p style="color:${TEXTO_SECUNDARIO};font-size:13px;line-height:1.5;margin:0;">
        Cancelas cuando quieras desde tu panel de comprador de Hotmart, sin permanencia.
      </p>
    `),
  };
}
