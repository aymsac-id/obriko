-- Guarda los IDs de los correos programados en Resend (dunning y win-back) para poder
-- cancelarlos si la cuenta se recupera antes de que termine la cadencia (ej. el cliente
-- actualiza su tarjeta al día 2, no hace falta que le sigan llegando los avisos de días 3/5/7).

alter table empresas
  add column if not exists dunning_email_ids text[],
  add column if not exists winback_email_ids text[];
