-- Agrega el nombre de la empresa a la función pública de disponibilidad — pedido del usuario:
-- un trabajador que colabora con varios contratistas necesita saber CUÁL le está pidiendo
-- disponibilidad cada vez, no solo ver "Hola, [nombre]" sin contexto de quién pregunta.

drop function if exists obtener_disponibilidad_publica(uuid);

create or replace function obtener_disponibilidad_publica(p_token uuid)
returns table(nombre text, oficio text, fecha date, estado text, empresa_nombre text)
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
    select t.nombre, t.oficio, d.fecha, d.estado, e.nombre as empresa_nombre
    from trabajadores t
    join empresas e on e.id = t.empresa_id
    left join disponibilidad d on d.trabajador_id = t.id
    where t.id = v_trabajador_id;
end;
$$;

-- `drop function` borra los grants existentes — hay que reponer el mismo grant de 0001_init.sql
-- (esta función la llama el trabajador SIN sesión, desde el enlace público).
grant execute on function obtener_disponibilidad_publica(uuid) to anon, authenticated;
