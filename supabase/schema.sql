-- =========================================================
-- Aureum Gallery / Art Coliseum — Supabase schema
-- Run this in Supabase SQL Editor (one shot).
-- =========================================================

-- ---------- Profiles (extends auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- Categories ----------
create table if not exists public.categories (
  id text primary key,            -- e.g. 'oil', 'digital'
  label text not null,
  parent_id text references public.categories(id),
  created_at timestamptz default now()
);

-- ---------- Artists ----------
create table if not exists public.artists (
  id text primary key,            -- slug e.g. 'elena-vance'
  name text not null,
  role text,
  bio text,
  image_url text,
  works_count int default 0,
  created_at timestamptz default now()
);

-- ---------- Artworks ----------
create table if not exists public.artworks (
  id text primary key,            -- 'p1', 'p2'... or uuid
  title text not null,
  medium text,
  artist_id text references public.artists(id) on delete set null,
  artist_name text,               -- denormalized fallback
  year text,
  price numeric(12,2) not null default 0,
  size text,                      -- 'small' | 'medium' | 'large'
  style text,
  category_id text references public.categories(id),
  image_url text,
  description text,
  in_stock boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_artworks_category on public.artworks(category_id);
create index if not exists idx_artworks_artist   on public.artworks(artist_id);
create index if not exists idx_artworks_style    on public.artworks(style);

-- ---------- Events ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'upcoming',  -- 'ongoing' | 'upcoming' | 'past'
  starts_at timestamptz,
  ends_at   timestamptz,
  location  text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id  uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text,
  created_at timestamptz default now()
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  full_name text,
  phone text,
  shipping_address jsonb,
  subtotal numeric(12,2) not null default 0,
  total    numeric(12,2) not null default 0,
  currency text default 'INR',
  status text not null default 'pending', -- pending | paid | shipped | delivered | cancelled
  payment_provider text,                  -- 'razorpay' | 'stripe'
  payment_id text,
  payment_meta jsonb,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  artwork_id text references public.artworks(id),
  title text,
  price numeric(12,2) not null,
  qty int not null default 1
);

-- ---------- Forms ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text not null,
  subject text,
  message text not null,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.artist_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  portfolio_url text,
  bio text,
  sample_image_urls text[],
  status text default 'pending',
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.artists             enable row level security;
alter table public.artworks            enable row level security;
alter table public.events              enable row level security;
alter table public.event_registrations enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.artist_applications enable row level security;

-- Public read for catalog
create policy "public read categories" on public.categories for select using (true);
create policy "public read artists"    on public.artists    for select using (true);
create policy "public read artworks"   on public.artworks   for select using (true);
create policy "public read events"     on public.events     for select using (true);

-- Profiles: user can read/update own row
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Anyone (anon) can insert into form tables
create policy "insert contact"     on public.contact_messages    for insert with check (true);
create policy "insert support"     on public.support_tickets     for insert with check (true);
create policy "insert application" on public.artist_applications for insert with check (true);
create policy "insert event reg"   on public.event_registrations for insert with check (true);

-- Orders: user can insert/read their own; anon checkout allowed (user_id null)
create policy "insert order"     on public.orders for insert with check (true);
create policy "read own orders"  on public.orders for select using (auth.uid() = user_id);
create policy "insert order item" on public.order_items for insert with check (true);
create policy "read own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
