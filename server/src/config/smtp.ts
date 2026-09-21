import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { supabaseAdmin, isSupabaseConfigured } from './supabase.js';

dotenv.config();

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  fromName: string;
  fromEmail: string;
}

export const getSmtpConfig = (): SmtpConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'MailCraftKit Platform',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'notifications@designmailer.local',
  };
};

export const getOrCreateTransporter = async (
  userId?: string
): Promise<{ transporter: Transporter; fromName: string; fromEmail: string }> => {
  dotenv.config();

  // 1. Check if user has individual SMTP credentials stored in Supabase profiles
  if (userId && isSupabaseConfigured()) {
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, smtp_from_email, smtp_from_name, username, full_name, company_name, email')
        .eq('id', userId)
        .single();

      if (profile && profile.smtp_user && profile.smtp_pass) {
        const host = profile.smtp_host || 'smtp.gmail.com';
        const port = profile.smtp_port || 587;
        const secure = Boolean(profile.smtp_secure);

        const userTransporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user: profile.smtp_user,
            pass: profile.smtp_pass,
          },
        });

        // From Sender Email is the SMTP user email, From Sender Name is the user name
        const fromEmail = profile.smtp_user || profile.smtp_from_email || profile.email;
        const fromName = profile.username || profile.full_name || profile.smtp_from_name || profile.company_name || 'MailCraftKit User';

        return {
          transporter: userTransporter,
          fromName,
          fromEmail,
        };
      }
    } catch (err) {
      console.warn('[SMTP Config]: Failed to fetch user SMTP credentials from DB, falling back to system defaults', err);
    }
  }

  // 2. System Level .env Credentials
  const config = getSmtpConfig();
  if (config.host && config.user && config.password) {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
    return {
      transporter,
      fromName: config.fromName,
      fromEmail: config.fromEmail !== 'notifications@designmailer.local' ? config.fromEmail : config.user,
    };
  }

  // 3. Fallback: Create Ethereal test account if credentials are not specified
  try {
    const testAccount = await nodemailer.createTestAccount();
    const fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return {
      transporter: fallbackTransporter,
      fromName: config.fromName,
      fromEmail: testAccount.user || config.fromEmail,
    };
  } catch (error) {
    const jsonTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return { transporter: jsonTransporter, fromName: config.fromName, fromEmail: config.fromEmail };
  }
};
