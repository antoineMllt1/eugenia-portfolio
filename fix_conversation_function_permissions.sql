-- Fix permissions for create_conversation_with_participants function
-- Run this to ensure the function has proper permissions

-- Drop and recreate the function with proper security settings
drop function if exists public.create_conversation_with_participants(uuid, uuid);

create or replace function public.create_conversation_with_participants(
  participant1_id uuid,
  participant2_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_conversation_id uuid;
begin
  -- Create conversation
  insert into public.conversations (id, created_at, updated_at)
  values (gen_random_uuid(), now(), now())
  returning id into new_conversation_id;
  
  -- Add participants
  insert into public.conversation_participants (conversation_id, user_id, created_at)
  values 
    (new_conversation_id, participant1_id, now()),
    (new_conversation_id, participant2_id, now());
  
  return new_conversation_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_conversation_with_participants(uuid, uuid) to authenticated;
grant execute on function public.create_conversation_with_participants(uuid, uuid) to anon;

-- Also grant to service_role for edge functions
grant execute on function public.create_conversation_with_participants(uuid, uuid) to service_role;

-- Verify the function exists
select 
  proname as function_name,
  proargnames as parameters,
  prosecdef as security_definer
from pg_proc
where proname = 'create_conversation_with_participants';

