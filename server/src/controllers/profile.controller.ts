import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// In-memory mock store for local dev fallback when Supabase is not connected
const localDevProfiles: Record<string, any> = {
  '00000000-0000-0000-0000-000000000001': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'developer@designmailer.local',
    full_name: 'Developer Mode User',
    username: 'dev_user',
    company_name: 'MailCraftKit Inc',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    smtp_from_email: 'developer@designmailer.local',
    smtp_from_name: 'MailCraftKit Team',
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        res.json({ success: true, data });
        return;
      }
    }

    const fallbackProfile = localDevProfiles[userId] || {
      id: userId,
      email: req.user?.email || 'user@example.com',
      full_name: req.user?.user_metadata?.full_name || 'User',
      username: req.user?.user_metadata?.username || '',
      company_name: req.user?.user_metadata?.company_name || '',
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: '',
      smtp_pass: '',
      smtp_secure: false,
      smtp_from_email: req.user?.email || '',
      smtp_from_name: req.user?.user_metadata?.company_name || 'MailCraftKit User',
    };

    res.json({ success: true, data: fallbackProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to retrieve profile' });
  }
};

export const updateSmtpSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, smtp_from_email, smtp_from_name, username, company_name, full_name } = req.body;

  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (smtp_host !== undefined) updatePayload.smtp_host = smtp_host;
    if (smtp_port !== undefined) updatePayload.smtp_port = parseInt(String(smtp_port), 10) || 587;
    if (smtp_user !== undefined) updatePayload.smtp_user = smtp_user;
    if (smtp_pass !== undefined) updatePayload.smtp_pass = smtp_pass;
    if (smtp_secure !== undefined) updatePayload.smtp_secure = Boolean(smtp_secure);
    if (smtp_from_email !== undefined) updatePayload.smtp_from_email = smtp_from_email;
    if (smtp_from_name !== undefined) updatePayload.smtp_from_name = smtp_from_name;
    if (username !== undefined) updatePayload.username = username;
    if (company_name !== undefined) updatePayload.company_name = company_name;
    if (full_name !== undefined) updatePayload.full_name = full_name;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: req.user?.email || 'user@example.com',
          ...updatePayload
        })
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, message: 'SMTP settings updated successfully', data });
      return;
    }

    // Local fallback update
    localDevProfiles[userId] = {
      ...(localDevProfiles[userId] || {}),
      id: userId,
      email: req.user?.email || 'developer@designmailer.local',
      ...updatePayload,
    };

    res.json({
      success: true,
      message: 'SMTP settings updated successfully (local session)',
      data: localDevProfiles[userId],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update SMTP settings' });
  }
};
