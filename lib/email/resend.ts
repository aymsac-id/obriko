// Cliente de Resend — SOLO se importa desde código de servidor (Route Handlers), nunca desde el
// navegador (RESEND_API_KEY es secreta). Remitente transaccional dedicado (46-EMAIL-DELIVERABILITY):
// tx.jornivo.app tiene su propio SPF/DKIM/DMARC, separado de cualquier dominio de marketing futuro
// — así una campaña que reciba quejas nunca contamina la reputación del correo de acceso.

import { Resend } from 'resend';

export const REMITENTE_TRANSACCIONAL = 'Jornivo <acceso@tx.jornivo.app>';

let cliente: Resend | null = null;

export function resend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Falta RESEND_API_KEY — no se puede enviar el correo.');
  if (!cliente) cliente = new Resend(apiKey);
  return cliente;
}
