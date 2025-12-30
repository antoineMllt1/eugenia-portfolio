-- =============================================
-- UPGRADE POSTS TO PROJECTS
-- =============================================
-- This migration renames the 'posts' table to 'projects' 
-- and adds portfolio-specific features.

-- 1. Rename the table
ALTER TABLE IF EXISTS public.posts RENAME TO projects;

-- 2. Add new columns for better portfolio management
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS project_url TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'published' CHECK (project_status IN ('draft', 'published', 'archived'));

-- 3. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects(is_featured);

-- 4. Update Policies (Supabase handles this automatically usually, but let's be safe)
-- If the table was renamed, we might need to recreate policies if they weren't automatically updated.
-- Most of the time Supabase/Postgres handles this if you use RENAME.

-- 5. Add comments
COMMENT ON TABLE public.projects IS 'Stores both image-based projects and video reels for student portfolios';
COMMENT ON COLUMN public.projects.category IS 'The academic or creative category of the project';
COMMENT ON COLUMN public.projects.is_featured IS 'Whether to showcase this project prominently on the user profile';
