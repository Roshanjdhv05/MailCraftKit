import React, { useState } from 'react';
import { Monitor, Smartphone, RefreshCw } from 'lucide-react';

interface SandboxedPreviewProps {
  html: string;
  className?: string;
  loading?: boolean;
}

export const SandboxedPreview: React.FC<SandboxedPreviewProps> = ({ html, className = '', loading = false }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className={`flex flex-col h-full bg-white border border-sky-200/80 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {/* Viewport Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-sky-50/80 border-b border-sky-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-950 uppercase tracking-wider text-[10px]">Live Email Viewport</span>
          {loading && (
            <span className="flex items-center gap-1 text-blue-600">
              <RefreshCw className="w-3 h-3 animate-spin" /> Rendering...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-sky-100/70 p-1 rounded-lg border border-sky-200/80">
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              device === 'desktop'
                ? 'bg-blue-700 text-white font-medium shadow-sm'
                : 'text-blue-950 hover:bg-sky-200/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (600px)</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              device === 'mobile'
                ? 'bg-blue-700 text-white font-medium shadow-sm'
                : 'text-blue-950 hover:bg-sky-200/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (375px)</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-sky-50/30 p-4 overflow-auto flex justify-center items-start">
        <div
          className={`transition-all duration-300 bg-white rounded-lg overflow-hidden shadow-lg ${
            device === 'desktop' ? 'w-[600px] min-h-[500px]' : 'w-[375px] min-h-[600px] border-8 border-sky-300/80 rounded-[32px]'
          }`}
        >
          <iframe
            title="Email Preview"
            srcDoc={html || '<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#94a3b8;margin:0;">No email content</body></html>'}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            className="w-full h-full min-h-[550px] border-0"
          />
        </div>
      </div>
    </div>
  );
};
