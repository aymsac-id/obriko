// Mapeo evento de Hotmart → estado de suscripción — 09-VENTA-HOTMART.md.
// Jornivo no usa período de prueba (el plan Gratis ya cubre eso, ver FICHA-MERCADO.md §4), así
// que no hay evento de "inicio de trial" que mapear — solo el ciclo de pago real.
//
// ⚠️ PLACEHOLDER — verificar contra el panel real antes de confiar: los nombres exactos de
// evento pueden variar por cuenta/versión de Hotmart (docs/sistema/18-VENTA-HOTMART.md lo pide
// explícitamente). Antes de la primera venta real: hacer una compra de prueba reembolsable y
// comparar el JSON real contra este mapa.

export type EstadoSuscripcion = 'active' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'chargeback';

export const EVENTO_A_ESTADO: Record<string, EstadoSuscripcion> = {
  PURCHASE_APPROVED: 'active',
  PURCHASE_COMPLETE: 'active',
  PURCHASE_DELAYED: 'past_due',
  SUBSCRIPTION_CANCELLATION: 'cancelled',
  PURCHASE_EXPIRED: 'expired',
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'chargeback',
};

export function estadoParaEvento(evento: string): EstadoSuscripcion | null {
  return EVENTO_A_ESTADO[evento] ?? null;
}
