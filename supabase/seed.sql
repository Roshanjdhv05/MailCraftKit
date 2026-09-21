-- Seed data for Initial Dev Profile & System Templates

-- Ensure UUID extension & profiles table exist first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Ensure columns exist if table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_host TEXT DEFAULT 'smtp.gmail.com';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_pass TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_from_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_from_name TEXT;

-- 1. Insert Dev User into auth.users (to satisfy foreign key constraint on public.profiles)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'developer@designmailer.local',
  '$2a$10$wT0lV3zXv7vT8.F4iM1F1eW6eYJ9zZ6k7q5A9r0B1C2D3E4F5G6H7',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Developer Mode User","username":"dev_user","company_name":"DesignMailer Inc"}',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Sample Dev User Profile
-- Clear any conflicting username row that isn't our dev user (prevents profiles_username_key violation)
UPDATE public.profiles
  SET username = NULL
  WHERE username = 'dev_user'
    AND id != '00000000-0000-0000-0000-000000000001';

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  username,
  company_name,
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_pass,
  smtp_secure,
  smtp_from_email,
  smtp_from_name
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'developer@designmailer.local',
  'Developer Mode User',
  'dev_user',
  'DesignMailer Inc',
  'smtp.gmail.com',
  587,
  'developer@designmailer.local',
  'demo_app_password',
  FALSE,
  'developer@designmailer.local',
  'DesignMailer Team'
)
ON CONFLICT (id) DO UPDATE SET
  email       = EXCLUDED.email,
  full_name   = EXCLUDED.full_name,
  username    = EXCLUDED.username,
  company_name = EXCLUDED.company_name,
  smtp_host   = EXCLUDED.smtp_host,
  smtp_port   = EXCLUDED.smtp_port,
  smtp_user   = EXCLUDED.smtp_user,
  smtp_pass   = EXCLUDED.smtp_pass,
  smtp_from_email = EXCLUDED.smtp_from_email,
  smtp_from_name  = EXCLUDED.smtp_from_name,
  updated_at  = NOW();

-- 2. System Templates
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

-- Enable RLS and add Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

INSERT INTO public.templates (id, name, description, html, thumbnail_url, is_system_template, user_id)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Welcome Email',
  'Warm onboard greeting for new users with getting started call-to-action.',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{company}}</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- 1. Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff;">{{heading}}</h1>
            </td>
          </tr>
          <!-- 2. Greeting -->
          <tr>
            <td align="left" style="padding: 32px 32px 12px 32px; color: #1e293b; font-size: 20px; font-weight: 700;">
              Hello {{name}} 👋,
            </td>
          </tr>
          <!-- 3. Message Body -->
          <tr>
            <td align="left" style="padding: 0 32px 24px 32px; color: #334155; font-size: 16px; line-height: 1.6;">
              {{message}}
              <br><br>
              We are excited to have you on board with <strong>{{company}}</strong>. Explore your workspace and unlock all premium features today!
            </td>
          </tr>
          <!-- 4. Centered Button -->
          <tr>
            <td align="center" style="padding: 8px 32px 36px 32px; text-align: center;">
              <a href="{{button_url}}" target="_blank" style="background-color: #4f46e5; color: #ffffff !important; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                {{button_text}} →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 20px 32px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; 2026 {{company}}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=60',
  TRUE,
  NULL
),
(
  '22222222-2222-2222-2222-222222222222',
  'Business Promotion',
  'Sleek discount and promotional offer email designed to drive sales conversion.',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer from {{company}}</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
          <!-- 1. Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase;">{{heading}}</h1>
            </td>
          </tr>
          <!-- 2. Greeting -->
          <tr>
            <td align="left" style="padding: 32px 32px 12px 32px; color: #f8fafc; font-size: 18px; font-weight: 700;">
              Hi {{name}},
            </td>
          </tr>
          <!-- 3. Message Body -->
          <tr>
            <td align="left" style="padding: 0 32px 24px 32px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
              {{message}}
            </td>
          </tr>
          <!-- 4. Promo Code Box -->
          <tr>
            <td align="center" style="padding: 0 32px 24px 32px;">
              <div style="background: #0f172a; border: 2px dashed #06b6d4; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Use Promo Code</div>
                <div style="font-size: 28px; font-weight: 800; color: #38bdf8; letter-spacing: 2px; margin-top: 4px;">SPECIAL2026</div>
              </div>
            </td>
          </tr>
          <!-- 5. Centered Button -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px; text-align: center;">
              <a href="{{button_url}}" target="_blank" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff !important; padding: 16px 36px; text-decoration: none; border-radius: 30px; font-weight: 700; display: inline-block; font-size: 16px;">
                {{button_text}} →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0f172a; padding: 20px 32px; text-align: center; font-size: 13px; color: #64748b;">
              Sent with ❤️ from {{company}}. Unsubscribe anytime.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=60',
  TRUE,
  NULL
),
(
  '33333333-3333-3333-3333-333333333333',
  'Event Invitation',
  'Elegant invitation email for webinars, conferences, and virtual meetups.',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{heading}}</title>
</head>
<body style="margin:0;padding:20px 0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fafafa;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td align="center" style="background-color:#0d9488;padding:36px 24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:26px;font-weight:700;">{{heading}}</h1>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:32px 32px 12px 32px;color:#1e293b;font-size:18px;font-weight:700;">
              Dear {{name}},
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:0 32px 24px 32px;color:#334155;font-size:16px;line-height:1.6;">
              {{message}}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 36px 32px;text-align:center;">
              <a href="{{button_url}}" target="_blank" style="background-color:#0d9488;color:#ffffff !important;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;display:inline-block;font-size:16px;">
                {{button_text}} →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  TRUE,
  NULL
),
(
  '44444444-4444-4444-4444-444444444444',
  'Diwali Festival Offer',
  'Festive gold & dark velvet Diwali offer email with promo code & responsive layout (600px Desktop / 100% Mobile).',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🪔 Diwali Special Festival Offer</title>
  <style>
    /* DESKTOP SPECIFICATION: Default Container Width 600px */
    body { margin: 0; padding: 0; background-color: #0f0c29; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; }
    /* MOBILE PHONE SPECIFICATION: Screen Width < 600px */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; padding: 10px !important; }
      .header-banner { padding: 28px 16px !important; }
      .header-title { font-size: 22px !important; }
      .body-cell { padding: 20px 16px !important; }
      .promo-box { padding: 16px 12px !important; }
      .promo-code { font-size: 24px !important; letter-spacing: 2px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 16px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #0f0c29; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f0c29;">
    <tr>
      <td align="center" style="padding: 10px;">
        <table role="presentation" class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #1a0933; border-radius: 20px; border: 1px solid #d97706; overflow: hidden; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);">
          <!-- 1. FESTIVE HEADER BANNER (Desktop: 40px 24px padding) -->
          <tr>
            <td align="center" class="header-banner" style="background: linear-gradient(135deg, #7c3aed 0%, #dc2626 50%, #d97706 100%); padding: 40px 24px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">🪔 ✨ 🪔</div>
              <h1 class="header-title" style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">{{heading}}</h1>
              <div style="font-size: 13px; color: #fde68a; font-weight: 700; margin-top: 6px; letter-spacing: 2px; text-transform: uppercase;">✨ Happy Diwali Special Festival Sale ✨</div>
            </td>
          </tr>
          <!-- 2. GREETING & MESSAGE BODY (Desktop: 32px padding) -->
          <tr>
            <td align="left" class="body-cell" style="padding: 32px 32px 16px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #fbbf24; font-size: 20px; font-weight: 700;">Warm Diwali Greetings, {{name}}! 🪔</h2>
              <p style="margin: 0 0 16px 0; color: #e2e8f0; font-size: 16px; line-height: 1.6;">{{message}}</p>
              <p style="margin: 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">Celebrate the festival of lights with exclusive savings from <strong>{{company}}</strong>. Upgrade your plan or shop our festival special collection today!</p>
            </td>
          </tr>
          <!-- 3. PROMO CODE BOX (Desktop: 536px width, 24px padding) -->
          <tr>
            <td align="center" style="padding: 12px 32px 28px 32px;">
              <table role="presentation" class="promo-box" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 24px; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 12px; font-weight: 800; color: #fde68a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">🎉 Exclusive Festival Offer 🎉</div>
                    <div style="font-size: 32px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">FLAT 50% OFF</div>
                    <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 14px;">Use promo code at checkout:</div>
                    <div class="promo-code" style="display: inline-block; background-color: #0f0c29; border: 1px solid #f59e0b; color: #f59e0b; font-size: 28px; font-weight: 800; padding: 10px 24px; border-radius: 10px; letter-spacing: 4px; font-family: monospace;">DIWALI2026</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- 4. PRIMARY CTA BUTTON (Desktop: 16px 40px, Mobile: Full Width 100%) -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px; text-align: center;">
              <a href="{{button_url}}" target="_blank" class="cta-button" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0f0c29 !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 800; display: inline-block; font-size: 17px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4); text-transform: uppercase;">{{button_text}} →</a>
            </td>
          </tr>
          <!-- 5. FOOTER (Desktop: 20px 32px) -->
          <tr>
            <td align="center" style="background-color: #0f0c29; padding: 20px 32px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #334155;">&copy; 2026 <strong>{{company}}</strong>. Wishing you & your family a joyous & prosperous Diwali! 🪔</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
  TRUE,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  html = EXCLUDED.html,
  thumbnail_url = EXCLUDED.thumbnail_url,
  is_system_template = EXCLUDED.is_system_template;
