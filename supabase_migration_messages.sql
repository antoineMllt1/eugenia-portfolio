-- Migration: Messaging (conversations, participants, messages)
-- Run this in Supabase SQL editor (project > SQL > New query)

-- Enable extensions if needed (gen_random_uuid)
create extension if not exists "pgcrypto";

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversation participants
create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamptz default now(),
  unique (conversation_id, user_id)
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  seen_at timestamptz
);

-- Indexes
create index if not exists idx_conversation_participants_conversation on public.conversation_participants(conversation_id);
create index if not exists idx_conversation_participants_user on public.conversation_participants(user_id);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at);

-- Timestamps trigger
create or replace function public.set_conversations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function public.set_conversations_updated_at();

-- RLS
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Policies: Conversations
drop policy if exists "Conversations select if participant" on public.conversations;
create policy "Conversations select if participant"
  on public.conversations
  for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Conversations insert allowed" on public.conversations;
create policy "Conversations insert allowed"
  on public.conversations
  for insert
  with check (true); -- actual participant enforcement via participants table

drop policy if exists "Conversations update if participant" on public.conversations;
create policy "Conversations update if participant"
  on public.conversations
  for update
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- Policies: Participants
drop policy if exists "Participants select self" on public.conversation_participants;
create policy "Participants select self"
  on public.conversation_participants
  for select
  using (auth.uid() = user_id);

drop policy if exists "Participants insert self" on public.conversation_participants;
create policy "Participants insert self"
  on public.conversation_participants
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Participants delete self" on public.conversation_participants;
create policy "Participants delete self"
  on public.conversation_participants
  for delete
  using (auth.uid() = user_id);

-- Policies: Messages
drop policy if exists "Messages select if participant" on public.messages;
create policy "Messages select if participant"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Messages insert if participant" on public.messages;
create policy "Messages insert if participant"
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );

-- Optional: prevent deletes/updates on messages (or allow only author)
drop policy if exists "Messages delete if author" on public.messages;
create policy "Messages delete if author"
  on public.messages
  for delete
  using (auth.uid() = sender_id);

drop policy if exists "Messages update if author" on public.messages;
create policy "Messages update if author"
  on public.messages
  for update
  using (auth.uid() = sender_id);

-- Done

