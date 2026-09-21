import React, { useState } from 'react';
import { X, Upload, Code, FileText, CheckCircle2, AlertCircle, Image } from 'lucide-react';
import { api } from '../../lib/api';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (type: 'success' | 'error', message: string) => void;
}

export const ImportTemplateModal: React.FC<ImportTemplateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  addToast,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Newsletter');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!name) {
      // Auto-populate name from file name
      setName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content || '');
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Thumbnail image file must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setThumbnailUrl(event.target?.result as string);
      addToast('success', 'Thumbnail image loaded from device!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('error', 'Please enter a template name');
      return;
    }

    if (!htmlContent.trim()) {
      addToast('error', 'Please provide HTML content for the template');
      return;
    }

    setLoading(true);
    try {
      const res = await api.importAdminTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || 'General',
        html: htmlContent,
        thumbnail_url: thumbnailUrl.trim() || undefined,
      });

      if (res.success) {
        addToast('success', 'Template imported successfully into database!');
        onSuccess();
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setHtmlContent('');
        setThumbnailUrl('');
        setFileName('');
      } else {
        addToast('error', res.message || 'Failed to import template');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error importing template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Import New System Template</h2>
              <p className="text-xs text-slate-400">Save a new HTML template to the Supabase database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Template Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Autumn Sale Promo"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Newsletter">Newsletter</option>
                <option value="Promotional">Promotional</option>
                <option value="Transactional">Transactional</option>
                <option value="Welcome">Welcome Email</option>
                <option value="Event">Event Invitation</option>
                <option value="Product">Product Launch</option>
                <option value="Custom">Custom / General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of template purpose"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Thumbnail Section (Upload from Device or URL) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Template Thumbnail Image (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={thumbnailUrl.startsWith('data:') ? 'Image uploaded from device' : thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Paste Image URL (https://...) OR upload from device"
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <label className="cursor-pointer px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5 shrink-0">
                  <Image className="w-4 h-4 text-indigo-400" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {thumbnailUrl && (
                <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-2 rounded-xl w-fit">
                  <div className="w-24 h-14 rounded-lg overflow-hidden relative bg-slate-900 border border-slate-800">
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="pr-2">
                    <span className="text-xs font-medium text-emerald-400 block">Thumbnail Preview Loaded</span>
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('')}
                      className="text-[11px] text-rose-400 hover:underline mt-0.5"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Import Mode Switch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-300">HTML Source Code</label>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setImportMode('paste')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    importMode === 'paste'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1" /> Paste HTML
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('file')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    importMode === 'file'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1" /> Upload File
                </button>
              </div>
            </div>

            {importMode === 'file' ? (
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-colors bg-slate-950/50">
                <input
                  type="file"
                  accept=".html,.txt,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="template-file-input"
                />
                <label htmlFor="template-file-input" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-white">
                    {fileName ? fileName : 'Click to select .html or .txt file'}
                  </div>
                  <p className="text-xs text-slate-400">Standard HTML email layout format</p>
                </label>
              </div>
            ) : null}

            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={8}
              placeholder="<!DOCTYPE html><html><body><h1>Hello {{name}}</h1>...</body></html>"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-2"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Importing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Database</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
