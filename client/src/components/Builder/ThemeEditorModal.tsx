import React from 'react';
import { Palette, X, Check } from 'lucide-react';
import { ThemeConfig } from '../../types/builder';

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  onUpdateTheme: (newTheme: ThemeConfig) => void;
}

export const PRESET_THEMES: Array<{ name: string; theme: ThemeConfig }> = [
  {
    name: 'Modern Blue',
    theme: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      heading: '#111827',
      text: '#374151',
      background: '#F8FAFC',
      contentBackground: '#FFFFFF',
      button: '#2563EB',
      buttonText: '#FFFFFF',
      border: '#E2E8F0',
      mutedText: '#64748B',
    },
  },
  {
    name: 'Royal Purple',
    theme: {
      primary: '#7C3AED',
      secondary: '#EC4899',
      heading: '#1E1B4B',
      text: '#334155',
      background: '#FAF5FF',
      contentBackground: '#FFFFFF',
      button: '#7C3AED',
      buttonText: '#FFFFFF',
      border: '#F3E8FF',
      mutedText: '#6B7280',
    },
  },
  {
    name: 'Corporate Dark',
    theme: {
      primary: '#06B6D4',
      secondary: '#3B82F6',
      heading: '#F8FAFC',
      text: '#CBD5E1',
      background: '#0F172A',
      contentBackground: '#1E293B',
      button: '#06B6D4',
      buttonText: '#FFFFFF',
      border: '#334155',
      mutedText: '#64748B',
    },
  },
  {
    name: 'Minimal Mono',
    theme: {
      primary: '#18181B',
      secondary: '#3F3F46',
      heading: '#09090B',
      text: '#27272A',
      background: '#FAFAFA',
      contentBackground: '#FFFFFF',
      button: '#18181B',
      buttonText: '#FFFFFF',
      border: '#E4E4E7',
      mutedText: '#71717A',
    },
  },
  {
    name: 'Emerald Green',
    theme: {
      primary: '#059669',
      secondary: '#10B981',
      heading: '#064E3B',
      text: '#1F2937',
      background: '#F0FDF4',
      contentBackground: '#FFFFFF',
      button: '#059669',
      buttonText: '#FFFFFF',
      border: '#DCFCE7',
      mutedText: '#65A30D',
    },
  },
  {
    name: 'Warm Sunset',
    theme: {
      primary: '#EA580C',
      secondary: '#D97706',
      heading: '#451A03',
      text: '#292524',
      background: '#FFFBEB',
      contentBackground: '#FFFFFF',
      button: '#EA580C',
      buttonText: '#FFFFFF',
      border: '#FEF3C7',
      mutedText: '#78350F',
    },
  },
];

export const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
}) => {
  if (!isOpen) return null;

  const handleColorChange = (key: keyof ThemeConfig, val: string) => {
    onUpdateTheme({ ...theme, [key]: val });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-sky-200/80 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Global Color Theme Engine</h3>
              <p className="text-xs text-slate-500">Select preset themes or customize color tokens</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-sky-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Preset Color Themes</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_THEMES.map((p) => {
              const isSelected = p.theme.primary === theme.primary && p.theme.background === theme.background;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onUpdateTheme(p.theme)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-sky-50 ring-2 ring-blue-100'
                      : 'border-sky-200 bg-white hover:border-blue-400 hover:bg-sky-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: p.theme.primary }} />
                    <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: p.theme.secondary }} />
                    <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: p.theme.heading }} />
                    <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: p.theme.background }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Tokens */}
        <div className="space-y-3 pt-3 border-t border-sky-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Custom Color Tokens</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[
              { key: 'primary', label: 'Primary Accent' },
              { key: 'secondary', label: 'Secondary Accent' },
              { key: 'heading', label: 'Heading Text' },
              { key: 'text', label: 'Body Text' },
              { key: 'background', label: 'Outer Background' },
              { key: 'contentBackground', label: 'Card Content Background' },
              { key: 'button', label: 'Button Fill' },
              { key: 'buttonText', label: 'Button Text Color' },
              { key: 'border', label: 'Border Lines' },
            ].map((item) => (
              <div key={item.key} className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">{item.label}</span>
                <input
                  type="color"
                  value={(theme as any)[item.key] || '#000000'}
                  onChange={(e) => handleColorChange(item.key as keyof ThemeConfig, e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md"
          >
            Done &amp; Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
