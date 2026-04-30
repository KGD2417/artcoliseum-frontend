-- =========================================================
-- Artist role + artist-to-artist chat
-- Run AFTER chat.sql and chat_admin.sql
-- =========================================================

-- 1. Add role to profiles ('user' | 'artist' | 'admin')
alter table public.profiles
  add column if not exists role text not null default 'user';

-- 2. Link artist_applications to the submitting auth user
alter table public.artist_applications
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 3. Auto-promote: when an application is inserted, mark the user as artist.
--    Replace with a manual approval workflow later if needed — for now, the
--    spec is "after filling the form they become an artist".
create or replace function public.promote_to_artist()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is not null then
    update public.profiles
       set role = 'artist'
     where id = new.user_id and role <> 'admin';
  end if;
  return new;
end; $$;

drop trigger if exists on_artist_application on public.artist_applications;
create trigger on_artist_application
  after insert on public.artist_applications
  for each row execute procedure public.promote_to_artist();

-- 4. Helper: list current user's role
create or replace function public.my_role()
returns text language sql stable security definer as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user');
$$;

-- 5. Peer-to-peer chat policies for artists.
--    conversation_key format for peer chats: 'peer:<uuidA>:<uuidB>' where
--    the two UUIDs are sorted lexicographically so both parties hit the
--    same key. Either participant can read/insert; messages get delivered
--    via Realtime to both sides.
drop policy if exists "peer read chat"   on public.chat_messages;
drop policy if exists "peer insert chat" on public.chat_messages;

create policy "peer read chat"
  on public.chat_messages for select
  using (
    conversation_key like 'peer:%'
    and public.my_role() = 'artist'
    and auth.uid()::text in (
      split_part(conversation_key, ':', 2),
      split_part(conversation_key, ':', 3)
    )
  );

create policy "peer insert chat"
  on public.chat_messages for insert
  with check (
    conversation_key like 'peer:%'
    and public.my_role() = 'artist'
    and auth.uid() = user_id
    and auth.uid()::text in (
      split_part(conversation_key, ':', 2),
      split_part(conversation_key, ':', 3)
    )
  );

-- 6. (Optional) Block normal users from chatting with artists/curators by
--    keeping the existing "own chat" policies. Admin support (key prefix
--    'admin:' from ProductDetail) is still allowed because user_id matches.
