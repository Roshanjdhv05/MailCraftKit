import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  RotateCcw,
} from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { SandboxedPreview } from '../components/Email/SandboxedPreview';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { api } from '../lib/api';

export const SendEmail: React.FC = () => {
  const navigate = useNavigate();

  const [fromEmail, setFromEmail] = useState('notifications@designmailer.local');
  const [fromName, setFromName] = useState('MailCraftKit Platform');
  const [toRecipient, setToRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [emailHtml, setEmailHtml] = useState<string>('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const [sendResult, setSendResult] = useState<{
    status: 'success' | 'failed';
    message: string;
    recipient?: string;
  } | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  useEffect(() => {
    const cachedHtml = sessionStorage.getItem('active_email_html');
    const cachedSubject = sessionStorage.getItem('active_email_subject');
    const cachedTmplId = sessionStorage.getItem('active_template_id');

    if (cachedHtml) {
      setEmailHtml(cachedHtml);
    } else {
      setEmailHtml('<!DOCTYPE html><html><body style="font-family:sans-serif;padding:30px;"><h2>Elevi8 Email Campaign</h2><p>Custom email body content.</p></body></html>');
    }

    if (cachedSubject) {
      setSubject(cachedSubject);
    } else {
      setSubject('Elevi8 Email Campaign Notification');
    }

    if (cachedTmplId) {
      setTemplateId(cachedTmplId);
    }

    // Auto load user profile to set default Sender Name (User Name) and Sender Email (SMTP User Email)
    api.getProfile().then((res) => {
      if (res.success && res.data) {
        const uName = res.data.username || res.data.full_name || res.data.company_name;
        const uEmail = res.data.smtp_user || res.data.smtp_from_email || res.data.email;
        if (uName) setFromName(uName);
        if (uEmail) setFromEmail(uEmail);
      }
    }).catch(() => {});
  }, []);

  const handleSendTest = async () => {
    if (!toRecipient) {
      addToast('error', 'Please provide a valid recipient email address');
      return;
    }

    setSendingTest(true);
    try {
      const res = await api.sendTestEmail({
        to: toRecipient,
        fromEmail: fromEmail || undefined,
        fromName: fromName || undefined,
        subject: `[Test] ${subject}`,
        html: emailHtml,
      });

      if (res.success) {
        addToast('success', res.message || `Test email dispatched to ${toRecipient}`);
      } else {
        addToast('error', res.message || 'Failed to send test email');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Test email error');
    } finally {
      setSendingTest(false);
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setSending(true);
    setSendResult(null);

    try {
      const res = await api.sendEmail({
        to: toRecipient,
        fromEmail: fromEmail || undefined,
        fromName: fromName || undefined,
        subject,
        templateId,
        html: emailHtml,
      });

      if (res.success) {
        setSendResult({
          status: 'success',
          message: 'Email sent successfully!',
          recipient: toRecipient,
        });
        addToast('success', 'Email dispatched successfully');
      } else {
        setSendResult({
          status: 'failed',
          message: res.message || 'Email could not be sent. Please check your SMTP configuration and try again.',
          recipient: toRecipient,
        });
        addToast('error', res.message || 'Send failed');
      }
    } catch (err: any) {
      setSendResult({
        status: 'failed',
        message: err.message || 'Unexpected server error while sending email',
      });
      addToast('error', 'Sending error');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout title="Compose & Send Email">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="space-y-6 max-w-7xl mx-auto">
        {sendResult ? (
          /* Result Feedback Screen */
          <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
            {sendResult.status === 'success' ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">Email Sent Successfully</h2>
                <p className="text-sm text-slate-300">
                  The email was processed and dispatched through Nodemailer SMTP to:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 font-mono text-sm font-semibold">
                  {sendResult.recipient}
                </div>
                <div className="pt-4 flex items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
                  >
                    <History className="w-4 h-4" />
                    <span>View Email History</span>
                  </button>
                  <button
                    onClick={() => setSendResult(null)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Send Another Email</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <XCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">Email Could Not Be Sent</h2>
                <p className="text-sm text-rose-300 max-w-md mx-auto leading-relaxed">
                  {sendResult.message}
                </p>
                <div className="pt-4 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setSendResult(null)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700"
                  >
                    Check SMTP Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main Sender Form & Live Preview Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sender Form Column */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-indigo-400" />
                    <span>Campaign Dispatch Details</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure recipient email, subject header, and execute safe delivery.
                  </p>
                </div>

                {/* From Sender Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      From Sender Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        placeholder="Elevi8 Sales Team"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      From Sender Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        placeholder="sales@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* To Recipient Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    To Recipient Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={toRecipient}
                      onChange={(e) => setToRecipient(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Subject Line Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject Line <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Welcome to Elevi8"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={sendingTest || sending}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{sendingTest ? 'Sending Test...' : 'Send Test Email'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!toRecipient) {
                      addToast('error', 'Recipient email address is required');
                      return;
                    }
                    if (!subject) {
                      addToast('error', 'Subject line is required');
                      return;
                    }
                    setShowConfirmModal(true);
                  }}
                  disabled={sending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Processing...' : 'Send Email'}</span>
                </button>
              </div>
            </div>

            {/* Live Email Preview Column */}
            <SandboxedPreview html={emailHtml} className="h-full min-h-[500px]" />
          </div>
        )}
      </div>

      {/* Double Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Email Delivery</h3>
                <p className="text-xs text-slate-400">Double check recipient address before dispatching</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">
                Recipient: <strong className="text-indigo-300 font-mono">{toRecipient}</strong>
              </div>
              <div className="text-slate-400 truncate">
                Subject: <strong className="text-white">{subject}</strong>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to send this email now?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
