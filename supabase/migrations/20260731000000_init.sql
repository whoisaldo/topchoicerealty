-- Top Choice Realty — initial schema.
-- Translated from the previous Mongoose models (users, listings, customers, inquiries).
-- All access goes through the Vercel functions using the service_role key, so RLS is
-- enabled with no policies: anon and authenticated roles get nothing.

-- ---------------------------------------------------------------- tables

create table public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  name          text not null,
  phone         text not null,
  photo_url     text,
  bio           text,
  role          text not null default 'agent' check (role in ('agent', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.listings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  address      text not null,
  neighborhood text not null,
  price        numeric(12, 2) not null check (price >= 0),
  beds         integer not null check (beds >= 0),
  baths        numeric(4, 1) not null check (baths >= 0),
  sqft         integer not null check (sqft >= 0),
  description  text not null,
  -- was `imageUrls: [String]` with a custom "at least one" validator
  image_urls   text[] not null check (cardinality(image_urls) >= 1),
  status       text not null default 'active' check (status in ('active', 'pending', 'sold')),
  agent_id     uuid not null references public.users(id) on delete cascade,
  customer_id  uuid,  -- FK added below (circular with customers.listing_id)
  sold_date    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.customers (
  id             uuid primary key default gen_random_uuid(),
  agent_id       uuid not null references public.users(id) on delete cascade,
  listing_id     uuid,  -- FK added below
  first_name     text not null,
  last_name      text not null,
  email          text not null,
  phone          text not null,
  address        text,
  purchase_date  timestamptz,
  purchase_price numeric(12, 2) check (purchase_price >= 0),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.listings
  add constraint listings_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete set null;

alter table public.customers
  add constraint customers_listing_id_fkey
  foreign key (listing_id) references public.listings(id) on delete set null;

create table public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings(id) on delete cascade,
  agent_id     uuid not null references public.users(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  email_status text not null default 'queued' check (email_status in ('queued', 'sent', 'failed')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Replaces express-rate-limit's in-memory store, which is per-instance and so
-- useless on serverless.
create table public.rate_limits (
  key          text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now()
);

-- ---------------------------------------------------------------- indexes

create index listings_neighborhood_idx on public.listings (neighborhood);
create index listings_price_idx        on public.listings (price);
create index listings_status_idx       on public.listings (status);
create index listings_agent_id_idx     on public.listings (agent_id);
create index listings_customer_id_idx  on public.listings (customer_id);
create index listings_status_neighborhood_price_idx
  on public.listings (status, neighborhood, price);

create index customers_agent_id_idx   on public.customers (agent_id);
create index customers_listing_id_idx on public.customers (listing_id);
create index customers_agent_name_idx on public.customers (agent_id, last_name, first_name);
create index customers_agent_email_idx on public.customers (agent_id, email);

create index inquiries_listing_id_idx on public.inquiries (listing_id);
create index inquiries_agent_id_idx   on public.inquiries (agent_id);

-- ---------------------------------------------------------------- updated_at

-- Mongoose's { timestamps: true } maintained updatedAt on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at     before update on public.users     for each row execute function public.set_updated_at();
create trigger listings_set_updated_at  before update on public.listings  for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- mark sold

-- The old API did this inside services/customers.ts#linkCustomerToListing: creating a
-- customer with a listingId flipped that listing to sold. Kept as an RPC so the
-- two writes stay atomic, and so ownership is checked in one place.
create or replace function public.link_customer_to_listing(
  p_listing_id  uuid,
  p_customer_id uuid,
  p_agent_id    uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.listings
     set customer_id = p_customer_id,
         sold_date   = now(),
         status      = 'sold'
   where id = p_listing_id
     and agent_id = p_agent_id;

  update public.customers
     set listing_id = p_listing_id
   where id = p_customer_id
     and agent_id = p_agent_id;
end;
$$;

revoke all on function public.link_customer_to_listing(uuid, uuid, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------- RLS

alter table public.users       enable row level security;
alter table public.listings    enable row level security;
alter table public.customers   enable row level security;
alter table public.inquiries   enable row level security;
alter table public.rate_limits enable row level security;
