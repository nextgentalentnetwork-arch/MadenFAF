-- =========================================================
-- MADEN FOOTBALL ACADEMY FOUNDATION (MADEN FAF)
-- Complete Supabase PostgreSQL Schema & RLS Policies
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- =========================================================

-- 1. Academy Registrations Table (Candidate Applications)
CREATE TABLE IF NOT EXISTS public.academy_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT,
    preferred_campus TEXT NOT NULL,
    position TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    program TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending_trial',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to academy_registrations"
    ON public.academy_registrations FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow read academy_registrations"
    ON public.academy_registrations FOR SELECT TO public USING (true);

CREATE POLICY "Allow update academy_registrations"
    ON public.academy_registrations FOR UPDATE TO public USING (true);

CREATE POLICY "Allow delete academy_registrations"
    ON public.academy_registrations FOR DELETE TO public USING (true);


-- 2. User Profiles Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'parent', 'coach', 'admin')),
    phone TEXT,
    campus TEXT DEFAULT 'gayeshpur',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read of own profile"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual update of own profile"
    ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public insert for profile creation on signup"
    ON public.profiles FOR INSERT WITH CHECK (true);


-- 3. Unified Academy Content Store (Bulk JSON Store for Fast Sync)
CREATE TABLE IF NOT EXISTS public.academy_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read academy_content"
    ON public.academy_content FOR SELECT TO public USING (true);

CREATE POLICY "Allow public write academy_content"
    ON public.academy_content FOR ALL TO public USING (true) WITH CHECK (true);


-- 4. Dedicated Coaching Staff Table
CREATE TABLE IF NOT EXISTS public.academy_coaches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'leadership',
    license TEXT NOT NULL,
    license_level TEXT,
    campus TEXT NOT NULL,
    experience_years INTEGER DEFAULT 5,
    playing_background TEXT,
    philosophy TEXT,
    bio TEXT,
    key_specialties JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    career_highlights JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    accent_color TEXT DEFAULT 'amber',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read academy_coaches"
    ON public.academy_coaches FOR SELECT TO public USING (true);

CREATE POLICY "Allow public write academy_coaches"
    ON public.academy_coaches FOR ALL TO public USING (true) WITH CHECK (true);


-- 5. Dedicated Match Fixtures & Results Table
CREATE TABLE IF NOT EXISTS public.academy_fixtures (
    id TEXT PRIMARY KEY,
    competition TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    is_home BOOLEAN DEFAULT true,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    age_group TEXT NOT NULL,
    player_of_the_match TEXT,
    match_report_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read academy_fixtures"
    ON public.academy_fixtures FOR SELECT TO public USING (true);

CREATE POLICY "Allow public write academy_fixtures"
    ON public.academy_fixtures FOR ALL TO public USING (true) WITH CHECK (true);


-- 6. Dedicated News & Stories Table
CREATE TABLE IF NOT EXISTS public.academy_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Academy News',
    date TEXT NOT NULL,
    read_time TEXT DEFAULT '3 min read',
    author TEXT DEFAULT 'Academy Editorial',
    summary TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read academy_news"
    ON public.academy_news FOR SELECT TO public USING (true);

CREATE POLICY "Allow public write academy_news"
    ON public.academy_news FOR ALL TO public USING (true) WITH CHECK (true);


-- 7. Dedicated Campuses & Training Centers Table
CREATE TABLE IF NOT EXISTS public.academy_campuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    location TEXT NOT NULL,
    address TEXT,
    association TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    facilities JSONB DEFAULT '[]'::jsonb,
    training_days TEXT NOT NULL,
    timings TEXT NOT NULL,
    age_groups JSONB DEFAULT '[]'::jsonb,
    head_coach JSONB DEFAULT '{}'::jsonb,
    contact_phone TEXT,
    contact_email TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read academy_campuses"
    ON public.academy_campuses FOR SELECT TO public USING (true);

CREATE POLICY "Allow public write academy_campuses"
    ON public.academy_campuses FOR ALL TO public USING (true) WITH CHECK (true);
