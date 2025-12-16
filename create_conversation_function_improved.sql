-- Improved function to create a conversation with participants
-- First checks if a conversation already exists between the two users
-- If it exists, returns the existing conversation_id
-- If not, creates a new conversation

CREATE OR REPLACE FUNCTION create_conversation_with_participants(
  participant1_id UUID,
  participant2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_conv_id UUID;
  new_conv_id UUID;
BEGIN
  -- First, check if a conversation already exists between these two users
  SELECT check_existing_conversation(participant1_id, participant2_id)
  INTO existing_conv_id;
  
  -- If conversation exists, return it
  IF existing_conv_id IS NOT NULL THEN
    RETURN existing_conv_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations DEFAULT VALUES
  RETURNING id INTO new_conv_id;
  
  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (new_conv_id, participant1_id),
    (new_conv_id, participant2_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  
  RETURN new_conv_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Error creating conversation: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_conversation_with_participants(UUID, UUID) TO service_role;

