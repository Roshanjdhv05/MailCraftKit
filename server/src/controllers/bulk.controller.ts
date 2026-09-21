import { Response } from 'express';
import * as XLSX from 'xlsx';
import { AuthenticatedRequest } from '../types/index.js';
import { EmailService } from '../services/email.service.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

interface RecipientRow {
  email: string;
  name?: string;
  [key: string]: string | undefined;
}

/**
 * Parses an uploaded CSV or XLSX file buffer and returns a list of recipient rows.
 * Looks for an 'email' column (case-insensitive) and any additional variable columns.
 */
function parseSpreadsheet(buffer: Buffer, mimetype: string): RecipientRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const normalized: RecipientRow[] = [];

  for (const row of raw) {
    // Normalize keys to lowercase
    const normRow: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      normRow[key.toLowerCase().trim()] = String(row[key] ?? '').trim();
    }

    const email = normRow['email'] || normRow['email address'] || normRow['emailaddress'] || normRow['e-mail'];
    if (!email || !email.includes('@')) continue;

    normalized.push({ email, ...normRow });
  }

  return normalized;
}

/**
 * POST /api/bulk/parse
 * Accepts a multipart form upload, parses the CSV/XLSX and returns the email list.
 */
export const parseUploadedFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded. Please attach a CSV or XLSX file.' });
      return;
    }

    const { buffer, mimetype, originalname } = req.file;
    const ext = originalname.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      res.status(400).json({ success: false, message: 'Unsupported file type. Please upload a .csv, .xls, or .xlsx file.' });
      return;
    }

    const recipients = parseSpreadsheet(buffer, mimetype);

    if (recipients.length === 0) {
      res.status(422).json({
        success: false,
        message: 'No valid email addresses found. Make sure your file has an "email" column header.',
      });
      return;
    }

    // Return first row keys as available variable columns
    const columns = Object.keys(recipients[0]).filter(k => k !== 'email');

    res.json({
      success: true,
      data: {
        recipients,
        total: recipients.length,
        columns,
      },
    });
  } catch (err: any) {
    console.error('[BulkController parseUploadedFile]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to parse uploaded file' });
  }
};

/**
 * POST /api/bulk/send
 * Sends a batch of emails to a list of recipients.
 * Accepts: { recipients, subject, html, templateId?, fromEmail?, fromName?, delayMs? }
 */
export const sendBulkEmails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { recipients, subject, html, templateId, fromEmail, fromName, delayMs = 300 } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    res.status(400).json({ success: false, message: 'Recipients list is required and must be non-empty' });
    return;
  }

  if (!subject) {
    res.status(400).json({ success: false, message: 'Email subject is required' });
    return;
  }

  if (!html && !templateId) {
    res.status(400).json({ success: false, message: 'Either HTML content or a templateId is required' });
    return;
  }

  let baseHtml = html || '';

  // Fetch template HTML if only templateId provided
  if (!baseHtml && templateId) {
    try {
      if (isSupabaseConfigured()) {
        const { data: tmpl, error } = await supabaseAdmin
          .from('templates')
          .select('html')
          .eq('id', templateId)
          .single();

        if (error || !tmpl) {
          res.status(404).json({ success: false, message: 'Template not found' });
          return;
        }
        baseHtml = tmpl.html;
      } else {
        res.status(400).json({ success: false, message: 'Template lookup requires Supabase to be configured' });
        return;
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve template' });
      return;
    }
  }

  const results: { email: string; status: 'sent' | 'failed'; error?: string }[] = [];
  let sent = 0;
  let failed = 0;

  // Process each recipient sequentially with a small delay to avoid SMTP throttling
  for (const recipient of recipients) {
    const recipientEmail = typeof recipient === 'string' ? recipient : recipient.email;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      results.push({ email: recipientEmail || 'unknown', status: 'failed', error: 'Invalid email address' });
      failed++;
      continue;
    }

    // Build per-recipient variables from the row data
    const variables: Record<string, string> = typeof recipient === 'object' ? { ...recipient } : {};

    try {
      const result = await EmailService.sendEmail({
        userId,
        templateId,
        recipient: recipientEmail,
        fromEmail,
        fromName,
        subject,
        html: baseHtml,
        variables,
      });

      if (result.success) {
        results.push({ email: recipientEmail, status: 'sent' });
        sent++;
      } else {
        results.push({ email: recipientEmail, status: 'failed', error: result.error });
        failed++;
      }
    } catch (err: any) {
      results.push({ email: recipientEmail, status: 'failed', error: err.message });
      failed++;
    }

    // Small delay between sends to avoid SMTP rate limits
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  res.json({
    success: true,
    data: {
      total: recipients.length,
      sent,
      failed,
      results,
    },
    message: `Bulk send complete: ${sent} sent, ${failed} failed out of ${recipients.length} recipients.`,
  });
};
