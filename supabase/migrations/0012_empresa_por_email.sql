-- Helper SOLO para el webhook (service_role): busca la empresa por el correo del dueño, para
-- programar/cancelar los correos de dunning y win-back que viven fuera de apply_hotmart_event.
-- supabase-js con service_role no puede leer auth.users directo (el cliente REST solo expone
-- public) — de ahí la necesidad de esta función security definer, igual que las ya existentes.

create or replace function empresa_por_email(p_email text)
returns table(id uuid, dunning_email_ids text[], winback_email_ids text[])
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.dunning_email_ids, e.winback_email_ids
  from empresas e
  join auth.users u on u.id = e.owner_id
  where lower(u.email) = lower(p_email)
  limit 1;
$$;

revoke execute on function empresa_por_email(text) from public, anon, authenticated;
grant execute on function empresa_por_email(text) to service_role;
