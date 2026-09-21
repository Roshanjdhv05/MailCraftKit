import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Upload, FileUp, Sparkles, CheckCircle2, Send, Layout, Code2 } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { SandboxedPreview } from '../components/Email/SandboxedPreview';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { api } from '../lib/api';
import { EmailBuilder } from '../components/Builder/EmailBuilder';

interface ImportHtmlProps {
  initialMode?: 'visual' | 'raw';
}

export const ImportHtml: React.FC<ImportHtmlProps> = ({ initialMode = 'visual' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'visual' | 'raw'>(initialMode);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const [templateName, setTemplateName] = useState('Imported Email Template');
  const [htmlContent, setHtmlContent] = useState<string>('<!-- Paste custom email HTML here -->\n<div style="padding: 20px; font-family: sans-serif;">\n  <h1>{{heading}}</h1>\n  <p>Hello {{name}},</p>\n</div>');
  const [sanitizedPreview, setSanitizedPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  const handleProceedToSend = (htmlToSend?: string) => {
    const finalHtml = htmlToSend || htmlContent;
    if (!finalHtml.trim()) {
      addToast('error', 'HTML content cannot be empty');
      return;
    }
    sessionStorage.setItem('active_email_html', finalHtml);
    sessionStorage.setItem('active_email_subject', templateName || 'Imported Email Campaign');
    sessionStorage.removeItem('active_template_id');
    navigate('/send');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      addToast('error', 'Please upload a valid .html file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('error', 'HTML file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setHtmlContent(text);
      if (!templateName || templateName === 'Imported Email Template') {
        setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
      }
      addToast('success', `File "${file.name}" loaded successfully`);
    };
    reader.readAsText(file);
  };

  const handlePreviewSanitize = async () => {
    if (!htmlContent.trim()) {
      addToast('error', 'Please enter or upload HTML content first');
      return;
    }

    setLoading(true);
    try {
      const res = await api.previewEmail({ html: htmlContent });
      if (res.success && res.data) {
        setSanitizedPreview(res.data.html);
        addToast('info', 'HTML sanitized & prepared for preview');
      } else {
        addToast('error', res.message || 'Failed to process HTML');
      }
    } catch (err: any) {
      addToast('error', 'Failed to preview HTML');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e?: React.FormEvent, customHtml?: string) => {
    if (e) e.preventDefault();
    const finalHtml = customHtml || htmlContent;
    if (!finalHtml.trim()) {
      addToast('error', 'HTML content cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await api.importHtml({
        html: finalHtml,
        name: templateName || 'Imported HTML Template',
      });

      if (res.success && res.data) {
        addToast('success', 'Email template imported successfully!');
        const createdId = res.data.template?.id;
        setTimeout(() => {
          if (createdId) {
            navigate(`/editor?templateId=${createdId}`);
          } else {
            navigate('/templates');
          }
        }, 1200);
      } else {
        addToast('error', res.message || 'Import failed');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to import template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title={mode === 'visual' ? 'Visual Email Builder' : 'Import Raw HTML Template'} noScroll={true}>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="space-y-4 max-w-full w-full mx-auto flex-1 min-h-0 flex flex-col">
        {/* Top Header Card */}
        <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {mode === 'visual' ? (
                <>
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Visual Email Builder</span>
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5 text-blue-600" />
                  <span>Import &amp; Edit Raw HTML</span>
                </>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === 'visual'
                ? 'Create responsive HTML emails with visual drag-and-drop elements and live theme customization.'
                : 'Import custom HTML files or paste raw HTML code into Monaco editor with live sanitization preview.'}
            </p>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-3">


            {mode === 'raw' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviewSanitize}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-semibold border border-sky-200 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sanitize & Preview</span>
                </button>
                <button
                  onClick={() => handleProceedToSend()}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Proceed to Send</span>
                </button>
                <button
                  onClick={(e) => handleImport(e)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Importing...' : 'Save & Import'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body depending on Mode */}
        {mode === 'visual' ? (
          <div className="flex-1 min-h-0 border border-sky-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
            <EmailBuilder
              templateName={templateName}
              initialHtml={htmlContent}
              onSave={async (doc, html) => {
                await handleImport(undefined, html);
              }}
              onProceedToSend={(html) => handleProceedToSend(html)}
              onSwitchToHtmlMode={(html) => {
                setHtmlContent(html);
                setMode('raw');
              }}
            />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
            <div className="space-y-4 flex flex-col min-h-0">
              {/* File dropzone */}
              <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-sm space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Option A: Upload .html File
                </label>
                <div className="border-2 border-dashed border-sky-300 hover:border-blue-500 rounded-2xl p-4 text-center transition-colors cursor-pointer bg-sky-50/50 hover:bg-sky-50 relative">
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-900">Click or drag .html file to upload</p>
                  <p className="text-[10px] text-slate-500">Maximum file size: 2MB</p>
                </div>
              </div>

              {/* Template Title Input */}
              <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-sm space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Imported Newsletter"
                  className="w-full px-4 py-2 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Code Editor Option B */}
              <div className="bg-white border border-sky-200/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-sky-50 border-b border-sky-200 text-xs font-semibold text-blue-950 flex justify-between items-center">
                  <span>Option B: Paste Raw HTML in Monaco Editor</span>
                  <button
                    onClick={() => {
                      setMode('visual');
                    }}
                    className="text-blue-700 hover:underline font-medium text-xs flex items-center gap-1"
                  >
                    <Layout className="w-3 h-3" /> Edit in Visual Builder
                  </button>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    theme="vs"
                    value={htmlContent}
                    onChange={(val) => setHtmlContent(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Sandboxed Preview */}
            <div className="h-full flex flex-col">
              <SandboxedPreview html={sanitizedPreview || htmlContent} className="h-full" loading={loading} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

