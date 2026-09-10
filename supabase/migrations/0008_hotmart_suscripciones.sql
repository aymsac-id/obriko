-- Conectar Hotmart (Sesión 6.2, pedido directo del usuario) — 09-VENTA-HOTMART.md / doctrina del SO.
-- Modelo 2B (onboarding-first / free tier registrado, ver 18-VENTA-HOTMART.md): el usuario ya se
-- registró gratis con Supabase Auth ANTES de pagar; cuando compra Starter desde dentro de la app,
-- el webhook lo ENCUENTRA por email y lo SUBE a Starter (nunca crea una segunda cuenta).

-- ── SUSCRIPCIÓN EN EMPRESAS ──────────────────────────────────────────────────────────────
alter table empresas
  add column if not exists subscription_status text
    check (subscription_status in ('none', 'trialing', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'chargeback'))
    not null default 'none',
  add column if not exists trial_ends_at timestamptz,
  add column if not exists first_paid_at timestamptz,
  add column if not exists access_until timestamptz,
  add column if not exists grace_ends_at timestamptz,
  add column if not exists hotmart_subscriber_code text;

create index if not exists empresas_hotmart_subscriber_idx on empresas(hotmart_subscriber_code);

-- ── IDEMPOTENCIA TÉCNICA (Hotmart reenvía eventos) ───────────────────────────────────────
create table if not exists processed_events (
  event_id     text primary key,
  event_type   text not null,
  payload_hash text,
  processed_at timestamptz not null default now()
);

-- ── LOG DE TODO INTENTO (éxito y fallo) — panel de salud del webhook ─────────────────────
create table if not exists webhook_log (
  id          bigserial primary key,
  event_id    text,
  type        text,
  result      text not null check (result in ('applied', 'duplicate', 'illegal', 'unauthorized', 'error')),
  received_at timestamptz not null default now()
);
create index if not exists webhook_log_received_idx on webhook_log (received_at desc);
create index if not exists webhook_log_result_idx on webhook_log (result, received_at desc);

-- ── LEDGER ECONÓMICO (dedupe por transacción real, no por event_id técnico) ──────────────
create table if not exists payment_transactions (
  provider text not null,
  transaction_id text not null,
  economic_kind text not null check (economic_kind in ('sale', 'refund', 'chargeback')),
  product_id text not null,
  offer_id text,
  amount_minor bigint not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz not null,
  raw_event_id text not null,
  primary key (provider, transaction_id, economic_kind)
);

-- Ninguna de estas 3 tablas nuevas lleva RLS de usuario final — solo las toca el webhook con la
-- clave de servicio (SUPABASE_SECRET_KEY), nunca el navegador. Se dejan SIN políticas (bloqueadas
-- por defecto para anon/authenticated) y con RLS activado, igual que `admins` en 0004.
alter table processed_events enable row level security;
alter table webhook_log enable row level security;
alter table payment_transactions enable row level security;

-- El panel de admin (ya existente, es_admin()) puede LEER el log para el panel de salud.
create policy "admin_lee_webhook_log" on webhook_log for select using (es_admin());
create policy "admin_lee_payment_transactions" on payment_transactions for select using (es_admin());
