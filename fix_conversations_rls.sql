-- Fix RLS policies for conversations table
-- Run this in Supabase SQL editor if you get "row-level security policy" errors

-- Ensure RLS is enabled
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Conversations insert allowed" on public.conversations;
drop policy if exists "Conversations select if participant" on public.conversations;
drop policy if exists "Conversations update if participant" on public.conversations;

-- Recreate policies with proper permissions
-- Allow anyone authenticated to create conversations
create policy "Conversations insert allowed"
  on public.conversations
  for insert
  to authenticated
  with check (true);

-- Allow users to see conversations they participate in
create policy "Conversations select if participant"
  on public.conversations
  for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- Allow users to update conversations they participate in
create policy "Conversations update if participant"
  on public.conversations
  for update
  to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- Ensure participants policies are correct
drop policy if exists "Participants insert self" on public.conversation_participants;
create policy "Participants insert self"
  on public.conversation_participants
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Done

