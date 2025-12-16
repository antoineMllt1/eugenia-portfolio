-- Fix the create_conversation_with_participants function
-- This version ensures both participants are created correctly

DROP FUNCTION IF EXISTS public.create_conversation_with_participants(uuid, uuid);

CREATE OR REPLACE FUNCTION public.create_conversation_with_participants(
  participant1_id uuid,
  participant2_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conversation_id uuid;
  participant1_exists boolean;
  participant2_exists boolean;
BEGIN
  -- Validate inputs
  IF participant1_id IS NULL OR participant2_id IS NULL THEN
    RAISE EXCEPTION 'Both participant IDs must be provided';
  END IF;
  
  IF participant1_id = participant2_id THEN
    RAISE EXCEPTION 'Cannot create conversation with the same user twice';
  END IF;
  
  -- Create conversation
  INSERT INTO public.conversations (id, updated_at)
  VALUES (gen_random_uuid(), NOW())
  RETURNING id INTO new_conversation_id;
  
  -- Add participants with conflict handling
  -- Participant 1
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (new_conversation_id, participant1_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  
  -- Participant 2
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (new_conversation_id, participant2_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  
  -- Verify both participants were created
  SELECT EXISTS(
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = new_conversation_id AND user_id = participant1_id
  ) INTO participant1_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = new_conversation_id AND user_id = participant2_id
  ) INTO participant2_exists;
  
  IF NOT participant1_exists OR NOT participant2_exists THEN
    RAISE EXCEPTION 'Failed to create both participants. participant1: %, participant2: %', 
      participant1_exists, participant2_exists;
  END IF;
  
  RETURN new_conversation_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE EXCEPTION 'Error creating conversation: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid, uuid) TO service_role;

-- Verify the function was created
SELECT 
  proname as function_name,
  proargnames as argument_names,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'create_conversation_with_participants';

