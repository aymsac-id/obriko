-- Panel de administración del dueño (Sesión 6, pedido explícito): tabla de administradores,
-- función es_admin() para RLS, y los registros de eventos/errores que alimentan el panel.
-- Ver ESTADO.md → "Panel de administración" para el diseño completo. Aplicada vía MCP de Supabase.

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);
alter table admins enable row level security;
-- Sin políticas: nadie lee esta tabla directo, ni siquiera un admin — solo es_admin() (abajo).

create or replace function es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;
revoke execute on function es_admin() from public;
grant execute on function es_admin() to authenticated;

-- El dueño se inserta a mano una vez, con su user_id real (ver ESTADO.md).
-- insert into admins (user_id) values ('<uuid-del-dueño>') on conflict (user_id) do nothing;

create policy "admin_lee_empresas" on empresas for select using (es_admin());
create policy "admin_lee_trabajadores" on trabajadores for select using (es_admin());
create policy "admin_lee_proyectos" on proyectos for select using (es_admin());
create policy "admin_lee_evaluaciones" on evaluaciones for select using (es_admin());
create policy "admin_lee_disponibilidad" on disponibilidad for select using (es_admin());
create policy "admin_lee_proyecto_trabajador" on proyecto_trabajador for select using (es_admin());

create table if not exists event_log (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  empresa_id uuid references empresas(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);
create index if not exists event_log_tipo_fecha_idx on event_log (tipo, creado_en);
create index if not exists event_log_empresa_idx on event_log (empresa_id);
alter table event_log enable row level security;
create policy "admin_lee_event_log" on event_log for select using (es_admin());

create or replace function log_evento(p_tipo text, p_empresa_id uuid, p_metadata jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into event_log (tipo, empresa_id, metadata) values (p_tipo, p_empresa_id, p_metadata);
end;
$$;
grant execute on function log_evento(text, uuid, jsonb) to anon, authenticated;

create table if not exists error_log (
  id uuid primary key default gen_random_uuid(),
  mensaje text not null,
  contexto text not null default '',
  empresa_id uuid references empresas(id) on delete set null,
  creado_en timestamptz not null default now()
);
create index if not exists error_log_fecha_idx on error_log (creado_en);
alter table error_log enable row level security;
create policy "admin_lee_error_log" on error_log for select using (es_admin());

create or replace function log_error_app(p_mensaje text, p_contexto text, p_empresa_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into error_log (mensaje, contexto, empresa_id) values (left(p_mensaje, 2000), left(p_contexto, 200), p_empresa_id);
end;
$$;
grant execute on function log_error_app(text, text, uuid) to anon, authenticated;
