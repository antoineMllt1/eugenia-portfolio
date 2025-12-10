-- ===================================
-- POSTS TABLE - REELS SUPPORT MIGRATION
-- ===================================
-- Run this SQL in your Supabase SQL Editor
-- This adds support for video reels in the posts table

-- Add video_url column for storing video URLs
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add post_type column to distinguish between regular posts and reels
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'post' CHECK (post_type IN ('post', 'reel'));

-- Create index for faster queries on post_type
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);

-- Create index for video_url queries
CREATE INDEX IF NOT EXISTS idx_posts_video_url ON public.posts(video_url) WHERE video_url IS NOT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN public.posts.video_url IS 'URL to the video file for reels';
COMMENT ON COLUMN public.posts.post_type IS 'Type of post: post (regular image post) or reel (video reel)';

