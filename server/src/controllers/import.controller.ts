import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { importHtmlSchema } from '../validators/index.js';
import { EmailService } from '../services/email.service.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const importHtml = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parseResult = importHtmlSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: parseResult.error.errors[0]?.message || 'Invalid payload' });
    return;
  }

  const { html, name } = parseResult.data;

  // Maximum allowed HTML size limit (e.g., 2MB)
  if (Buffer.byteLength(html, 'utf8') > 2 * 1024 * 1024) {
    res.status(400).json({ success: false, message: 'HTML file size exceeds 2MB limit' });
    return;
  }

  // Sanitize strictly (remove script, iframe, javascript: URLs, event handlers)
  const sanitizedHtml = EmailService.sanitizeEmailHtml(html);

  // Extract detected variables matching {{variable_name}}
  const varMatches = Array.from(sanitizedHtml.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g));
  const detectedVariables = Array.from(new Set(varMatches.map(m => m[1])));

  const templateName = name || `Imported Template - ${new Date().toLocaleDateString()}`;

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('templates')
        .insert({
          user_id: userId,
          name: templateName,
          description: 'Imported HTML template',
          html: sanitizedHtml,
          is_system_template: false,
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: 'HTML imported and template created successfully',
        data: {
          template: data,
          detectedVariables,
          sanitizedHtml,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'HTML sanitized successfully',
      data: {
        template: {
          id: `imported_${Date.now()}`,
          name: templateName,
          html: sanitizedHtml,
          is_system_template: false,
          user_id: userId,
        },
        detectedVariables,
        sanitizedHtml,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to import HTML template' });
  }
};
