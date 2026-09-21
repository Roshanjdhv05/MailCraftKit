import { Request, Response } from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const signUpUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, username, companyName } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      // 1. Create user in Supabase Auth via Admin client (auto-confirmed)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || username || email.split('@')[0],
          username: username || email.split('@')[0],
          company_name: companyName || '',
        },
      });

      if (authError) {
        // If user already exists, try standard sign in or return message
        res.status(400).json({ success: false, message: authError.message });
        return;
      }

      const userId = authData.user.id;

      // 2. Ensure profile is explicitly created/updated in public.profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: fullName || username || email.split('@')[0],
          username: username || email.split('@')[0],
          company_name: companyName || '',
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_from_email: email,
          smtp_from_name: username || companyName || 'MailCraftKit User',
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('[SignUp Profile Insert Error]:', profileError);
      }

      // 3. Issue session token
      const { data: sessionData } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      res.json({
        success: true,
        message: 'Account created and saved to database successfully',
        data: {
          user: authData.user,
          session: sessionData?.session || null,
        },
      });
      return;
    }

    // Fallback for local offline dev mode
    const mockUserId = '00000000-0000-0000-0000-000000000001';
    res.json({
      success: true,
      message: 'Account created (Local Dev Mode)',
      data: {
        user: {
          id: mockUserId,
          email,
          user_metadata: { full_name: fullName, username, company_name: companyName },
        },
        session: { access_token: `mock-token-${Date.now()}` },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Signup failed' });
  }
};

export const signInUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        res.status(401).json({ success: false, message: error.message });
        return;
      }

      res.json({
        success: true,
        message: 'Signed in successfully',
        data: {
          user: data.user,
          session: data.session,
        },
      });
      return;
    }

    // Local dev mode fallback
    res.json({
      success: true,
      message: 'Signed in successfully (Local Dev Mode)',
      data: {
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email,
          user_metadata: { full_name: 'Developer Mode', username: 'dev_user' },
        },
        session: { access_token: 'mock-user-00000000-0000-0000-0000-000000000001' },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Sign in failed' });
  }
};
