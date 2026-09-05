-- El cliente nunca puede leer auth.users directo (ni con RLS ni con la publishable key) — esta
-- función security definer es la única forma de que el panel muestre el correo del dueño de
-- cada cuenta, sin necesitar la clave secreta de Supabase. Verifica es_admin() por dentro.
create or replace function admin_lista_empresas()
returns table(
  id uuid,
  nombre text,
  plan text,
  creado_en timestamptz,
  owner_email text,
  total_trabajadores bigint,
  total_proyectos bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'No autorizado';
  end if;
  return query
    select
      e.id, e.nombre, e.plan, e.creado_en, u.email::text,
      (select count(*) from trabajadores t where t.empresa_id = e.id),
      (select count(*) from proyectos p where p.empresa_id = e.id)
    from empresas e
    join auth.users u on u.id = e.owner_id
    order by e.creado_en desc;
end;
$$;
grant execute on function admin_lista_empresas() to authenticated;
revoke execute on function admin_lista_empresas() from anon, public;
