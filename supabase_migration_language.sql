-- ===================================
-- LANGUAGE COLUMN MIGRATION
-- ===================================
-- Run this SQL in your Supabase SQL Editor
-- Adds a language column to the profiles table

-- Add language column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT;

-- Add constraint to ensure language is one of the supported values
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_language_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_language_check 
CHECK (language IS NULL OR language IN ('fr', 'en', 'es', 'de', 'it'));

-- Create index for faster language queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language) 
WHERE language IS NOT NULL;

