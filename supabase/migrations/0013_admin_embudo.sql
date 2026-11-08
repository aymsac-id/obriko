-- Camino de venta para el panel de admin (lib/medicion.ts → event_log): visitantes únicos por
-- paso y por origen, contados en la base (no en el navegador) para que el conteo no se corte en
-- las 1000 filas que devuelve una consulta. Cada visitante cuenta con el PRIMER origen con que
-- llegó (first-touch). SECURITY INVOKER: la política admin_lee_event_log decide — un usuario que
-- no es admin recibe cero filas.

create or replace function admin_embudo(p_desde timestamptz)
returns table (tipo text, origen text, visitantes bigint)
language sql
stable
security invoker
set search_path = public
as $$
  with pasos as (
    select e.tipo,
           coalesce(e.metadata->>'visitante', 'desconocido') as visitante,
           coalesce(e.metadata->>'origen', 'directo') as origen,
           e.creado_en
    from event_log e
    where e.creado_en >= p_desde
      and e.tipo in ('visita_landing', 'onboarding_iniciado', 'paywall_visto', 'registro_enviado', 'checkout_abierto')
  ),
  primero as (
    select visitante, (array_agg(origen order by creado_en))[1] as origen
    from pasos
    group by visitante
  )
  select p.tipo, f.origen, count(distinct p.visitante)
  from pasos p
  join primero f using (visitante)
  group by p.tipo, f.origen;
$$;

grant execute on function admin_embudo(timestamptz) to authenticated;
