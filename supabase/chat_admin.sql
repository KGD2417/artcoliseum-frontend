-- =========================================================
-- Admin chat — run AFTER chat.sql
-- Adds an is_admin flag and lets admins read/write any conversation,
-- so the /admin/inbox page can reply on the artist's/curator's behalf.
-- =========================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Admin can read/insert any chat_message
drop policy if exists "admin read chat"   on public.chat_messages;
drop policy if exists "admin insert chat" on public.chat_messages;

create policy "admin read chat"
  on public.chat_messages for select
  using (public.is_admin());

create policy "admin insert chat"
  on public.chat_messages for insert
  with check (public.is_admin());

-- Track which conversations a user has read up to (for unread badges)
create table if not exists public.chat_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_key text not null,
  last_read_at timestamptz not null default now(),
  primary key (user_id, conversation_key)
);

alter table public.chat_reads enable row level security;

create policy "own chat reads read"   on public.chat_reads
  for select using (auth.uid() = user_id);
create policy "own chat reads upsert" on public.chat_reads
  for insert with check (auth.uid() = user_id);
create policy "own chat reads update" on public.chat_reads
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- HOW TO MAKE YOURSELF AN ADMIN (run once after signing up):
--   update public.profiles set is_admin = true where id = auth.uid();
-- Or, replacing your email:
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------
