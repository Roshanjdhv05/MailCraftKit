import { Request } from 'express';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface TemplateRecord {
  id: string;
  user_id: string | null;
  name: string;
  description?: string;
  html: string;
  thumbnail_url?: string;
  is_system_template: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailLogRecord {
  id: string;
  user_id: string;
  template_id?: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
  provider: string;
  message_id?: string;
  error_message?: string;
  sent_at: string;
  created_at: string;
}

export interface ProcessEmailPayload {
  to: string;
  subject: string;
  templateId?: string;
  html?: string;
  variables?: Record<string, string>;
}
