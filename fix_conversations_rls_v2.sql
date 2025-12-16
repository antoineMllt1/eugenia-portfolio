-- Fix RLS policies for conversations table - VERSION 2
-- Run this in Supabase SQL editor if you still get "row-level security policy" errors

-- First, let's check and fix the policies more explicitly

-- Drop ALL existing policies on conversations
drop policy if exists "Conversations insert allowed" on public.conversations;
drop policy if exists "Conversations select if participant" on public.conversations;
drop policy if exists "Conversations update if participant" on public.conversations;
drop policy if exists "Enable insert for authenticated users only" on public.conversations;
drop policy if exists "Enable select for authenticated users only" on public.conversations;

-- Ensure RLS is enabled
alter table public.conversations enable row level security;

-- Policy 1: Allow authenticated users to INSERT conversations
create policy "Enable insert for authenticated users only"
  on public.conversations
  for insert
  to authenticated
  with check (true);

-- Policy 2: Allow users to SELECT conversations they participate in
create policy "Enable select for authenticated users only"
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

-- Policy 3: Allow users to UPDATE conversations they participate in
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

-- Also ensure participants policies are correct
drop policy if exists "Participants insert self" on public.conversation_participants;
drop policy if exists "Participants select self" on public.conversation_participants;

create policy "Participants insert self"
  on public.conversation_participants
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Participants select self"
  on public.conversation_participants
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Verify policies are created
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename in ('conversations', 'conversation_participants')
order by tablename, policyname;

