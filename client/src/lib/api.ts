import { supabase, isSupabaseConfigured } from './supabase';
import { ApiResponse, Template, EmailLog } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const localToken = localStorage.getItem('designmailer_auth_token');
  if (localToken) {
    headers['Authorization'] = `Bearer ${localToken}`;
    return headers;
  }

  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    }
  }

  // Dev offline / unauthenticated fallback header
  headers['Authorization'] = 'Bearer mock-user-00000000-0000-0000-0000-000000000001';
  return headers;
};

export const api = {
  // Check health
  async checkHealth(): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },

  // Templates API
  async getTemplates(): Promise<ApiResponse<Template[]>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/templates`, { headers });
    return res.json();
  },

  async getTemplateById(id: string): Promise<ApiResponse<Template>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, { headers });
    return res.json();
  },

  async createTemplate(payload: { name: string; description?: string; html: string; thumbnail_url?: string }): Promise<ApiResponse<Template>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateTemplate(id: string, payload: { name: string; description?: string; html: string; thumbnail_url?: string }): Promise<ApiResponse<Template>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteTemplate(id: string): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  async duplicateTemplate(id: string): Promise<ApiResponse<Template>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/templates/${id}/duplicate`, {
      method: 'POST',
      headers,
    });
    return res.json();
  },

  // Import API
  async importHtml(payload: { html: string; name?: string }): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/import/html`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Email Sending API
  async previewEmail(payload: { html: string; variables?: Record<string, string> }): Promise<ApiResponse<{ html: string }>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/email/preview`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async sendTestEmail(payload: { to: string; fromEmail?: string; fromName?: string; subject: string; html: string; variables?: Record<string, string> }): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/email/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async sendEmail(payload: { to: string; fromEmail?: string; fromName?: string; subject: string; templateId?: string; html?: string; variables?: Record<string, string> }): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/email/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getEmailHistory(): Promise<ApiResponse<EmailLog[]>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/email/history`, { headers });
    return res.json();
  },

  async getEmailLogById(id: string): Promise<ApiResponse<EmailLog>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/email/history/${id}`, { headers });
    return res.json();
  },

  // Profile & SMTP API
  async getProfile(): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/profile`, { headers });
    return res.json();
  },

  async updateSmtpSettings(payload: {
    smtp_host?: string;
    smtp_port?: number;
    smtp_user?: string;
    smtp_pass?: string;
    smtp_secure?: boolean;
    smtp_from_email?: string;
    smtp_from_name?: string;
    username?: string;
    company_name?: string;
    full_name?: string;
  }): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/profile/smtp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Auth API
  async signUp(payload: { email: string; password: string; fullName: string; username?: string; companyName?: string }): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async signIn(payload: { email: string; password: string }): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Bulk Email API
  async parseBulkFile(file: File): Promise<ApiResponse<{ recipients: Record<string, string>[]; total: number; columns: string[] }>> {
    const headers = await getAuthHeaders();
    delete headers['Content-Type']; // Let browser set multipart boundary
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/bulk/parse`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  async sendBulkEmails(payload: {
    recipients: Record<string, string>[];
    subject: string;
    html?: string;
    templateId?: string;
    fromEmail?: string;
    fromName?: string;
    delayMs?: number;
  }): Promise<ApiResponse<{ total: number; sent: number; failed: number; results: { email: string; status: 'sent' | 'failed'; error?: string }[] }>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/bulk/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Admin Portal endpoints
  async getAdminStats(): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
    return res.json();
  },

  async getAdminUsers(): Promise<ApiResponse<any[]>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers });
    return res.json();
  },

  async getAdminTemplates(): Promise<ApiResponse<any[]>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/templates`, { headers });
    return res.json();
  },

  async importAdminTemplate(payload: {
    name: string;
    description?: string;
    html: string;
    category?: string;
    thumbnail_url?: string;
  }): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/templates/import`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteAdminTemplate(id: string): Promise<ApiResponse<void>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/templates/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  async getAdminLogs(): Promise<ApiResponse<any[]>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/logs`, { headers });
    return res.json();
  },

  // Assets Upload API
  async uploadAsset(file: File): Promise<ApiResponse<{ url: string; fileName: string; storagePath: string }>> {
    const headers = await getAuthHeaders();
    delete headers['Content-Type']; // Let browser set multipart boundary
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/assets/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // GIF Ticker Generation API
  async generateTickerGif(payload: {
    slides: Array<{ imgSrc?: string; title?: string; desc?: string; btnText?: string; btnColor?: string }>;
    animationSpeed?: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
  }): Promise<ApiResponse<{ url: string; type: string }>> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/gif/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
