-- Recordatorio semanal para pedir disponibilidad al equipo (Sesión 6, pedido del usuario: con
-- equipos grandes, mandar el enlace uno por uno es tedioso — el recordatorio + el envío masivo
-- por WhatsApp resuelven el 90% del problema sin necesitar la API de pago de WhatsApp).
-- Aplicada directo vía MCP de Supabase (ya no hace falta pegar SQL a mano — ver ESTADO.md).

alter table empresas
  add column if not exists recordatorio_dia_semana smallint check (recordatorio_dia_semana between 0 and 6),
  add column if not exists recordatorio_hora smallint check (recordatorio_hora between 0 and 23);
