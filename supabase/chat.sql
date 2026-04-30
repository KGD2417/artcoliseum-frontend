-- =========================================================
-- Chat — run AFTER schema.sql
-- =========================================================

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  conversation_key text not null,   -- e.g. 'artist:elena-vance' or 'curator:p1'
  sender text not null,             -- 'me' | 'bot' | 'artist' | 'curator'
  text text not null,
  created_at timestamptz default now()
);

create index if not exists idx_chat_user_conv
  on public.chat_messages(user_id, conversation_key, created_at);

alter table public.chat_messages enable row level security;

create policy "read own chat"   on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "insert own chat" on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- Enable realtime for chat_messages
alter publication supabase_realtime add table public.chat_messages;
