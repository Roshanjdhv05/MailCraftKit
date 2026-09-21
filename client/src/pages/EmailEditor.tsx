import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Code2,
  Sliders,
  Save,
  Send,
  RotateCcw,
  Sparkles,
  Mail,
  CheckCircle2,
  Layout,
} from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { SandboxedPreview } from '../components/Email/SandboxedPreview';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { api } from '../lib/api';
import { parseVariables, getDefaultVariableValues, replaceVariables } from '../lib/variableParser';
import { EmailBuilder } from '../components/Builder/EmailBuilder';

export const EmailEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');

  const [mode, setMode] = useState<'builder' | 'visual' | 'code'>(() => {
    const paramMode = searchParams.get('mode') as ('builder' | 'visual' | 'code');
    if (paramMode) return paramMode;
    if (templateId) return 'visual';
    return 'builder';
  });
  const [templateName, setTemplateName] = useState('Untitled Email Template');
  const [templateDesc, setTemplateDesc] = useState('Custom email template');
  const [rawHtml, setRawHtml] = useState<string>('<h1>{{heading}}</h1>\n<p>Hello {{name}},</p>\n<p>{{message}}</p>');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const [isSystemTemplate, setIsSystemTemplate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Test Email Modal State
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [testRecipient, setTestRecipient] = useState<string>('');
  const [testSubject, setTestSubject] = useState<string>('Test Email Preview');
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  // Load target template on mount if templateId provided
  useEffect(() => {
    if (!templateId) {
      // Default initial template
      const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{heading}}</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- 1. Top Heading Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">{{heading}}</h1>
            </td>
          </tr>
          <!-- 2. Greeting Below Heading -->
          <tr>
            <td align="left" style="padding: 32px 32px 12px 32px; color: #1e293b; font-size: 20px; font-weight: 700;">
              Hello {{name}} 👋,
            </td>
          </tr>
          <!-- 3. Body Message Below Greeting -->
          <tr>
            <td align="left" style="padding: 0 32px 24px 32px; color: #334155; font-size: 16px; line-height: 1.6;">
              {{message}}
            </td>
          </tr>
          <!-- 4. Centered Button Below Body -->
          <tr>
            <td align="center" style="padding: 8px 32px 36px 32px; text-align: center;">
              <a href="{{button_url}}" target="_blank" style="background-color: #4f46e5; color: #ffffff !important; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                {{button_text}} →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 20px 32px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; 2026 {{company}}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
      setRawHtml(defaultHtml);
      const extracted = parseVariables(defaultHtml);
      setVariables(getDefaultVariableValues(extracted));
      return;
    }

    setLoading(true);
    api.getTemplateById(templateId)
      .then((res) => {
        if (res.success && res.data) {
          setTemplateName(res.data.name);
          setTemplateDesc(res.data.description || '');
          setRawHtml(res.data.html);
          setIsSystemTemplate(res.data.is_system_template);

          const extracted = parseVariables(res.data.html);
          setVariables(getDefaultVariableValues(extracted));
        } else {
          addToast('error', 'Could not load requested template');
        }
      })
      .catch(() => addToast('error', 'Failed to fetch template'))
      .finally(() => setLoading(false));
  }, [templateId]);

  // Update extracted variables when raw HTML changes
  useEffect(() => {
    const extractedKeys = parseVariables(rawHtml);
    setVariables((prev) => {
      const updated: Record<string, string> = {};
      const defaults = getDefaultVariableValues(extractedKeys);
      extractedKeys.forEach((key) => {
        updated[key] = prev[key] !== undefined ? prev[key] : defaults[key] || '';
      });
      return updated;
    });
  }, [rawHtml]);

  // Real-time live update of processed HTML
  useEffect(() => {
    const output = replaceVariables(rawHtml, variables);
    setProcessedHtml(output);
  }, [rawHtml, variables]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (templateId && !isSystemTemplate) {
        const res = await api.updateTemplate(templateId, {
          name: templateName,
          description: templateDesc,
          html: rawHtml,
        });
        if (res.success) {
          addToast('success', 'Template updated successfully!');
        } else {
          addToast('error', res.message || 'Failed to update template');
        }
      } else {
        // Save as new custom template
        const nameToSave = isSystemTemplate ? `${templateName} (My Copy)` : templateName;
        const res = await api.createTemplate({
          name: nameToSave,
          description: templateDesc,
          html: rawHtml,
        });
        if (res.success && res.data) {
          addToast('success', 'Saved as new custom template!');
          navigate(`/editor?templateId=${res.data.id}`, { replace: true });
        } else {
          addToast('error', res.message || 'Failed to save template');
        }
      }
    } catch (err) {
      addToast('error', 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      addToast('error', 'Please enter a test recipient email address');
      return;
    }

    setSendingTest(true);
    try {
      const res = await api.sendTestEmail({
        to: testRecipient,
        subject: testSubject,
        html: rawHtml,
        variables,
      });

      if (res.success) {
        addToast('success', res.message || `Test email dispatched to ${testRecipient}`);
        setShowTestModal(false);
      } else {
        addToast('error', res.message || 'Failed to send test email');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Test email error');
    } finally {
      setSendingTest(false);
    }
  };

  const handleProceedToSend = () => {
    // Navigate to send page with active email state passed in state/storage
    sessionStorage.setItem('active_email_html', processedHtml);
    sessionStorage.setItem('active_email_subject', templateName);
    if (templateId) sessionStorage.setItem('active_template_id', templateId);
    navigate('/send');
  };

  const detectedKeys = Object.keys(variables);

  return (
    <AppLayout title="Email Editor & Customizer" noScroll={true}>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="flex-1 min-h-0 flex flex-col space-y-4 max-w-full w-full mx-auto">
        {/* Editor Top Command Bar */}
        <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* Template Info Inputs */}
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template Title..."
              className="bg-sky-50/50 border border-sky-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all w-full max-w-xs"
            />
            {isSystemTemplate && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                System Template
              </span>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-sky-100/70 p-1 rounded-xl border border-sky-200/80">
            {!templateId && (
              <button
                onClick={() => setMode('builder')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'builder'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-blue-950 hover:bg-sky-200/50 font-medium'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Visual Drag & Drop</span>
              </button>
            )}
            <button
              onClick={() => setMode('visual')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'visual'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-blue-950 hover:bg-sky-200/50 font-medium'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visual Variables</span>
            </button>
            <button
              onClick={() => setMode('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'code'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-blue-950 hover:bg-sky-200/50 font-medium'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML Monaco Editor</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Send Test</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-all"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saving ? 'Saving...' : 'Save Template'}</span>
            </button>
            <button
              onClick={handleProceedToSend}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Proceed to Send</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Split Screen */}
        {mode === 'builder' ? (
          <div className="flex-1 min-h-0 border border-sky-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
            <EmailBuilder
              templateName={templateName}
              templateId={templateId || undefined}
              initialHtml={rawHtml}
              onSave={async (doc, html) => {
                setRawHtml(html);
                await handleSave();
              }}
              onProceedToSend={(html) => {
                setRawHtml(html);
                handleProceedToSend();
              }}
              onSwitchToHtmlMode={(html) => {
                setRawHtml(html);
                setMode('code');
              }}
            />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
            {/* Left Panel: Visual Form OR Monaco Code Editor */}
            <div className="bg-white border border-sky-200/80 rounded-2xl flex flex-col overflow-hidden shadow-sm">
              {mode === 'visual' ? (
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                    <div>
                      <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span>Template Variables Form</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Auto-detected variable placeholders from HTML syntax <code className="text-blue-700 font-mono bg-sky-100/80 px-1 py-0.5 rounded">{"{{var}}"}</code>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-blue-800 px-2.5 py-1 rounded-full bg-sky-100 border border-sky-200">
                      {detectedKeys.length} Variables Found
                    </span>
                  </div>

                  {detectedKeys.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <Sparkles className="w-10 h-10 text-sky-400 mx-auto" />
                      <p className="text-sm text-slate-500">No variable placeholders found in HTML.</p>
                      <p className="text-xs text-slate-400">
                        Switch to HTML Editor mode and add tags like <code className="text-blue-600">{"{{heading}}"}</code> or <code className="text-blue-600">{"{{name}}"}</code>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {detectedKeys.map((key) => (
                        <div key={key} className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 capitalize tracking-wide">
                            {key.replace(/_/g, ' ')} <span className="text-blue-600 font-normal">({`{{${key}}}`})</span>
                          </label>
                          {key.includes('message') || key.includes('description') || key.includes('body') ? (
                            <textarea
                              rows={3}
                              value={variables[key] || ''}
                              onChange={(e) => handleVariableChange(key, e.target.value)}
                              placeholder={`Enter ${key}...`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          ) : (
                            <input
                              type="text"
                              value={variables[key] || ''}
                              onChange={(e) => handleVariableChange(key, e.target.value)}
                              placeholder={`Enter ${key}...`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="px-4 py-2.5 bg-sky-50 border-b border-sky-200 text-xs font-semibold text-blue-950 flex items-center justify-between">
                    <span>Monaco HTML Source Code</span>
                    <button
                      onClick={() => {
                        const extracted = parseVariables(rawHtml);
                        setVariables(getDefaultVariableValues(extracted));
                        addToast('info', 'Variables reset to defaults');
                      }}
                      className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Variables
                    </button>
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      defaultLanguage="html"
                      theme="vs"
                      value={rawHtml}
                      onChange={(val) => setRawHtml(val || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Sandboxed Preview Component */}
            <SandboxedPreview html={processedHtml} className="h-full" loading={loading} />
          </div>
        )}
      </div>

      {/* Send Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-sky-200/80 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Send Test Email</span>
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Test Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Test Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl bg-sky-100 text-blue-950 text-xs font-semibold hover:bg-sky-200 border border-sky-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  {sendingTest ? 'Sending...' : 'Send Test Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
