-- Función que aplica UN evento de Hotmart de forma atómica: idempotencia + búsqueda de la
-- cuenta (por subscriber_code primero, por email después) + transición de estado legal.
-- La llama SOLO el endpoint del webhook (app/api/webhooks/hotmart/route.ts) con la clave de
-- servicio — nunca el navegador. Ver docs/sistema/18-VENTA-HOTMART.md "SEGURIDAD DEL WEBHOOK".
--
-- ⚠️ DECISIÓN TÉCNICA (anotada en ESTADO.md): en cancelación se mantiene plan='starter' hasta
-- `access_until` (no se corta un periodo ya pagado), pero AÚN NO existe el cron de reconciliación
-- que baje a 'gratis' cuando ese plazo vence — se agrega antes de la primera venta real, cuando
-- se confirme con una compra de prueba el formato exacto de fechas que manda Hotmart.

create or replace function apply_hotmart_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_email text,
  p_subscriber_code text,
  p_new_status text,
  p_trial_ends_at timestamptz default null,
  p_access_until timestamptz default null,
  p_grace_ends_at timestamptz default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_current_status text;
begin
  if p_new_status not in ('trialing', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'chargeback') then
    raise exception 'estado inválido: %', p_new_status;
  end if;

  -- 1. Idempotencia técnica — Hotmart reenvía eventos.
  begin
    insert into processed_events (event_id, event_type, payload_hash) values (p_event_id, p_event_type, p_payload_hash);
  exception when unique_violation then
    insert into webhook_log (event_id, type, result) values (p_event_id, p_event_type, 'duplicate');
    return 'duplicate';
  end;

  -- 2. Localizar la cuenta: primero por subscriber_code (estable entre compras), luego por email
  --    del dueño (auth.users, solo legible aquí dentro por ser security definer — igual que
  --    admin_lista_empresas() en 0005).
  if p_subscriber_code is not null then
    select id, subscription_status into v_empresa_id, v_current_status
    from empresas where hotmart_subscriber_code = p_subscriber_code
    limit 1;
  end if;

  if v_empresa_id is null and p_email is not null then
    select e.id, e.subscription_status into v_empresa_id, v_current_status
    from empresas e
    join auth.users u on u.id = e.owner_id
    where lower(u.email) = lower(p_email)
    limit 1;
  end if;

  if v_empresa_id is null then
    insert into webhook_log (event_id, type, result) values (p_event_id, p_event_type, 'error');
    return 'no_account';
  end if;

  -- 3. Transición ILEGAL: nunca resucitar un refund/chargeback con un evento viejo reentregado.
  if v_current_status in ('refunded', 'chargeback') and p_new_status in ('active', 'trialing') then
    insert into webhook_log (event_id, type, result) values (p_event_id, p_event_type, 'illegal');
    return 'illegal';
  end if;

  -- 4. Aplicar. `plan` es lo que el resto de la app ya lee (getPlanEmpresa) — se mantiene
  --    sincronizado aquí en vez de tocar cada función que lo consume.
  update empresas set
    subscription_status = p_new_status,
    hotmart_subscriber_code = coalesce(p_subscriber_code, hotmart_subscriber_code),
    trial_ends_at = coalesce(p_trial_ends_at, trial_ends_at),
    first_paid_at = case when p_new_status = 'active' and first_paid_at is null then now() else first_paid_at end,
    access_until = coalesce(p_access_until, access_until),
    grace_ends_at = coalesce(p_grace_ends_at, grace_ends_at),
    plan = case
      when p_new_status in ('trialing', 'active', 'past_due') then 'starter'
      when p_new_status = 'cancelled' then 'starter' -- sigue activo hasta access_until (ver nota arriba)
      else 'gratis' -- expired / refunded / chargeback: se corta ya
    end
  where id = v_empresa_id;

  insert into webhook_log (event_id, type, result) values (p_event_id, p_event_type, 'applied');
  return 'applied';
end;
$$;

-- ⚠️ En este proyecto, revocar solo de PUBLIC no basta: anon/authenticated conservan EXECUTE
-- por un grant propio (verificado con has_function_privilege tras aplicar esto) — hay que
-- revocarlo de los 3 explícitamente, no solo de public.
revoke execute on function apply_hotmart_event(text, text, text, text, text, text, timestamptz, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function apply_hotmart_event(text, text, text, text, text, text, timestamptz, timestamptz, timestamptz) to service_role;
