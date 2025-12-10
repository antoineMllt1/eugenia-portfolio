-- Migration: Create follows table for user follow/unfollow functionality
-- This table stores the relationships between users who follow each other

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id) -- Prevent users from following themselves
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all follow relationships
CREATE POLICY "Users can view all follows"
  ON public.follows
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own follow relationships
CREATE POLICY "Users can follow others"
  ON public.follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can delete their own follow relationships (unfollow)
CREATE POLICY "Users can unfollow others"
  ON public.follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- Create a function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_follows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

