-- Jornivo (antes Obriko) — esquema inicial (Sesión 6).
-- Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Decisiones (ver ESTADO.md → Decisiones técnicas):
--   * 1 empresa por dueño de cuenta (owner_id = auth.uid()), creada automáticamente al registrarse.
--   * RLS en TODA tabla, comparando siempre contra la empresa del usuario autenticado vía
--     empresa_id_actual() (security definer, evita repetir el join en cada política — 25).
--   * El enlace de disponibilidad sin login NO usa RLS abierta a `anon`: usa 2 funciones
--     security definer (obtener_disponibilidad_publica / actualizar_disponibilidad_publica)
--     que validan el token internamente — anon nunca ve las tablas directamente.

-- ── EMPRESAS ─────────────────────────────────────────────────────────────────────────────
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null default 'Mi empresa',
  plan text not null default 'gratis' check (plan in ('gratis', 'starter', 'pro')),
  creado_en timestamptz not null default now()
);
create unique index if not exists empresas_owner_id_idx on empresas(owner_id);

alter table empresas enable row level security;

create policy "empresas_select_own" on empresas for select
  using (owner_id = (select auth.uid()));
create policy "empresas_update_own" on empresas for update
  using (owner_id = (select auth.uid()));

-- Función helper: la empresa del usuario autenticado (una sola fila, indexada por owner_id).
create or replace function empresa_id_actual()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from empresas where owner_id = auth.uid() limit 1;
$$;

-- Crea la empresa automáticamente al registrarse (nunca a mano).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.empresas (owner_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── TRABAJADORES ─────────────────────────────────────────────────────────────────────────
create table if not exists trabajadores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nombre text not null,
  oficio text not null,
  telefono text not null default '',
  tarifa_dia numeric not null default 0,
  ubicacion text not null default '',
  obras_juntos int not null default 0,
  confiabilidad int not null default 50,
  origen text not null default 'manual' check (origen in ('importado', 'manual')),
  enlace_token uuid not null default gen_random_uuid(),
  creado_en timestamptz not null default now()
);
create index if not exists trabajadores_empresa_id_idx on trabajadores(empresa_id);
create unique index if not exists trabajadores_enlace_token_idx on trabajadores(enlace_token);

alter table trabajadores enable row level security;

create policy "trabajadores_all_own" on trabajadores for all
  using (empresa_id = empresa_id_actual())
  with check (empresa_id = empresa_id_actual());

-- ── EVALUACIONES ─────────────────────────────────────────────────────────────────────────
create table if not exists evaluaciones (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references trabajadores(id) on delete cascade,
  obra text not null default '',
  calidad int not null check (calidad between 1 and 5),
  puntualidad int not null check (puntualidad between 1 and 5),
  recomendaria boolean not null default true,
  comentario text not null default '',
  creado_en timestamptz not null default now()
);
create index if not exists evaluaciones_trabajador_id_idx on evaluaciones(trabajador_id);

alter table evaluaciones enable row level security;

create policy "evaluaciones_all_own" on evaluaciones for all
  using (exists (
    select 1 from trabajadores t
    where t.id = evaluaciones.trabajador_id and t.empresa_id = empresa_id_actual()
  ))
  with check (exists (
    select 1 from trabajadores t
    where t.id = evaluaciones.trabajador_id and t.empresa_id = empresa_id_actual()
  ));

-- ── DISPONIBILIDAD ───────────────────────────────────────────────────────────────────────
create table if not exists disponibilidad (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references trabajadores(id) on delete cascade,
  fecha date not null,
  estado text not null check (estado in ('disponible', 'ocupado', 'consultar')),
  actualizado_en timestamptz not null default now(),
  unique (trabajador_id, fecha)
);
create index if not exists disponibilidad_trabajador_id_idx on disponibilidad(trabajador_id);

alter table disponibilidad enable row level security;

create policy "disponibilidad_all_own" on disponibilidad for all
  using (exists (
    select 1 from trabajadores t
    where t.id = disponibilidad.trabajador_id and t.empresa_id = empresa_id_actual()
  ))
  with check (exists (
    select 1 from trabajadores t
    where t.id = disponibilidad.trabajador_id and t.empresa_id = empresa_id_actual()
  ));

-- ── PROYECTOS ────────────────────────────────────────────────────────────────────────────
create table if not exists proyectos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nombre text not null,
  ubicacion text not null default '',
  fecha_inicio date not null default current_date,
  estado text not null default 'activo' check (estado in ('activo', 'pausado', 'terminado')),
  creado_en timestamptz not null default now()
);
create index if not exists proyectos_empresa_id_idx on proyectos(empresa_id);

alter table proyectos enable row level security;

create policy "proyectos_all_own" on proyectos for all
  using (empresa_id = empresa_id_actual())
  with check (empresa_id = empresa_id_actual());

-- ── PROYECTO_TRABAJADOR (join: la cuadrilla de cada obra) ───────────────────────────────
create table if not exists proyecto_trabajador (
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  trabajador_id uuid not null references trabajadores(id) on delete cascade,
  primary key (proyecto_id, trabajador_id)
);
create index if not exists proyecto_trabajador_trabajador_id_idx on proyecto_trabajador(trabajador_id);

alter table proyecto_trabajador enable row level security;

create policy "proyecto_trabajador_all_own" on proyecto_trabajador for all
  using (exists (
    select 1 from proyectos p where p.id = proyecto_trabajador.proyecto_id and p.empresa_id = empresa_id_actual()
  ))
  with check (exists (
    select 1 from proyectos p where p.id = proyecto_trabajador.proyecto_id and p.empresa_id = empresa_id_actual()
  ));

-- ── ENLACE PÚBLICO DE DISPONIBILIDAD (sin login — el trabajador nunca instala nada) ───────
-- El token vive en trabajadores.enlace_token (UUID, no adivinable). El rol `anon` NUNCA lee
-- las tablas directamente (RLS arriba lo bloquea); solo puede llamar estas 2 funciones, que
-- validan el token y devuelven/tocan lo mínimo indispensable.

create or replace function obtener_disponibilidad_publica(p_token uuid)
returns table(nombre text, oficio text, fecha date, estado text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trabajador_id uuid;
begin
  select id into v_trabajador_id from trabajadores where enlace_token = p_token;
  if v_trabajador_id is null then
    return;
  end if;
  return query
    select t.nombre, t.oficio, d.fecha, d.estado
    from trabajadores t
    left join disponibilidad d on d.trabajador_id = t.id
    where t.id = v_trabajador_id;
end;
$$;
grant execute on function obtener_disponibilidad_publica(uuid) to anon, authenticated;

create or replace function actualizar_disponibilidad_publica(p_token uuid, p_fecha date, p_estado text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trabajador_id uuid;
begin
  if p_estado not in ('disponible', 'ocupado', 'consultar') then
    raise exception 'estado inválido';
  end if;
  select id into v_trabajador_id from trabajadores where enlace_token = p_token;
  if v_trabajador_id is null then
    raise exception 'enlace inválido';
  end if;
  insert into disponibilidad (trabajador_id, fecha, estado, actualizado_en)
  values (v_trabajador_id, p_fecha, p_estado, now())
  on conflict (trabajador_id, fecha) do update set estado = excluded.estado, actualizado_en = now();
end;
$$;
grant execute on function actualizar_disponibilidad_publica(uuid, date, text) to anon, authenticated;
