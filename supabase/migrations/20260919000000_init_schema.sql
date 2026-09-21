-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  company_name TEXT,
  smtp_host TEXT DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_secure BOOLEAN DEFAULT FALSE,
  smtp_from_email TEXT,
  smtp_from_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if migration runs on existing DB
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_host TEXT DEFAULT 'smtp.gmail.com';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_pass TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_from_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_from_name TEXT;

-- Trigger to create profile on signup with username & company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := new.raw_user_meta_data->>'username';

  -- If username is taken by another user, clear it to avoid unique constraint violation
  IF v_username IS NOT NULL THEN
    UPDATE public.profiles
      SET username = NULL
      WHERE username = v_username
        AND id != new.id;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    company_name,
    smtp_from_email,
    smtp_from_name
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_username,
    new.raw_user_meta_data->>'company_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'company_name', 'DesignMailer User')
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    full_name    = EXCLUDED.full_name,
    username     = EXCLUDED.username,
    company_name = EXCLUDED.company_name;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  html TEXT NOT NULL,
  thumbnail_url TEXT,
  is_system_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider TEXT DEFAULT 'nodemailer',
  message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- RLS Policies for Templates
CREATE POLICY "Users can view system templates or own templates"
  ON public.templates FOR SELECT
  USING (is_system_template = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system_template = FALSE);

CREATE POLICY "Users can update own templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = user_id AND is_system_template = FALSE);

CREATE POLICY "Users can delete own templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = user_id AND is_system_template = FALSE);

-- RLS Policies for Email Logs
CREATE POLICY "Users can view own email logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Assets
CREATE POLICY "Users can view own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own assets"
  ON public.assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket setup statement (run in SQL Editor or migration)
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket RLS Policies
CREATE POLICY "Authenticated users can upload email assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'email-assets');

CREATE POLICY "Anyone can view public email assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'email-assets');
