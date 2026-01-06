-- Fix RLS policies for posts table to allow deletion
-- Run this in Supabase SQL Editor

-- Ensure RLS is enabled on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Posts delete if owner or admin" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

-- Policy 1: Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Allow admins to delete any post
-- This checks if the user has is_admin = true or role = 'admin' in their profile
CREATE POLICY "Admins can delete any post"
  ON public.posts
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
WHERE tablename = 'posts'
ORDER BY policyname;

