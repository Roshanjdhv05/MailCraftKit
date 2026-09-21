import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCode,
  Plus,
  Eye,
  Copy,
  Edit,
  Trash2,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { SandboxedPreview } from '../components/Email/SandboxedPreview';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { api } from '../lib/api';
import { Template } from '../types';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'system' | 'custom'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.getTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (err: any) {
      addToast('error', 'Failed to load template library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleUseTemplate = (tmpl: Template) => {
    navigate(`/editor?templateId=${tmpl.id}`);
  };

  const handleDuplicate = async (tmpl: Template) => {
    try {
      const res = await api.duplicateTemplate(tmpl.id);
      if (res.success && res.data) {
        addToast('success', `Created copy: ${res.data.name}`);
        loadTemplates();
      } else {
        addToast('error', res.message || 'Failed to duplicate template');
      }
    } catch (err) {
      addToast('error', 'Duplication error');
    }
  };

  const handleDelete = async (tmpl: Template) => {
    if (!window.confirm(`Are you sure you want to delete template "${tmpl.name}"?`)) return;

    try {
      const res = await api.deleteTemplate(tmpl.id);
      if (res.success) {
        addToast('success', 'Template deleted successfully');
        loadTemplates();
      } else {
        addToast('error', res.message || 'Failed to delete template');
      }
    } catch (err) {
      addToast('error', 'Deletion failed');
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'system') return matchesSearch && t.is_system_template;
    if (filter === 'custom') return matchesSearch && !t.is_system_template;
    return matchesSearch;
  });

  return (
    <AppLayout title="Email Template Library">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All ({templates.length})
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'system'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Built-in ({templates.filter((t) => t.is_system_template).length})
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'custom'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              My Templates ({templates.filter((t) => !t.is_system_template).length})
            </button>

            <button
              onClick={() => navigate('/import')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import HTML</span>
            </button>
          </div>
        </div>

        {/* Templates Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-blue-50 border border-blue-100 animate-pulse" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
            <FileCode className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Templates Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Try adjusting your search filter or import your custom email HTML.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-sky-200/80 overflow-hidden flex flex-col justify-between group transition-all duration-300 ease-out transform hover:-translate-y-2 hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-sky-500/15 hover:border-blue-400 cursor-pointer"
              >
                {/* Image / Banner Header */}
                <div className="relative h-44 bg-sky-50/50 overflow-hidden border-b border-sky-100">
                  {tmpl.thumbnail_url ? (
                    <img
                      src={tmpl.thumbnail_url}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-sky-50 via-blue-50 to-sky-100 text-blue-300">
                      <FileCode className="w-16 h-16 group-hover:scale-110 transition-transform duration-500 text-blue-400/60" />
                    </div>
                  )}

                  {/* Badge */}
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${
                      tmpl.is_system_template
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-sky-50 border-sky-200 text-blue-800'
                    }`}
                  >
                    {tmpl.is_system_template ? 'Built-in Template' : 'User Custom'}
                  </span>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2.5 backdrop-blur-sm">
                    <button
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-semibold text-xs flex items-center gap-1.5 border border-sky-200 shadow-md transform hover:scale-105 transition-all"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleUseTemplate(tmpl)}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transform hover:scale-105 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tmpl.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="pt-3 border-t border-sky-100 flex items-center justify-between">
                    <button
                      onClick={() => handleUseTemplate(tmpl)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold transition-all border border-sky-200 transform hover:scale-105 shadow-sm"
                    >
                      Use Template
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(tmpl)}
                        title="Duplicate Template"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-sky-100 rounded-lg transition-all transform hover:scale-110"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {!tmpl.is_system_template && (
                        <>
                          <button
                            onClick={() => navigate(`/editor?templateId=${tmpl.id}`)}
                            title="Edit Template"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-sky-100 rounded-lg transition-all transform hover:scale-110"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tmpl)}
                            title="Delete Template"
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all transform hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Full Screen Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-white border border-blue-100 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewTemplate.name}</h3>
                <p className="text-xs text-slate-400">{previewTemplate.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                    handleUseTemplate(previewTemplate);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div className="flex-1 p-4 overflow-hidden">
              <SandboxedPreview html={previewTemplate.html} className="h-full" />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
