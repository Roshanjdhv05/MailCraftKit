import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest, TemplateRecord } from '../types/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { templateSchema } from '../validators/index.js';
import { EmailService } from '../services/email.service.js';

const getResumeTemplateHtml = (): string => {
  try {
    const candidates = [
      path.resolve(process.cwd(), '../client/public/resume_template.html'),
      path.resolve(process.cwd(), 'client/public/resume_template.html'),
      path.resolve(process.cwd(), '../client/dist/resume_template.html'),
      path.resolve(process.cwd(), 'public/resume_template.html'),
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    }
  } catch (err) {
    console.warn('Could not read resume_template.html:', err);
  }
  return '';
};

// Fallback in-memory/mock template library for offline local dev mode
const FALLBACK_SYSTEM_TEMPLATES: TemplateRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: null,
    name: 'Welcome Email',
    description: 'Warm onboard greeting for new users with getting started call-to-action.',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{heading}}</title></head><body style="margin:0;padding:20px 0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);"><tr><td align="center" style="background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);padding:36px 24px;text-align:center;"><h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">{{heading}}</h1></td></tr><tr><td align="left" style="padding:32px 32px 12px 32px;color:#1e293b;font-size:20px;font-weight:700;">Hello {{name}} 👋,</td></tr><tr><td align="left" style="padding:0 32px 24px 32px;color:#334155;font-size:16px;line-height:1.6;">{{message}}</td></tr><tr><td align="center" style="padding:8px 32px 36px 32px;text-align:center;"><a href="{{button_url}}" target="_blank" style="background-color:#4f46e5;color:#ffffff !important;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;display:inline-block;font-size:16px;box-shadow:0 4px 12px rgba(79, 70, 229, 0.3);">{{button_text}} →</a></td></tr><tr><td align="center" style="background-color:#f8fafc;padding:20px 32px;text-align:center;font-size:13px;color:#94a3b8;border-top:1px solid #e2e8f0;">&copy; 2026 {{company}}. All rights reserved.</td></tr></table></td></tr></table></body></html>`,
    thumbnail_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=60',
    is_system_template: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: null,
    name: 'Business Promotion',
    description: 'Sleek discount and promotional offer email designed to drive sales conversion.',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{heading}}</title></head><body style="margin:0;padding:20px 0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f172a;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;"><tr><td align="center" style="background:linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);padding:40px 24px;text-align:center;color:#ffffff;"><h1 style="margin:0;font-size:28px;font-weight:800;text-transform:uppercase;">{{heading}}</h1></td></tr><tr><td align="left" style="padding:32px 32px 12px 32px;color:#f8fafc;font-size:18px;font-weight:700;">Hi {{name}},</td></tr><tr><td align="left" style="padding:0 32px 24px 32px;color:#cbd5e1;font-size:16px;line-height:1.6;">{{message}}</td></tr><tr><td align="center" style="padding:0 32px 36px 32px;text-align:center;"><a href="{{button_url}}" target="_blank" style="background:linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);color:#ffffff !important;padding:16px 36px;text-decoration:none;border-radius:30px;font-weight:700;display:inline-block;font-size:16px;">{{button_text}} →</a></td></tr><tr><td align="center" style="background-color:#0f172a;padding:20px 32px;text-align:center;font-size:13px;color:#64748b;">Sent with ❤️ from {{company}}. Unsubscribe anytime.</td></tr></table></td></tr></table></body></html>`,
    thumbnail_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=60',
    is_system_template: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: null,
    name: 'Event Invitation',
    description: 'Elegant invitation email for webinars, conferences, and virtual meetups.',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{heading}}</title></head><body style="margin:0;padding:20px 0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fafafa;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;"><tr><td align="center" style="background-color:#0d9488;padding:36px 24px;text-align:center;color:#ffffff;"><h1 style="margin:0;font-size:26px;font-weight:700;">{{heading}}</h1></td></tr><tr><td align="left" style="padding:32px 32px 12px 32px;color:#1e293b;font-size:18px;font-weight:700;">Dear {{name}},</td></tr><tr><td align="left" style="padding:0 32px 24px 32px;color:#334155;font-size:16px;line-height:1.6;">{{message}}</td></tr><tr><td align="center" style="padding:8px 32px 36px 32px;text-align:center;"><a href="{{button_url}}" target="_blank" style="background-color:#0d9488;color:#ffffff !important;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;display:inline-block;font-size:16px;">{{button_text}} →</a></td></tr></table></td></tr></table></body></html>`,
    thumbnail_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
    is_system_template: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    user_id: null,
    name: 'Diwali Festival Offer',
    description: 'Festive gold & dark velvet Diwali offer email with promo code & responsive layout (600px Desktop / 100% Mobile).',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🪔 Diwali Special Festival Offer</title>
  <style>
    /* DESKTOP SPECIFICATION: Default Container Width 600px */
    body { margin: 0; padding: 0; background-color: #0f0c29; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
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
<body style="margin: 0; padding: 24px 0; background-color: #0f0c29; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
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
</html>`,
    thumbnail_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
    is_system_template: true,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    user_id: null,
    name: 'Developer Resume Application',
    description: 'Professional tech resume & job application email template with skills grid, experience highlights & contact details.',
    html: getResumeTemplateHtml(),
    thumbnail_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60',
    is_system_template: true,
  }
];

let userCustomTemplates: TemplateRecord[] = [];

export const getTemplates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const resumeHtml = getResumeTemplateHtml();

  try {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('templates')
          .select('*')
          .or(`is_system_template.eq.true${userId ? `,user_id.eq.${userId}` : ''}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const dbTemplates = (data || []).map((t) => {
            if (t.id === '55555555-5555-5555-5555-555555555555' && resumeHtml) {
              return { ...t, html: resumeHtml };
            }
            return t;
          });

          // Sync resume template to Supabase DB if needed
          if (resumeHtml) {
            Promise.resolve(
              supabaseAdmin.from('templates').upsert({
                id: '55555555-5555-5555-5555-555555555555',
                name: 'Developer Resume Application',
                description: 'Professional tech resume & job application email template with skills grid, experience highlights & contact details.',
                html: resumeHtml,
                thumbnail_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60',
                is_system_template: true,
                user_id: null
              })
            ).catch(console.warn);
          }

          const dbIds = new Set(dbTemplates.map((t) => t.id));
          const missingSystemTemplates = FALLBACK_SYSTEM_TEMPLATES.filter((st) => !dbIds.has(st.id));

          res.json({ success: true, data: [...dbTemplates, ...missingSystemTemplates] });
          return;
        }
      } catch (dbErr) {
        console.warn('Supabase templates query error, falling back to local system templates:', dbErr);
      }
    }

    // Fallback response for dev / offline mode
    const fallbackTemplates = FALLBACK_SYSTEM_TEMPLATES.map((t) => {
      if (t.id === '55555555-5555-5555-5555-555555555555' && resumeHtml) {
        return { ...t, html: resumeHtml };
      }
      return t;
    });
    const filteredUser = userCustomTemplates.filter((t) => t.user_id === userId);
    res.json({ success: true, data: [...fallbackTemplates, ...filteredUser] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const resumeHtml = getResumeTemplateHtml();

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        let templateData = data;
        if (id === '55555555-5555-5555-5555-555555555555' && resumeHtml) {
          templateData = { ...templateData, html: resumeHtml };
        }
        res.json({ success: true, data: templateData });
        return;
      }
    }

    // Check fallback system templates if not found in database
    const systemMatch = FALLBACK_SYSTEM_TEMPLATES.find((t) => t.id === id);
    if (systemMatch) {
      const finalMatch = (id === '55555555-5555-5555-5555-555555555555' && resumeHtml) 
        ? { ...systemMatch, html: resumeHtml } 
        : systemMatch;
      res.json({ success: true, data: finalMatch });
      return;
    }

    const customMatch = userCustomTemplates.find((t) => t.id === id);
    if (customMatch) {
      res.json({ success: true, data: customMatch });
      return;
    }

    res.status(404).json({ success: false, message: 'Template not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch template' });
  }
};

export const createTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parseResult = templateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: parseResult.error.errors[0]?.message || 'Invalid payload' });
    return;
  }

  const { name, description, html, thumbnail_url } = parseResult.data;
  const sanitizedHtml = EmailService.sanitizeEmailHtml(html);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('templates')
        .insert({
          user_id: userId,
          name,
          description,
          html: sanitizedHtml,
          thumbnail_url,
          is_system_template: false,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ success: true, data });
      return;
    }

    const newTemplate: TemplateRecord = {
      id: `tmpl_${Date.now()}`,
      user_id: userId,
      name,
      description,
      html: sanitizedHtml,
      thumbnail_url: thumbnail_url || '',
      is_system_template: false,
      created_at: new Date().toISOString(),
    };
    userCustomTemplates.unshift(newTemplate);
    res.status(201).json({ success: true, data: newTemplate });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create template' });
  }
};

export const updateTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parseResult = templateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: parseResult.error.errors[0]?.message || 'Invalid payload' });
    return;
  }

  const { name, description, html, thumbnail_url } = parseResult.data;
  const sanitizedHtml = EmailService.sanitizeEmailHtml(html);

  try {
    if (isSupabaseConfigured()) {
      // Ensure target template belongs to user and is NOT a system template
      const { data: existing } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (!existing) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      if (existing.is_system_template) {
        res.status(403).json({ success: false, message: 'System templates cannot be edited directly. Use duplicate instead.' });
        return;
      }

      if (existing.user_id !== userId) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('templates')
        .update({
          name,
          description,
          html: sanitizedHtml,
          thumbnail_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, data });
      return;
    }

    const idx = userCustomTemplates.findIndex(t => t.id === id && t.user_id === userId);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Template not found or non-editable' });
      return;
    }

    userCustomTemplates[idx] = {
      ...userCustomTemplates[idx],
      name,
      description,
      html: sanitizedHtml,
      thumbnail_url: thumbnail_url || userCustomTemplates[idx].thumbnail_url,
      updated_at: new Date().toISOString(),
    };

    res.json({ success: true, data: userCustomTemplates[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      const { data: existing } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (!existing) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      if (existing.is_system_template || existing.user_id !== userId) {
        res.status(403).json({ success: false, message: 'Cannot delete system or unauthorized template' });
        return;
      }

      const { error } = await supabaseAdmin.from('templates').delete().eq('id', id);
      if (error) throw error;

      res.json({ success: true, message: 'Template deleted successfully' });
      return;
    }

    userCustomTemplates = userCustomTemplates.filter(t => !(t.id === id && t.user_id === userId));
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete template' });
  }
};

export const duplicateTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    let sourceTemplate: TemplateRecord | null = null;

    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin.from('templates').select('*').eq('id', id).single();
      sourceTemplate = data;
    } else {
      sourceTemplate = [...FALLBACK_SYSTEM_TEMPLATES, ...userCustomTemplates].find(t => t.id === id) || null;
    }

    if (!sourceTemplate) {
      res.status(404).json({ success: false, message: 'Source template not found' });
      return;
    }

    const newName = `${sourceTemplate.name} (Copy)`;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('templates')
        .insert({
          user_id: userId,
          name: newName,
          description: sourceTemplate.description,
          html: sourceTemplate.html,
          thumbnail_url: sourceTemplate.thumbnail_url,
          is_system_template: false,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ success: true, data });
      return;
    }

    const duplicated: TemplateRecord = {
      id: `tmpl_${Date.now()}`,
      user_id: userId,
      name: newName,
      description: sourceTemplate.description,
      html: sourceTemplate.html,
      thumbnail_url: sourceTemplate.thumbnail_url,
      is_system_template: false,
      created_at: new Date().toISOString(),
    };
    userCustomTemplates.unshift(duplicated);
    res.status(201).json({ success: true, data: duplicated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to duplicate template' });
  }
};
