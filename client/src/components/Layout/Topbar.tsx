import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const navigate = useNavigate();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api.checkHealth()
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  return (
    <header className="h-16 border-b border-blue-100 bg-white backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Server Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-500">
          {serverOnline === null ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          ) : serverOnline ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 font-medium">Backend Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-rose-500 font-medium">Server Offline</span>
            </>
          )}
        </div>

        {/* Send Email Quick Action */}
        <button
          onClick={() => navigate('/send')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>New Campaign</span>
        </button>
      </div>
    </header>
  );
};
