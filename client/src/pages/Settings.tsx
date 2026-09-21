import React, { useEffect, useState } from 'react';
import { Server, Database, User, ShieldCheck, RefreshCcw, Save, Key, Building2, AtSign, Mail } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Profile & SMTP form states
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  const loadProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.data) {
        setCompanyName(res.data.company_name || user?.user_metadata?.company_name || '');
        setUserName(res.data.username || user?.user_metadata?.username || '');
        setSmtpUser(res.data.smtp_user || user?.email || '');
        setSmtpPass(res.data.smtp_pass || '');
        setSmtpHost(res.data.smtp_host || 'smtp.gmail.com');
        setSmtpPort(res.data.smtp_port || 587);
        setSmtpFromEmail(res.data.smtp_from_email || res.data.smtp_user || user?.email || '');
        setSmtpFromName(res.data.smtp_from_name || res.data.company_name || 'MailCraftKit User');
      }
    } catch (err) {
      console.warn('Could not fetch user profile details:', err);
    }
  };

  const checkStatus = async () => {
    setLoadingHealth(true);
    try {
      const res = await api.checkHealth();
      setServerHealth(res);
      addToast('success', 'Backend health check passed');
    } catch (err) {
      addToast('error', 'Backend health check failed');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkStatus();
    loadProfile();
  }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    try {
      const res = await api.updateSmtpSettings({
        company_name: companyName,
        username: userName,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort) || 587,
        smtp_from_email: smtpFromEmail || smtpUser || user?.email,
        smtp_from_name: smtpFromName || companyName || 'MailCraftKit User',
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to update profile settings');
      }

      addToast('success', 'Profile and SMTP settings saved successfully');
    } catch (err: any) {
      addToast('error', err?.message || 'Error saving SMTP configuration');
    } finally {
      setSavingSmtp(false);
    }
  };

  return (
    <AppLayout title="System & Workspace Settings">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Profile Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-sky-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-sky-100">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-blue-950">User Workspace Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">User Name</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="john_doe"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">Company Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Per-User SMTP Server Configuration */}
        <form onSubmit={handleSaveSmtp} className="bg-white p-6 rounded-2xl border border-sky-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-blue-950">Per-User SMTP Server Credentials</h3>
                <p className="text-xs text-slate-500">Configure your personal SMTP credentials for email dispatching.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSmtp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSmtp ? 'Saving...' : 'Save Credentials'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">SMTP User / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="your-name@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">SMTP Password / App Secret</label>
              <div className="relative">
                <Key className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">SMTP Port</label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587"
                className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">Sender Email (From)</label>
              <input
                type="email"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                placeholder="notifications@yourdomain.com"
                className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 uppercase text-xs tracking-wider">Sender Display Name</label>
              <input
                type="text"
                value={smtpFromName}
                onChange={(e) => setSmtpFromName(e.target.value)}
                placeholder="Acme Notifications"
                className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </form>

        {/* System Health Card */}
        <div className="bg-white p-6 rounded-2xl border border-sky-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-blue-950">System Diagnostics</h3>
            </div>
            <button
              onClick={checkStatus}
              disabled={loadingHealth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 border border-sky-200 text-xs font-semibold text-blue-900 hover:bg-sky-200 transition-colors"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/80">
              <span className="text-slate-700 font-medium">Express API Server</span>
              <span className="text-emerald-600 font-mono font-bold">
                {serverHealth ? 'ONLINE (Port 5000)' : 'CHECKING...'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/80">
              <span className="text-slate-700 font-medium">Supabase Auth &amp; Database</span>
              <span className={`font-mono font-bold ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL DEV FALLBACK MODE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
