-- ============================================
-- Visual Seven — Leads & Inquiries Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    config_data JSONB DEFAULT NULL, -- stores custom sign config: text, font, color, backing, size, price, dimmer
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Read', 'Contacted', 'Completed'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Public write access (anyone can submit inquiries)
CREATE POLICY "Public can submit inquiries"
    ON inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 4. RLS Policy: Only authenticated users (admins) can view inquiries
CREATE POLICY "Admins can select inquiries"
    ON inquiries
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. RLS Policy: Only authenticated users (admins) can update inquiries
CREATE POLICY "Admins can update inquiries"
    ON inquiries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. RLS Policy: Only authenticated users (admins) can delete inquiries
CREATE POLICY "Admins can delete inquiries"
    ON inquiries
    FOR DELETE
    TO authenticated
    USING (true);
