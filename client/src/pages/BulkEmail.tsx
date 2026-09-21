import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  Users,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ChevronDown,
  Mail,
  User,
  Loader2,
  BarChart3,
  Download,
  Eye,
} from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { SandboxedPreview } from '../components/Email/SandboxedPreview';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { api } from '../lib/api';
import { Template } from '../types';

type Step = 'upload' | 'configure' | 'confirm' | 'sending' | 'results';

interface Recipient {
  email: string;
  [key: string]: string;
}

interface BulkResult {
  email: string;
  status: 'sent' | 'failed';
  error?: string;
}

interface SendSummary {
  total: number;
  sent: number;
  failed: number;
  results: BulkResult[];
}

export const BulkEmail: React.FC = () => {
  const navigate = useNavigate();

  // Steps
  const [step, setStep] = useState<Step>('upload');

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [delayMs, setDelayMs] = useState(300);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Sending state
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [summary, setSummary] = useState<SendSummary | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  // Load templates and user profile on mount
  useEffect(() => {
    api.getTemplates().then((res) => {
      if (res.success && res.data) setTemplates(res.data);
    }).catch(() => {});

    api.getProfile().then((res) => {
      if (res.success && res.data) {
        const uName = res.data.username || res.data.full_name || res.data.company_name;
        const uEmail = res.data.smtp_user || res.data.smtp_from_email || res.data.email;
        if (uName) setFromName(uName);
        if (uEmail) setFromEmail(uEmail);
      }
    }).catch(() => {});
  }, []);

  // Auto-load template HTML for preview when template is selected
  useEffect(() => {
    if (!selectedTemplateId) {
      setPreviewHtml('');
      return;
    }
    const t = templates.find((t) => t.id === selectedTemplateId);
    if (t) setPreviewHtml(t.html);
  }, [selectedTemplateId, templates]);

  const handleFileDrop = useCallback(
    async (droppedFile: File) => {
      if (!droppedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        addToast('error', 'Please upload a CSV or Excel (.xlsx / .xls) file');
        return;
      }
      setFile(droppedFile);
      setParsing(true);
      try {
        const res = await api.parseBulkFile(droppedFile);
        if (res.success && res.data) {
          setRecipients(res.data.recipients as Recipient[]);
          setColumns(res.data.columns);
          addToast('success', `Parsed ${res.data.total} recipients from the file`);
          setStep('configure');
        } else {
          addToast('error', res.message || 'Failed to parse file');
        }
      } catch (err: any) {
        addToast('error', err.message || 'Parse error');
      } finally {
        setParsing(false);
      }
    },
    []
  );

  const handleSend = async () => {
    if (!subject.trim()) {
      addToast('error', 'Email subject is required');
      return;
    }
    if (!selectedTemplateId && !previewHtml) {
      addToast('error', 'Please select a template or provide HTML content');
      return;
    }

    setStep('sending');
    setSending(true);

    // Simulate progress ticks while sending
    let tick = 0;
    const totalTicks = recipients.length;
    const progressInterval = setInterval(() => {
      tick++;
      setSendProgress(Math.min(Math.round((tick / totalTicks) * 95), 95));
    }, delayMs);

    try {
      const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
      const res = await api.sendBulkEmails({
        recipients,
        subject,
        html: selectedTemplate?.html,
        templateId: selectedTemplateId || undefined,
        fromEmail: fromEmail || undefined,
        fromName: fromName || undefined,
        delayMs,
      });

      clearInterval(progressInterval);
      setSendProgress(100);

      if (res.success && res.data) {
        setSummary(res.data);
        setStep('results');
      } else {
        addToast('error', res.message || 'Bulk send failed');
        setStep('configure');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      addToast('error', err.message || 'Unexpected error during bulk send');
      setStep('configure');
    } finally {
      setSending(false);
    }
  };

  const downloadResultsCsv = () => {
    if (!summary) return;
    const rows = [
      ['Email', 'Status', 'Error'],
      ...summary.results.map((r) => [r.email, r.status, r.error || '']),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_send_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setRecipients([]);
    setColumns([]);
    setSelectedTemplateId('');
    setSubject('');
    setPreviewHtml('');
    setSummary(null);
    setSendProgress(0);
  };

  return (
    <AppLayout title="Bulk Email Campaign">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Step Breadcrumb */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['upload', 'configure', 'confirm', 'sending', 'results'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  step === s
                    ? 'bg-blue-700 border-blue-600 text-white shadow-sm shadow-blue-700/20'
                    : ['results', 'sending'].includes(step) || (['upload', 'configure'].includes(step) && i < ['upload', 'configure', 'confirm', 'sending', 'results'].indexOf(step))
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-sky-50 border-sky-200 text-slate-600'
                }`}
              >
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 4 && <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />}
            </React.Fragment>
          ))}
        </div>

        {/* ─── STEP 1: UPLOAD ─────────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-sky-200/80 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload Recipients File</h2>
                  <p className="text-xs text-slate-500 mt-0.5">CSV, XLS, or XLSX — must include an "email" column</p>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileDrop(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center group ${
                  dragOver
                    ? 'border-blue-600 bg-sky-100/60 scale-[1.01]'
                    : 'border-sky-300 bg-sky-50/50 hover:border-blue-500 hover:bg-sky-100/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileDrop(f);
                  }}
                />
                {parsing ? (
                  <div className="space-y-3">
                    <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                    <p className="text-sm text-slate-900 font-semibold">Parsing your file...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center mx-auto text-blue-600 group-hover:bg-sky-200/70 transition-all">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        Drag & drop your CSV or Excel file here
                      </p>
                      <p className="text-sm text-slate-500 mt-1">or <span className="text-blue-700 font-semibold">click to browse</span> — max 10 MB</p>
                    </div>
                    <div className="inline-flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CSV</span>
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> XLSX</span>
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> XLS</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Format Guide */}
              <div className="mt-6 p-4 rounded-xl bg-sky-50/60 border border-sky-200">
                <p className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider">Required File Format</p>
                <div className="overflow-x-auto">
                  <table className="text-xs text-slate-800 w-full">
                    <thead>
                      <tr className="border-b border-sky-200">
                        <th className="text-left pb-2 pr-8 text-blue-900 font-semibold">email</th>
                        <th className="text-left pb-2 pr-8 text-slate-700 font-medium">name <span className="text-slate-500">(optional)</span></th>
                        <th className="text-left pb-2 text-slate-700 font-medium">company <span className="text-slate-500">(optional)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="pt-2 pr-8 font-mono">alice@example.com</td><td className="pt-2 pr-8">Alice Johnson</td><td className="pt-2">Acme Corp</td></tr>
                      <tr><td className="pt-1 pr-8 font-mono">bob@company.com</td><td className="pt-1 pr-8">Bob Smith</td><td className="pt-1">Tech Ltd</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">Extra columns (name, company, etc.) become <code className="text-blue-700 font-mono bg-sky-100 px-1 py-0.5 rounded">{'{{variable}}'}</code> placeholders automatically.</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: CONFIGURE ──────────────────────────────────────────── */}
        {step === 'configure' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Config Form */}
            <div className="space-y-5 bg-white rounded-2xl border border-sky-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-sky-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{recipients.length} Recipients Loaded</h2>
                    <p className="text-[11px] text-slate-500">{file?.name}</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-sky-100 rounded-lg transition-colors"
                  title="Change file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Template selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Email Template <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                >
                  <option value="">— Choose a template —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.is_system_template ? '★ ' : ''}{t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* From fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    From Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="Campaign Team"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    From Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="team@company.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Exclusive Offer Just for You, {{name}}!"
                  className="w-full px-4 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Delay */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delay Between Emails: <span className="text-blue-700 font-bold">{delayMs}ms</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={100}
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0ms (fastest)</span>
                  <span>2000ms (safe)</span>
                </div>
              </div>

              {/* Columns info */}
              {columns.length > 0 && (
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200">
                  <p className="text-[11px] font-semibold text-slate-700 mb-2">Available Template Variables from your file:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {columns.map((col) => (
                      <code key={col} className="text-[11px] bg-sky-100 border border-sky-200 text-blue-900 font-mono font-semibold px-2 py-0.5 rounded">
                        {`{{${col}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!subject.trim()) { addToast('error', 'Subject is required'); return; }
                    if (!selectedTemplateId && !previewHtml) { addToast('error', 'Select a template'); return; }
                    setStep('confirm');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-sm font-semibold shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Continue to Review
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-sm font-semibold border border-sky-200 transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  Preview
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="rounded-2xl overflow-hidden border border-sky-200/80 bg-white flex flex-col min-h-[520px] shadow-sm">
              <div className="px-4 py-3 bg-sky-50 border-b border-sky-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-900">Template Preview</span>
              </div>
              {previewHtml ? (
                <SandboxedPreview html={previewHtml} className="flex-1" />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-sky-50/30">
                  <div className="text-center space-y-2">
                    <FileSpreadsheet className="w-10 h-10 text-sky-300 mx-auto" />
                    <p className="text-sm text-slate-500 font-medium">Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 3: CONFIRM ────────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-sky-200/80 p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Confirm Bulk Send</h2>
                  <p className="text-sm text-slate-500">Review your campaign details before dispatching</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Recipients', value: `${recipients.length} email addresses`, accent: true },
                  { label: 'Template', value: templates.find(t => t.id === selectedTemplateId)?.name || 'Custom HTML' },
                  { label: 'Subject', value: subject },
                  { label: 'From', value: `${fromName} <${fromEmail}>` },
                  { label: 'Send Delay', value: `${delayMs}ms between each email` },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-50/50 border border-sky-200">
                    <span className="text-xs text-slate-500 w-24 shrink-0 pt-0.5 font-semibold uppercase tracking-wider">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.accent ? 'text-blue-700 font-bold' : 'text-slate-900'}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Recipients mini-table */}
              <div>
                <p className="text-xs text-slate-700 mb-2 font-semibold uppercase tracking-wider">First 5 Recipients Preview</p>
                <div className="rounded-xl border border-sky-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-sky-50 border-b border-sky-200">
                        <th className="text-left px-4 py-2.5 text-slate-700 font-semibold">#</th>
                        <th className="text-left px-4 py-2.5 text-slate-700 font-semibold">Email</th>
                        {columns.slice(0, 2).map((col) => (
                          <th key={col} className="text-left px-4 py-2.5 text-slate-700 font-semibold capitalize">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-b border-sky-100 last:border-0">
                          <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                          <td className="px-4 py-2 text-slate-900 font-mono font-medium">{r.email}</td>
                          {columns.slice(0, 2).map((col) => (
                            <td key={col} className="px-4 py-2 text-slate-700">{r[col] || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recipients.length > 5 && (
                    <div className="px-4 py-2 bg-sky-50/60 text-[11px] text-slate-500">
                      + {recipients.length - 5} more recipients
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep('configure')}
                  className="flex-1 py-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 font-semibold text-sm border border-sky-200 transition-all"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Launch Campaign ({recipients.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: SENDING ────────────────────────────────────────────── */}
        {step === 'sending' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-sky-200/80 p-10 text-center space-y-8 shadow-md">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-sky-200" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Send className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Sending Campaign...</h2>
                <p className="text-sm text-slate-500">Dispatching emails to {recipients.length} recipients</p>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-sky-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full transition-all duration-500"
                    style={{ width: `${sendProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">{sendProgress}% complete</p>
              </div>
              <p className="text-xs text-slate-500">Do not close this page while sending</p>
            </div>
          </div>
        )}

        {/* ─── STEP 5: RESULTS ────────────────────────────────────────────── */}
        {step === 'results' && summary && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-sky-200 p-6 text-center shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{summary.total}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Total Recipients</div>
              </div>
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">{summary.sent}</div>
                <div className="text-xs text-emerald-700 mt-1 font-medium">Sent Successfully</div>
              </div>
              <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-3 text-rose-500">
                  <XCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-3xl font-extrabold text-rose-500">{summary.failed}</div>
                <div className="text-xs text-rose-700 mt-1 font-medium">Failed</div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-sky-200/80 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Detailed Results
                </h3>
                <button
                  onClick={downloadResultsCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-sky-50">
                    <tr className="border-b border-sky-200">
                      <th className="text-left px-6 py-3 text-slate-700 font-semibold uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-slate-700 font-semibold uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 text-slate-700 font-semibold uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-slate-700 font-semibold uppercase tracking-wider">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.results.map((r, i) => (
                      <tr key={i} className="border-b border-sky-100 last:border-0 hover:bg-sky-50/50 transition-colors text-slate-900">
                        <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3 text-slate-900 font-mono font-medium">{r.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.status === 'sent'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {r.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-rose-600 text-[11px]">{r.error || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-semibold text-sm shadow-md shadow-blue-900/20 transition-all"
              >
                <Upload className="w-4 h-4" />
                New Campaign
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 font-semibold text-sm border border-sky-200 transition-all"
              >
                View Email History
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
