-- ============================================
-- Visual Seven — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Neon Signage',
    image_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Public read access (anyone can view projects)
CREATE POLICY "Public can read projects"
    ON projects
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. RLS Policy: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert projects"
    ON projects
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 5. RLS Policy: Only authenticated users can update
CREATE POLICY "Authenticated users can update projects"
    ON projects
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. RLS Policy: Only authenticated users can delete
CREATE POLICY "Authenticated users can delete projects"
    ON projects
    FOR DELETE
    TO authenticated
    USING (true);

-- 7. Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage Policy: Public read access for project images
CREATE POLICY "Public can view project images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'project-images');

-- 9. Storage Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload project images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'project-images');

-- 10. Storage Policy: Authenticated users can update images
CREATE POLICY "Authenticated users can update project images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'project-images');

-- 11. Storage Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete project images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'project-images');
