-- Function to check if a conversation already exists between two users
-- Returns the conversation_id if it exists, NULL otherwise

CREATE OR REPLACE FUNCTION check_existing_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_conv_id UUID;
BEGIN
  -- Find a conversation where both users are participants
  SELECT DISTINCT cp1.conversation_id
  INTO existing_conv_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND cp1.conversation_id = cp2.conversation_id
  LIMIT 1;
  
  RETURN existing_conv_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_existing_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_existing_conversation(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_existing_conversation(UUID, UUID) TO service_role;

