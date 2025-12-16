-- ===================================
-- HIGHLIGHTS TABLE MIGRATION
-- ===================================
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: This creates the table in the 'public' schema (same as profiles, posts, stories)

-- Create highlights table in public schema
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_image TEXT,
  stories JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON public.highlights(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_highlights_updated_at
  BEFORE UPDATE ON public.highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================
-- Enable RLS
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all highlights (public)
CREATE POLICY "Users can view all highlights"
  ON public.highlights
  FOR SELECT
  USING (true);

-- Policy: Users can only insert their own highlights
CREATE POLICY "Users can insert their own highlights"
  ON public.highlights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own highlights
CREATE POLICY "Users can update their own highlights"
  ON public.highlights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own highlights
CREATE POLICY "Users can delete their own highlights"
  ON public.highlights
  FOR DELETE
  USING (auth.uid() = user_id);


