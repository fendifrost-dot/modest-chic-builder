-- "What's to Come" pre-order concepts.
--
-- Moved out of content/preorders.json because an edge function has no filesystem
-- to read it from, and because the checkout path must take pre-order prices from
-- a server source it controls. That file stays in the repo as the original seed;
-- THIS TABLE is now the live source.
--
-- Every row ships with enabled=false and empty title/expected_ship/price_cents.
-- A piece only becomes purchasable once the Founder fills all three in AND sets
-- enabled=true. The edge function re-checks that on every checkout, so flipping
-- enabled alone cannot open a sale with no price.
--
-- Server-only, like the rest: RLS on, no policies. The public listing is served
-- by the preorders edge function using the service role.

create table if not exists public.preorders (
  id             text primary key,
  handle         text not null,
  title          text not null default '',
  colorway       text not null default '',
  summary        text not null default '',
  expected_ship  text not null default '',
  price_cents    integer check (price_cents is null or price_cents > 0),
  currency       text not null default 'USD',
  images         jsonb not null default '[]'::jsonb,
  enabled        boolean not null default false,
  position       integer not null default 0,
  updated_at     timestamptz not null default now()
);

alter table public.preorders enable row level security;

create index if not exists preorders_position_idx on public.preorders (position);

insert into public.preorders
  (id, handle, title, colorway, summary, expected_ship, price_cents, currency, images, enabled, position)
values
  ('concept-cap-grey-white', 'concept-cap-grey-white', '', 'Grey / white', 'Snakeskin-textured 6-panel cap in grey and white. Perforated side panels, suede-like brim, brass-buckle strap. The bear enamel pin is optional.', '', null, 'USD', '[{"src":"/images/preorders/cap-grey-white-side.webp","alt":"Snakeskin-textured 6-panel cap in grey and white, side view","width":1200,"height":1600},{"src":"/images/preorders/cap-grey-white-back.webp","alt":"Snakeskin-textured 6-panel cap in grey and white, back view with brass buckle and optional bear enamel pin","width":1200,"height":1600}]'::jsonb, false, 0),
  ('concept-cap-tan', 'concept-cap-tan', '', 'Tan', 'Snakeskin-textured 6-panel cap in tan. Perforated side panels, suede-like brim, brass-buckle strap. The bear enamel pin is optional.', '', null, 'USD', '[{"src":"/images/preorders/cap-tan-side.webp","alt":"Snakeskin-textured 6-panel cap in tan, side view","width":1200,"height":1600},{"src":"/images/preorders/cap-tan-back.webp","alt":"Snakeskin-textured 6-panel cap in tan, back view with brass buckle and optional bear enamel pin","width":1200,"height":1600}]'::jsonb, false, 1),
  ('concept-cap-golden', 'concept-cap-golden', '', 'Golden', 'Snakeskin-textured 6-panel cap in golden. Perforated side panels, suede-like brim, brass-buckle strap. The bear enamel pin is optional.', '', null, 'USD', '[{"src":"/images/preorders/cap-golden-side.webp","alt":"Snakeskin-textured 6-panel cap in golden, side view","width":1200,"height":1600},{"src":"/images/preorders/cap-golden-back.webp","alt":"Snakeskin-textured 6-panel cap in golden, back view with brass buckle and optional bear enamel pin","width":1200,"height":1600}]'::jsonb, false, 2),
  ('concept-cap-brown-black', 'concept-cap-brown-black', '', 'Brown / black', 'Snakeskin-textured 6-panel cap in brown and black. Perforated side panels, suede-like brim, brass-buckle strap. The bear enamel pin is optional.', '', null, 'USD', '[{"src":"/images/preorders/cap-brown-black-side.webp","alt":"Snakeskin-textured 6-panel cap in brown and black, side view","width":1200,"height":1600},{"src":"/images/preorders/cap-brown-black-back.webp","alt":"Snakeskin-textured 6-panel cap in brown and black, back view with brass buckle and optional bear enamel pin","width":1200,"height":1600}]'::jsonb, false, 3),
  ('concept-bear-pin-set', 'concept-bear-pin-set', '', 'Six finishes', 'Six-finish bear mascot pin set. The same standing bear appears in six enamel finishes: red jacket, silver, crystal gold, solid gold, crystal silver, and pearl.', '', null, 'USD', '[{"src":"/images/preorders/bear-pin-set.webp","alt":"Six bear mascot enamel pins in red jacket, silver, crystal gold, solid gold, crystal silver, and pearl finishes","width":1200,"height":1600}]'::jsonb, false, 4)
on conflict (id) do nothing;

comment on table public.preorders is
  'What''s to Come concepts. enabled=true plus a title, expected_ship and price_cents opens a pre-order. Not Printify products.';
