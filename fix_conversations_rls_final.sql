-- Fix RLS policies for conversations - FINAL VERSION
-- This script completely removes and recreates all policies

-- Step 1: Disable RLS temporarily to clean up
alter table public.conversations disable row level security;
alter table public.conversation_participants disable row level security;

-- Step 2: Drop ALL existing policies (use CASCADE to be sure)
do $$
declare
    r record;
begin
    for r in (select policyname from pg_policies where tablename = 'conversations' and schemaname = 'public') loop
        execute 'drop policy if exists ' || quote_ident(r.policyname) || ' on public.conversations';
    end loop;
    for r in (select policyname from pg_policies where tablename = 'conversation_participants' and schemaname = 'public') loop
        execute 'drop policy if exists ' || quote_ident(r.policyname) || ' on public.conversation_participants';
    end loop;
end $$;

-- Step 3: Re-enable RLS
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;

-- Step 4: Create simple, permissive policies

-- CONVERSATIONS: Allow authenticated users to insert
create policy "conversations_insert_policy"
  on public.conversations
  for insert
  to authenticated
  with check (true);

-- CONVERSATIONS: Allow users to select conversations they participate in
create policy "conversations_select_policy"
  on public.conversations
  for select
  to authenticated
  using (
    exists (
      select 1 
      from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- CONVERSATIONS: Allow users to update conversations they participate in
create policy "conversations_update_policy"
  on public.conversations
  for update
  to authenticated
  using (
    exists (
      select 1 
      from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.user_id = auth.uid()
    )
  );

-- PARTICIPANTS: Allow users to insert themselves as participants
create policy "participants_insert_policy"
  on public.conversation_participants
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- PARTICIPANTS: Allow users to select their own participants records
create policy "participants_select_policy"
  on public.conversation_participants
  for select
  to authenticated
  using (auth.uid() = user_id);

-- PARTICIPANTS: Allow users to delete their own participants records
create policy "participants_delete_policy"
  on public.conversation_participants
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Step 5: Verify the policies were created
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where tablename in ('conversations', 'conversation_participants')
  and schemaname = 'public'
order by tablename, cmd;

-- Step 6: Test query (should return at least the insert policy)
select count(*) as policy_count
from pg_policies
where tablename = 'conversations' 
  and schemaname = 'public'
  and cmd = 'INSERT';

