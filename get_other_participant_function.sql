-- Create a function to get the other participant in a conversation
-- This bypasses RLS to allow seeing the other participant

CREATE OR REPLACE FUNCTION public.get_other_participant(
  conversation_id_param uuid,
  current_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  other_user_id uuid;
BEGIN
  -- Get the other participant (not the current user)
  SELECT user_id INTO other_user_id
  FROM public.conversation_participants
  WHERE conversation_id = conversation_id_param
    AND user_id != current_user_id
  LIMIT 1;
  
  RETURN other_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_other_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_other_participant(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_other_participant(uuid, uuid) TO service_role;

