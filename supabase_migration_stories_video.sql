-- ===================================
-- STORIES TABLE - VIDEO SUPPORT MIGRATION
-- ===================================
-- Run this SQL in your Supabase SQL Editor
-- This adds support for videos in stories

-- Add media_url column (for both images and videos)
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Add media_type column to distinguish between images and videos
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video'));

-- Copy existing image_url values to media_url for backward compatibility
UPDATE public.stories 
SET media_url = image_url 
WHERE media_url IS NULL AND image_url IS NOT NULL;

-- Set media_type to 'image' for existing stories
UPDATE public.stories 
SET media_type = 'image' 
WHERE media_type IS NULL;

-- Create index for faster queries on media_type
CREATE INDEX IF NOT EXISTS idx_stories_media_type ON public.stories(media_type);

-- Add comment to document the columns
COMMENT ON COLUMN public.stories.media_url IS 'URL to the media file (image or video)';
COMMENT ON COLUMN public.stories.media_type IS 'Type of media: image or video';

