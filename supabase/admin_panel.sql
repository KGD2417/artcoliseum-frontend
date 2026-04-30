-- =========================================================
-- Admin panel migration
-- Run AFTER all other SQL files. Standardises role-based access
-- and adds a `featured` flag for homepage highlights.
-- =========================================================

-- 1. Featured flag for homepage highlights
alter table public.artworks
  add column if not exists featured boolean not null default false;

create index if not exists idx_artworks_featured on public.artworks(featured) where featured;

-- 2. Status on artworks for optional approval workflow
alter table public.artworks
  add column if not exists status text not null default 'published';
  -- 'draft' | 'pending' | 'published' | 'rejected'

-- 3. Helper: role check based on profiles.role
create or replace function public.is_admin_role()
returns boolean language sql stable security definer as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_artist_role()
returns boolean language sql stable security definer as $$
  select coalesce((select role in ('artist','admin') from public.profiles where id = auth.uid()), false);
$$;

-- 4. Backfill: admins via legacy is_admin flag get role='admin'
update public.profiles set role = 'admin' where is_admin = true and role <> 'admin';

-- 5. Admin policies for full read/write on operational tables.
--    Existing policies stay (public read for artworks etc.); these add admin
--    overrides for write/delete and for tables previously read-restricted.
do $$
begin
  -- ARTWORKS: admins do everything; artists insert/update own; nobody else writes.
  drop policy if exists "admin all artworks"     on public.artworks;
  drop policy if exists "artist insert artwork"  on public.artworks;
  drop policy if exists "artist update own art"  on public.artworks;

  create policy "admin all artworks" on public.artworks
    for all using (public.is_admin_role()) with check (public.is_admin_role());

  create policy "artist insert artwork" on public.artworks
    for insert with check (
      public.is_artist_role()
      and artist_id = auth.uid()::text
    );

  create policy "artist update own art" on public.artworks
    for update using (
      public.is_artist_role()
      and artist_id = auth.uid()::text
    );

  -- EVENTS: admin full control
  drop policy if exists "admin all events" on public.events;
  create policy "admin all events" on public.events
    for all using (public.is_admin_role()) with check (public.is_admin_role());

  -- EVENT REGISTRATIONS: admin can read/manage all
  drop policy if exists "admin read registrations" on public.event_registrations;
  create policy "admin read registrations" on public.event_registrations
    for select using (public.is_admin_role());

  -- ORDERS: admin reads + updates status
  drop policy if exists "admin read orders"   on public.orders;
  drop policy if exists "admin update orders" on public.orders;
  create policy "admin read orders"   on public.orders
    for select using (public.is_admin_role());
  create policy "admin update orders" on public.orders
    for update using (public.is_admin_role()) with check (public.is_admin_role());

  drop policy if exists "admin read order items" on public.order_items;
  create policy "admin read order items" on public.order_items
    for select using (public.is_admin_role());

  -- CONTACT / SUPPORT / APPLICATIONS: admin reads + updates
  drop policy if exists "admin contact"    on public.contact_messages;
  drop policy if exists "admin support"    on public.support_tickets;
  drop policy if exists "admin support upd" on public.support_tickets;
  drop policy if exists "admin applications" on public.artist_applications;
  drop policy if exists "admin applications upd" on public.artist_applications;

  create policy "admin contact" on public.contact_messages
    for select using (public.is_admin_role());

  create policy "admin support" on public.support_tickets
    for select using (public.is_admin_role());
  create policy "admin support upd" on public.support_tickets
    for update using (public.is_admin_role()) with check (public.is_admin_role());

  create policy "admin applications" on public.artist_applications
    for select using (public.is_admin_role());
  create policy "admin applications upd" on public.artist_applications
    for update using (public.is_admin_role()) with check (public.is_admin_role());

  -- PROFILES: admin can read everyone (for showing user lists)
  drop policy if exists "admin read profiles" on public.profiles;
  create policy "admin read profiles" on public.profiles
    for select using (public.is_admin_role());
  drop policy if exists "admin update profiles" on public.profiles;
  create policy "admin update profiles" on public.profiles
    for update using (public.is_admin_role()) with check (public.is_admin_role());
end $$;

-- ---------------------------------------------------------
-- Make yourself admin:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------
