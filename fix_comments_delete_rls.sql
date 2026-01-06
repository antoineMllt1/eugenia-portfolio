-- Fix RLS policies for comments table to allow deletion by admins
-- Run this in Supabase SQL Editor

-- Ensure RLS is enabled on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Comments delete if owner or admin" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;

-- Policy 1: Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Allow admins to delete any comment
-- This checks if the user has is_admin = true or role = 'admin' in their profile
CREATE POLICY "Admins can delete any comment"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'comments'
ORDER BY policyname;

