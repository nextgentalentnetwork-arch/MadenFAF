// ========================================================
// MADEN FAF - MEMBERSHIP ECOSYSTEM SUPABASE SQL SCHEMA
// ========================================================

export const MEMBERSHIP_ECOSYSTEM_SQL = `
-- ========================================================
-- 1. User Profiles Table (Foundation Community Members & Volunteers)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  dob DATE,
  gender TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  pin_code TEXT,
  country TEXT DEFAULT 'India',
  occupation TEXT,
  preferred_language TEXT DEFAULT 'Bengali / English',
  emergency_contact JSONB,
  how_did_you_hear TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  areas_of_interest TEXT[],
  skills_and_expertise TEXT[],
  is_volunteer BOOLEAN DEFAULT false,
  volunteer_availability TEXT,
  preferred_volunteer_activities TEXT[],
  previous_volunteering TEXT,
  is_minor BOOLEAN DEFAULT false,
  guardian_consent BOOLEAN DEFAULT false,
  guardian_name TEXT,
  guardian_phone TEXT,
  show_in_public_directory BOOLEAN DEFAULT true,
  email_consent BOOLEAN DEFAULT true,
  terms_accepted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 2. Membership Plans (Configurable Tiers)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('annual', 'monthly', 'lifetime')),
  popular BOOLEAN DEFAULT false,
  badge_color TEXT DEFAULT 'amber',
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  eligibility TEXT,
  max_members INTEGER,
  active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'individual' CHECK (category IN ('individual', 'youth', 'patron', 'corporate')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 3. Active Memberships & Subscriptions (Linked to Profiles & Plans)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  membership_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_payment', 'expired', 'suspended')),
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT DEFAULT 'upi',
  payment_reference TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_memberships_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_memberships_plan FOREIGN KEY (plan_id) REFERENCES public.membership_plans(id) ON DELETE RESTRICT
);

-- ========================================================
-- 4. Donations & Community Support (Linked to Profiles)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  donor_pan TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  cause TEXT NOT NULL CHECK (cause IN ('grassroots', 'girls_football', 'scholarships', 'equipment', 'nutrition', 'general')),
  frequency TEXT NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly')),
  payment_method TEXT DEFAULT 'upi',
  payment_status TEXT NOT NULL DEFAULT 'successful' CHECK (payment_status IN ('successful', 'pending', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  tax_exemption_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_donations_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_membership_id ON public.profiles(membership_id);
CREATE INDEX IF NOT EXISTS idx_memberships_profile_id ON public.memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_plan_id ON public.memberships(plan_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_donations_profile_id ON public.donations(profile_id);
CREATE INDEX IF NOT EXISTS idx_donations_receipt ON public.donations(receipt_number);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Public profiles can view directory" ON public.profiles
  FOR SELECT USING (show_in_public_directory = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active membership plans" ON public.membership_plans
  FOR SELECT USING (active = true);

CREATE POLICY "Users can view own memberships" ON public.memberships
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can view own donations" ON public.donations
  FOR SELECT USING (profile_id = auth.uid());
\`;
