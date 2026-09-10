// Verificación del webhook de Hotmart — 09-VENTA-HOTMART.md "SEGURIDAD DEL WEBHOOK (implementación
// real)". El hottok es un secreto compartido de tu cuenta de Hotmart, NO una firma HMAC — se
// compara en tiempo constante sobre HTTPS. Fail-secure EN TIEMPO DE PETICIÓN (no al importar el
// módulo): Next.js analiza todas las rutas al compilar, así que reventar al cargar el archivo
// rompería el build entero aunque nadie llame al webhook todavía. La verificación real ocurre
// recién cuando llega una petición — sin HOTMART_HOTTOK configurada, TODA petición se rechaza.

import crypto from 'node:crypto';

/** Compara dos strings en tiempo constante (evita timing attacks) — exige longitudes iguales,
 * por eso primero se comparan las longitudes con una variable, nunca con un early-return que
 * filtre cuánto tardó en fallar. */
function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function verifyHotmart(hottok: string | undefined | null): boolean {
  const secreto = process.env.HOTMART_HOTTOK;
  if (!secreto || !hottok) return false;
  return timingSafeEqualStr(hottok, secreto);
}
