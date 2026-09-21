import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { sendEmailSchema, testEmailSchema, previewEmailSchema } from '../validators/index.js';
import { EmailService } from '../services/email.service.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const previewEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = previewEmailSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: parseResult.error.errors[0]?.message || 'Invalid payload' });
    return;
  }

  const { html, variables } = parseResult.data;
  const processedHtml = EmailService.prepareFinalEmailHtml(html, variables);

  res.json({
    success: true,
    data: {
      html: processedHtml,
    },
  });
};

export const sendTestEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parseResult = testEmailSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: parseResult.error.errors[0]?.message || 'Invalid payload' });
    return;
  }

  const { to, fromEmail, fromName, subject, html, variables } = parseResult.data;

  const result = await EmailService.sendEmail({
    userId,
    recipient: to,
    fromEmail,
    fromName,
    subject: `[Test Send] ${subject}`,
    html,
    variables,
  });

  if (!result.success) {
    res.status(500).json({
      success: false,
      message: result.error || 'Failed to dispatch test email',
    });
    return;
  }

  res.json({
    success: true,
    message: `Test email sent successfully to ${to}`,
    messageId: result.messageId,
  });
};

export const sendEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parseResult = sendEmailSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: parseResult.error.errors[0]?.message || 'Invalid recipient or payload' });
    return;
  }

  const { to, fromEmail, fromName, subject, templateId, html: rawHtmlInput, variables } = parseResult.data;

  let targetHtml = rawHtmlInput || '';

  // Only fetch template HTML from database if no explicit HTML input was provided
  if (!targetHtml && templateId) {
    try {
      if (isSupabaseConfigured()) {
        const { data: tmpl, error } = await supabaseAdmin
          .from('templates')
          .select('html')
          .eq('id', templateId)
          .single();

        if (error || !tmpl) {
          res.status(404).json({ success: false, message: 'Specified template not found' });
          return;
        }
        targetHtml = tmpl.html;
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve target template' });
      return;
    }
  }

  if (!targetHtml) {
    res.status(400).json({ success: false, message: 'No HTML content available to send' });
    return;
  }

  const result = await EmailService.sendEmail({
    userId,
    templateId,
    recipient: to,
    fromEmail,
    fromName,
    subject,
    html: targetHtml,
    variables,
  });

  if (!result.success) {
    res.status(500).json({
      success: false,
      message: result.error || 'Email could not be sent. Please check your SMTP configuration.',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Email sent successfully',
    data: {
      recipient: to,
      subject,
      messageId: result.messageId,
    },
  });
};

export const getEmailHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('email_logs')
        .select(`
          *,
          templates ( name )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ success: true, data: data || [] });
      return;
    }

    res.json({ success: true, data: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch email logs' });
  }
};

export const getEmailLogById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('email_logs')
        .select(`
          *,
          templates ( name )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        res.status(404).json({ success: false, message: 'Email record not found' });
        return;
      }

      res.json({ success: true, data });
      return;
    }

    res.status(404).json({ success: false, message: 'Email record not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch email detail' });
  }
};
