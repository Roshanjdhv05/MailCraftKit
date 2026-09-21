import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Lock, Mail, User as UserIcon, Building2, AtSign, ArrowRight, CheckCircle2, Server, Key, ShieldCheck, SkipForward } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'smtp_setup' | 'forgot'>('login');
  
  // Registration fields
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  
  // Onboarding SMTP fields
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else if (mode === 'signup') {
        // Step 1: Register User with email, company name, user name, password
        const { error } = await signUp(email, password, userName || email.split('@')[0], userName, companyName);
        if (error) throw error;

        // Auto pre-fill SMTP user with registration email
        setSmtpUser(email);
        setMode('smtp_setup');
        setMessage({
          type: 'success',
          text: 'Account registered successfully! Please configure your SMTP server credentials.',
        });
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Password reset instructions have been sent to your email address.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Authentication operation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Store user SMTP configuration in database
      const res = await api.updateSmtpSettings({
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort) || 587,
        smtp_from_email: smtpUser || email,
        smtp_from_name: companyName || userName || 'MailCraftKit User',
        username: userName,
        company_name: companyName,
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to save SMTP settings');
      }

      setMessage({
        type: 'success',
        text: 'SMTP setup completed! Redirecting to workspace...',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Failed to save SMTP settings',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="Mailcraft Icon" className="h-24 sm:h-28 w-auto mx-auto mb-4 object-contain bg-transparent drop-shadow-md" />
          <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Mailcraft</h1>
          <p className="text-sm text-slate-600 mt-1">
            {mode === 'login' && 'Welcome back! Sign in to your workspace.'}
            {mode === 'signup' && 'Step 1 of 2: Register your workspace account.'}
            {mode === 'smtp_setup' && 'Step 2 of 2: Configure your per-user SMTP server.'}
            {mode === 'forgot' && 'Reset your account password.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 border border-sky-200/80 shadow-xl shadow-blue-950/5">
          {message && (
            <div
              className={`p-4 rounded-xl text-sm mb-6 flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* STEP 2: SMTP SETUP FORM */}
          {mode === 'smtp_setup' ? (
            <form onSubmit={handleSmtpSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-blue-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600" />
                <span>
                  Enter your SMTP credentials below. These will be securely attached to your account for sending email campaigns.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">SMTP Username / Email</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="your-name@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">SMTP Password / App Secret</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">SMTP Host</label>
                  <div className="relative">
                    <Server className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Port</label>
                  <input
                    type="number"
                    required
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="587"
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-700/25 active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{loading ? 'Saving Setup...' : 'Save & Finish Onboarding'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="py-3 px-4 rounded-xl bg-sky-100 hover:bg-sky-200 font-medium text-blue-950 text-xs flex items-center gap-1.5 transition-colors border border-sky-200"
                >
                  <span>Skip</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 1: REGISTRATION / LOGIN FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Company Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">User Name</label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="john_doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-blue-700 hover:text-blue-900 transition-colors font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-700/25 active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'login'
                    ? 'Sign In to Account'
                    : mode === 'signup'
                    ? 'Register & Setup SMTP →'
                    : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode Switchers */}
          {mode !== 'smtp_setup' && (
            <div className="mt-6 pt-6 border-t border-sky-100 text-center text-xs text-slate-600">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-700 hover:text-blue-900 hover:underline font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-700 hover:text-blue-900 hover:underline font-semibold"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
