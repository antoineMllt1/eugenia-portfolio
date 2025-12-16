-- Create a function to get all conversations for a user
-- This bypasses RLS to allow seeing all conversations where the user is a participant

CREATE OR REPLACE FUNCTION public.get_user_conversations(
  current_user_id uuid
)
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_username text,
  other_full_name text,
  other_avatar_url text,
  other_course text,
  last_message_content text,
  last_message_created_at timestamp with time zone,
  conversation_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_conversations AS (
    SELECT DISTINCT cp.conversation_id as conv_id
    FROM conversation_participants cp
    WHERE cp.user_id = current_user_id
  )
  SELECT DISTINCT ON (uc.conv_id)
    uc.conv_id as conversation_id,
    other_p.user_id as other_user_id,
    p.username as other_username,
    p.full_name as other_full_name,
    p.avatar_url as other_avatar_url,
    p.course as other_course,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_created_at,
    c.updated_at as conversation_updated_at
  FROM user_conversations uc
  INNER JOIN conversations c ON c.id = uc.conv_id
  INNER JOIN conversation_participants other_p ON other_p.conversation_id = uc.conv_id 
    AND other_p.user_id != current_user_id
  LEFT JOIN profiles p ON p.id = other_p.user_id
  LEFT JOIN LATERAL (
    SELECT msg.content, msg.created_at
    FROM messages msg
    WHERE msg.conversation_id = uc.conv_id
    ORDER BY msg.created_at DESC
    LIMIT 1
  ) last_msg ON true
  ORDER BY uc.conv_id, COALESCE(c.updated_at, c.created_at) DESC NULLS LAST, other_p.user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid) TO service_role;

