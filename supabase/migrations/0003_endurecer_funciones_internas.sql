-- Endurecimiento encontrado con el linter de seguridad de Supabase (2026-09-04, tras conectar
-- el MCP de Supabase): Postgres otorga EXECUTE a PUBLIC por defecto al crear una función.
-- `empresa_id_actual()` y `handle_new_user()` son helpers INTERNOS — nunca deben poder llamarse
-- como endpoint público vía /rest/v1/rpc/. Las 2 funciones del enlace sin login
-- (actualizar_disponibilidad_publica / obtener_disponibilidad_publica) siguen públicas a
-- propósito — es su diseño (ver 0001_init.sql), no se tocan.

revoke execute on function empresa_id_actual() from public;
grant execute on function empresa_id_actual() to authenticated;

revoke execute on function handle_new_user() from public;
