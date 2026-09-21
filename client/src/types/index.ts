export interface Template {
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

export interface EmailLog {
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
  templates?: {
    name: string;
  };
}

export interface Asset {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  mime_type: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
