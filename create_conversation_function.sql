-- Create a function to create conversations that bypasses RLS issues
-- This function will be called with SECURITY DEFINER to run with elevated privileges

create or replace function public.create_conversation_with_participants(
  participant1_id uuid,
  participant2_id uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_conversation_id uuid;
begin
  -- Create conversation
  insert into public.conversations (id)
  values (gen_random_uuid())
  returning id into new_conversation_id;
  
  -- Add participants
  insert into public.conversation_participants (conversation_id, user_id)
  values 
    (new_conversation_id, participant1_id),
    (new_conversation_id, participant2_id);
  
  return new_conversation_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_conversation_with_participants(uuid, uuid) to authenticated;

-- Also create a policy to allow users to call this function
-- (Actually, functions with SECURITY DEFINER bypass RLS, so this should work)

