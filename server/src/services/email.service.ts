import nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';
import juice from 'juice';
import { getOrCreateTransporter } from '../config/smtp.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export interface ProcessAndSendOptions {
  userId: string;
  templateId?: string;
  recipient: string;
  fromEmail?: string;
  fromName?: string;
  subject: string;
  html: string;
  variables?: Record<string, string>;
}

export class EmailService {
  /**
   * Sanitizes raw HTML using sanitize-html.
   * Allows email-safe HTML tags and inline CSS while strictly stripping scripts,
   * iframes, object/embed tags, and event handlers.
   */
  public static sanitizeEmailHtml(rawHtml: string): string {
    return sanitizeHtml(rawHtml, {
      allowedTags: [
        'html', 'head', 'body', 'meta', 'style', 'title',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'br', 'hr',
        'table', 'tbody', 'thead', 'tr', 'td', 'th',
        'a', 'img', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'code', 'pre',
        'ul', 'ol', 'li', 'blockquote', 'center'
      ],
      allowedAttributes: {
        '*': ['style', 'class', 'id', 'align', 'valign', 'bgcolor', 'width', 'height', 'cellpadding', 'cellspacing', 'border'],
        'a': ['href', 'target', 'title', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height', 'border', 'style'],
        'meta': ['charset', 'name', 'content', 'http-equiv', 'viewport'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'cid', 'data'],
      allowedSchemesByTag: {
        a: ['http', 'https', 'mailto'],
        img: ['http', 'https', 'cid', 'data'],
      },
      allowProtocolRelative: false,
      disallowedTagsMode: 'discard',
    });
  }

  /**
   * Replaces placeholders like {{name}}, {{company}} with values.
   */
  public static processVariables(html: string, variables?: Record<string, string>): string {
    if (!variables) return html;

    let processedHtml = html;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedHtml = processedHtml.replace(regex, value ?? '');
    });
    return processedHtml;
  }

  /**
   * Inlines CSS rules into standard HTML style attributes using juice.
   */
  public static inlineCss(html: string): string {
    try {
      return juice(html, {
        preserveMediaQueries: true,
        preserveFontFaces: true,
      });
    } catch (err) {
      console.warn('[Juice Warning]: Failed to inline CSS completely, returning sanitized HTML', err);
      return html;
    }
  }

  /**
   * Complete pipeline: Sanitize -> Process Variables -> Inline CSS
   */
  public static prepareFinalEmailHtml(rawHtml: string, variables?: Record<string, string>): string {
    const sanitized = this.sanitizeEmailHtml(rawHtml);
    const withVars = this.processVariables(sanitized, variables);
    const inlined = this.inlineCss(withVars);
    return inlined;
  }

  /**
   * Sends an email via Nodemailer SMTP transport and logs the outcome to database.
   */
  public static async sendEmail(options: ProcessAndSendOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { userId, templateId, recipient, fromEmail, fromName, subject, html, variables } = options;

    const finalHtml = this.prepareFinalEmailHtml(html, variables);

    let sendSuccess = false;
    let messageId: string | undefined;
    let errorMessage: string | undefined;

    try {
      const { transporter, fromName: defaultFromName, fromEmail: defaultFromEmail } = await getOrCreateTransporter(userId);

      const senderEmail = fromEmail || defaultFromEmail;
      const senderName = fromName || defaultFromName;

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        replyTo: senderEmail,
        to: recipient,
        subject: subject,
        html: finalHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      messageId = info.messageId || `msg_${Date.now()}`;
      sendSuccess = true;

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`✉️ [Ethereal Test Inbox URL]: ${previewUrl}`);
      }
    } catch (err: any) {
      sendSuccess = false;
      errorMessage = err.message || 'SMTP sending failed';
      console.error('[EmailService Error]:', errorMessage);
    }

    // Record into email_logs table
    await this.logEmailResult({
      user_id: userId,
      template_id: templateId,
      recipient,
      subject,
      status: sendSuccess ? 'sent' : 'failed',
      provider: 'nodemailer',
      message_id: messageId,
      error_message: errorMessage,
    });

    if (!sendSuccess) {
      return { success: false, error: errorMessage || 'Failed to dispatch email' };
    }

    return { success: true, messageId };
  }

  /**
   * Write send log into Supabase email_logs table.
   */
  private static async logEmailResult(logData: {
    user_id: string;
    template_id?: string;
    recipient: string;
    subject: string;
    status: 'sent' | 'failed';
    provider: string;
    message_id?: string;
    error_message?: string;
  }): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        await supabaseAdmin.from('email_logs').insert({
          user_id: logData.user_id,
          template_id: logData.template_id || null,
          recipient: logData.recipient,
          subject: logData.subject,
          status: logData.status,
          provider: logData.provider,
          message_id: logData.message_id || null,
          error_message: logData.error_message || null,
          sent_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('[EmailService log error]:', err);
    }
  }
}
