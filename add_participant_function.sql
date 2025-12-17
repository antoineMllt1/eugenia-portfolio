-- Create a function to add a participant to an existing conversation
-- This bypasses RLS to allow adding the other participant

CREATE OR REPLACE FUNCTION public.add_conversation_participant(
  conversation_id_param uuid,
  user_id_param uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add participant with conflict handling
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conversation_id_param, user_id_param)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.add_conversation_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_conversation_participant(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.add_conversation_participant(uuid, uuid) TO service_role;

