-- ==============================================================================
-- MADEN FORWARD ATHLETIC FOUNDATION - SUPABASE DATABASE SCHEMA
-- Project URL: https://cyolljxxcmaekhhllbix.supabase.co
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/cyolljxxcmaekhhllbix
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "Run" (or Ctrl/Cmd + Enter)
-- ==============================================================================

-- 1. Academy Trial Registrations Table
CREATE TABLE IF NOT EXISTS public.academy_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  player_name TEXT NOT NULL,
  dob DATE,
  gender TEXT DEFAULT 'male',
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  preferred_campus TEXT DEFAULT 'gayeshpur',
  position TEXT DEFAULT 'midfielder',
  experience_level TEXT DEFAULT 'grassroots',
  program TEXT DEFAULT 'foundation',
  message TEXT,
  status TEXT DEFAULT 'pending_trial',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'parent', 'coach', 'admin')),
  campus TEXT DEFAULT 'Gayeshpur Campus',
  phone TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.academy_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public trial intake submissions
CREATE POLICY "Allow public insert for registrations"
  ON public.academy_registrations
  FOR INSERT
  WITH CHECK (true);

-- Allow reading registrations for academy users and tracking
CREATE POLICY "Allow read for registrations"
  ON public.academy_registrations
  FOR SELECT
  USING (true);

-- Allow users to view and update their own profile
CREATE POLICY "Allow user read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow user update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 4. Automatically create profile row when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, campus)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'player'),
    COALESCE(new.raw_user_meta_data->>'campus', 'Gayeshpur Campus')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
