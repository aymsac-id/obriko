-- Retención real D1/D7/D30 (21-BACKOFFICE.md): de las cuentas creadas EXACTAMENTE hace N días
-- (una cohorte diaria), ¿cuántas tuvieron al menos un evento real ese día N después de darse de
-- alta? Sin datos históricos todavía — devolverá cohorte_size=0 hasta que pase el tiempo, y el
-- panel debe mostrar "Sin datos" en ese caso, nunca un porcentaje inventado.
create or replace function admin_retencion(p_dias int)
returns table(cohorte_size bigint, retenidos bigint)
language sql
stable
security definer
set search_path = public
as $$
  with cohorte as (
    select id, creado_en::date as fecha_alta
    from empresas
    where creado_en::date = (current_date - p_dias)
  )
  select
    (select count(*) from cohorte)::bigint,
    (select count(distinct c.id) from cohorte c
       join event_log e on e.empresa_id = c.id
       where e.creado_en::date = c.fecha_alta + p_dias)::bigint
  where es_admin();
$$;
grant execute on function admin_retencion(int) to authenticated;
revoke execute on function admin_retencion(int) from anon, public;
