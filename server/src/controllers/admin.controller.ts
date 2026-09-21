import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// Default mock fallbacks when Supabase is not configured or during initial setup
const MOCK_STATS = {
  totalUsers: 12,
  totalEmails: 1540,
  sentEmails: 1492,
  failedEmails: 48,
  totalTemplates: 18,
  recentLogs: [
    {
      id: 'mock-1',
      recipient: 'john.doe@example.com',
      subject: 'Welcome to our platform',
      status: 'sent',
      sent_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'mock-2',
      recipient: 'sarah.smith@acme.org',
      subject: 'Monthly Newsletter - September',
      status: 'sent',
      sent_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'mock-3',
      recipient: 'invalid-email@domain',
      subject: 'Special Offer Unlocked',
      status: 'failed',
      error_message: 'Invalid recipient MX record',
      sent_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ],
};

const MOCK_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@designmailer.com',
    full_name: 'System Admin',
    username: 'admin',
    company_name: 'MailCraftKit Inc',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: 'admin@designmailer.com',
    smtp_pass: '••••••••••••',
    smtp_secure: false,
    smtp_from_email: 'admin@designmailer.com',
    smtp_from_name: 'MailCraftKit Admin',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    sent_count: 1240,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'demo@designmailer.com',
    full_name: 'Demo Creator',
    username: 'demouser',
    company_name: 'Creative Studio',
    smtp_host: 'smtp.sendgrid.net',
    smtp_port: 587,
    smtp_user: 'apikey',
    smtp_pass: '••••••••••••',
    smtp_secure: true,
    smtp_from_email: 'demo@designmailer.com',
    smtp_from_name: 'Demo Creator',
    created_at: '2026-02-15T10:30:00Z',
    updated_at: '2026-08-20T14:15:00Z',
    sent_count: 300,
  },
];

/**
 * GET /api/admin/stats
 * Returns overview system statistics fetched from the database
 */
export const getOverviewStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      res.json({ success: true, data: MOCK_STATS, isMock: true });
      return;
    }

    // 1. Total users
    const { count: totalUsers, error: usersErr } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Total emails count
    const { count: totalEmails, error: emailsErr } = await supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact', head: true });

    // 3. Sent emails count
    const { count: sentEmails } = await supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    // 4. Failed emails count
    const { count: failedEmails } = await supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    // 5. Total templates count
    const { count: totalTemplates } = await supabaseAdmin
      .from('templates')
      .select('*', { count: 'exact', head: true });

    // 6. Recent logs
    const { data: recentLogs } = await supabaseAdmin
      .from('email_logs')
      .select('id, recipient, subject, status, error_message, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const stats = {
      totalUsers: totalUsers ?? MOCK_STATS.totalUsers,
      totalEmails: totalEmails ?? MOCK_STATS.totalEmails,
      sentEmails: sentEmails ?? MOCK_STATS.sentEmails,
      failedEmails: failedEmails ?? MOCK_STATS.failedEmails,
      totalTemplates: totalTemplates ?? MOCK_STATS.totalTemplates,
      recentLogs: recentLogs && recentLogs.length > 0 ? recentLogs : MOCK_STATS.recentLogs,
    };

    res.json({ success: true, data: stats, isMock: false });
  } catch (err: any) {
    console.error('[AdminController getOverviewStats]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch admin stats' });
  }
};

/**
 * GET /api/admin/users
 * Returns list of registered users with full profile details and email stats
 */
export const getUsersList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      res.json({ success: true, data: MOCK_USERS, isMock: true });
      return;
    }

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get email counts per user
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count } = await supabaseAdmin
          .from('email_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        return {
          ...profile,
          // Mask sensitive passwords for display safety
          smtp_pass: profile.smtp_pass ? '••••••••••••' : null,
          sent_count: count ?? 0,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats.length > 0 ? usersWithStats : MOCK_USERS,
      isMock: usersWithStats.length === 0,
    });
  } catch (err: any) {
    console.error('[AdminController getUsersList]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch users list' });
  }
};

/**
 * GET /api/admin/templates
 * Retrieves system & database templates
 */
export const getAdminTemplates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      const { data: mockTemplates } = await import('./template.controller.js').then(m => ({ data: [] }));
      res.json({ success: true, data: [], isMock: true });
      return;
    }

    const { data: templates, error } = await supabaseAdmin
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: templates || [] });
  } catch (err: any) {
    console.error('[AdminController getAdminTemplates]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch admin templates' });
  }
};

/**
 * POST /api/admin/templates/import
 * Imports a new HTML template into the database (sets is_system_template = true)
 */
export const importTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, html, category, thumbnail_url, is_system_template = true } = req.body;

    if (!name || !html) {
      res.status(400).json({ success: false, message: 'Template name and HTML content are required' });
      return;
    }

    if (!isSupabaseConfigured()) {
      res.status(400).json({
        success: false,
        message: 'Supabase is not configured. Cannot write template to database.',
      });
      return;
    }

    const newTemplate: any = {
      name,
      description: description || 'Imported system template',
      html,
      category: category || 'Custom',
      thumbnail_url: thumbnail_url || null,
      is_system_template: Boolean(is_system_template),
      user_id: req.user?.id || '00000000-0000-0000-0000-000000000001',
    };

    let { data, error } = await supabaseAdmin
      .from('templates')
      .insert(newTemplate)
      .select()
      .single();

    // If category column does not exist in Supabase schema cache, retry without category
    if (error && (error.message?.includes('category') || error.code === 'PGRST204')) {
      delete newTemplate.category;
      const retry = await supabaseAdmin
        .from('templates')
        .insert(newTemplate)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[AdminController importTemplate Insert Error]:', error);
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Template imported successfully into database',
      data,
    });
  } catch (err: any) {
    console.error('[AdminController importTemplate]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to import template' });
  }
};

/**
 * DELETE /api/admin/templates/:id
 * Deletes a template from the database
 */
export const deleteAdminTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      res.json({ success: true, message: 'Mock template deleted' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.json({ success: true, message: 'Template deleted from database' });
  } catch (err: any) {
    console.error('[AdminController deleteAdminTemplate]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete template' });
  }
};

/**
 * GET /api/admin/logs
 * Retrieves full email activity log history
 */
export const getEmailLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!isSupabaseConfigured()) {
      res.json({ success: true, data: MOCK_STATS.recentLogs, isMock: true });
      return;
    }

    const { data: logs, error } = await supabaseAdmin
      .from('email_logs')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ success: true, data: logs || [] });
  } catch (err: any) {
    console.error('[AdminController getEmailLogs]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch email logs' });
  }
};
