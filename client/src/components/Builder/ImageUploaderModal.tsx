import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface ImageUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (src: string, source: 'upload' | 'url', alt?: string) => void;
  initialAlt?: string;
  initialUrl?: string;
}

export const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  initialAlt = '',
  initialUrl = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [altText, setAltText] = useState(initialAlt);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewSrc, setPreviewSrc] = useState(initialUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    setUploading(true);
    setProgress(30);

    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 15 : p));
    }, 200);

    try {
      const res = await api.uploadAsset(file);
      clearInterval(interval);
      setProgress(100);

      if (res.success && res.data) {
        setPreviewSrc(res.data.url);
        onSelectImage(res.data.url, 'upload', altText || file.name);
        onClose();
      } else {
        setErrorMsg(res.message || 'Image upload failed');
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setErrorMsg('Please enter an image URL');
      return;
    }
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      setErrorMsg('Image URL must start with http:// or https://');
      return;
    }

    onSelectImage(imageUrl.trim(), 'url', altText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-sky-200/80 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add or Replace Image</h3>
              <p className="text-xs text-slate-500">Upload from computer or use an external URL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-sky-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-xl border border-sky-200">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from Device</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>External Image URL</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-sky-50/50 hover:bg-sky-50 transition-colors cursor-pointer relative"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <div className="space-y-3 py-4">
                  <Loader2 className="w-10 h-10 text-blue-600 mx-auto animate-spin" />
                  <p className="text-sm font-semibold text-slate-900">Uploading to Supabase Storage...</p>
                  <div className="w-full bg-sky-200 h-2 rounded-full max-w-xs mx-auto overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center mx-auto text-blue-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Click or drag image file here</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, GIF up to 5MB</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Alt Text (Accessibility)</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Description of the image..."
                className="w-full px-3.5 py-2 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        )}

        {/* Tab 2: URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewSrc(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Alt Text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Description of the image..."
                className="w-full px-3.5 py-2 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {previewSrc && (
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                <p className="text-[11px] font-semibold text-slate-600 uppercase">Live Image Preview:</p>
                <div className="h-32 rounded-lg bg-white overflow-hidden border border-sky-200 flex items-center justify-center">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setErrorMsg('Unable to load image. Please check the URL.')}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-sky-100 text-blue-950 text-xs font-semibold hover:bg-sky-200 border border-sky-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
              >
                Insert Image URL
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
