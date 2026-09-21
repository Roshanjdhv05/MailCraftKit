import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCode,
  Send,
  XCircle,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { api } from '../lib/api';
import { Template, EmailLog } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tmplRes, logRes] = await Promise.all([
          api.getTemplates(),
          api.getEmailHistory(),
        ]);
        if (tmplRes.success && tmplRes.data) setTemplates(tmplRes.data);
        if (logRes.success && logRes.data) setEmailLogs(logRes.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sentCount = emailLogs.filter((l) => l.status === 'sent').length;
  const failedCount = emailLogs.filter((l) => l.status === 'failed').length;

  return (
    <AppLayout title="Dashboard Overview">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Banner Hero */}
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-8 border border-blue-400/30 overflow-hidden shadow-xl">
          <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none">
            <Send className="w-80 h-80 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> High-Converting Email Engine
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Create, Customize &amp; Dispatch Professional HTML Emails
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Select built-in templates, edit visual variables or raw HTML code with real-time sandboxed previewing, and send via your configured SMTP transport.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/templates')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-semibold text-xs transition-all shadow-md"
              >
                <FileCode className="w-4 h-4" />
                <span>Browse Templates</span>
              </button>
              <button
                onClick={() => navigate('/import')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-800/40 hover:bg-blue-800/60 text-white font-semibold text-xs border border-white/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Import Custom HTML</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Templates Card */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Templates</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{loading ? '...' : templates.length}</h3>
              <p className="text-[11px] text-slate-400">Built-in system &amp; user copies</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCode className="w-6 h-6" />
            </div>
          </div>

          {/* Emails Sent Card */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Emails Sent</p>
              <h3 className="text-3xl font-extrabold text-emerald-600">{loading ? '...' : sentCount}</h3>
              <p className="text-[11px] text-emerald-500">Successfully delivered</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <Send className="w-6 h-6" />
            </div>
          </div>

          {/* Emails Failed Card */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Emails Failed</p>
              <h3 className="text-3xl font-extrabold text-rose-500">{loading ? '...' : failedCount}</h3>
              <p className="text-[11px] text-rose-400">SMTP error logs recorded</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Templates */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Recent Templates</span>
              </h3>
              <button
                onClick={() => navigate('/templates')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">No templates available yet.</p>
                <button
                  onClick={() => navigate('/import')}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                >
                  Import Template
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.slice(0, 4).map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between hover:border-blue-300 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/editor?templateId=${tmpl.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {tmpl.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{tmpl.description}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                        tmpl.is_system_template
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-blue-50 border-blue-200 text-blue-600'
                      }`}
                    >
                      {tmpl.is_system_template ? 'System' : 'Custom'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Emails Sent */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Recent Sent Emails</span>
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View History <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Send className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">No emails sent yet.</p>
                <button
                  onClick={() => navigate('/send')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
                >
                  Send First Email
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {emailLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{log.subject}</div>
                      <div className="text-xs text-slate-400">To: {log.recipient}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          log.status === 'sent'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-rose-50 border-rose-200 text-rose-500'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
