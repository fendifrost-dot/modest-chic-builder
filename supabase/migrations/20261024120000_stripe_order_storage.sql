-- Durable order storage for the Printify + Stripe storefront.
--
-- Replaces the filesystem store in server/store.mjs, which wrote JSON under data/.
-- On an ephemeral host that directory is wiped on every redeploy, which loses the
-- checkout handoff and leaves a paid Stripe session with no Printify order.
--
-- Every table here is server-only. RLS is enabled with NO policies, so the anon and
-- authenticated roles cannot read or write any of it; only the service role key used
-- by the edge functions can. Do not add policies without a specific reason.

create table if not exists public.checkout_handoffs (
  id          text primary key,
  source      text not null check (source in ('catalog', 'preorder')),
  items       jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.checkout_sessions (
  id          text primary key,
  handoff_id  text references public.checkout_handoffs (id) on delete set null,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);

-- One row per Stripe Checkout Session we have acted on. The primary key is the
-- dedupe guard: a replayed webhook hits a conflict instead of double-ordering.
create table if not exists public.orders (
  session_id   text primary key,
  handoff_id   text,
  status       text not null,
  result       jsonb not null,
  recorded_at  timestamptz not null default now()
);

-- Event-level idempotency. Stripe can deliver the same event id more than once,
-- and can deliver several event types for one session.
create table if not exists public.stripe_webhook_events (
  id           text primary key,
  type         text not null,
  session_id   text,
  received_at  timestamptz not null default now()
);

alter table public.checkout_handoffs      enable row level security;
alter table public.checkout_sessions      enable row level security;
alter table public.orders                 enable row level security;
alter table public.stripe_webhook_events  enable row level security;

create index if not exists orders_status_idx
  on public.orders (status);
create index if not exists orders_handoff_id_idx
  on public.orders (handoff_id);
create index if not exists checkout_handoffs_created_at_idx
  on public.checkout_handoffs (created_at desc);
create index if not exists stripe_webhook_events_session_idx
  on public.stripe_webhook_events (session_id);

comment on table public.orders is
  'One row per Stripe Checkout Session acted on. status=needs_attention means payment succeeded but fulfilment did not - query these.';
