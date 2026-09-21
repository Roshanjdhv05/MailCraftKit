import React, { useEffect, useState } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  X,
  Server,
  Mail,
  Clock,
} from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ToastContainer, ToastMessage } from '../components/Common/Toast';
import { api } from '../lib/api';
import { EmailLog } from '../types';

export const EmailHistory: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, message }]);
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getEmailHistory();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      addToast('error', 'Failed to load email delivery logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.recipient.toLowerCase().includes(search.toLowerCase()) ||
      l.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="My Emails Delivery History">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((i) => i.id !== id))} />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Search Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient or subject..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Logs Recorded: <span className="text-slate-900 font-bold">{logs.length}</span>
          </div>
        </div>

        {/* Delivery Logs Table */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading delivery logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Email Logs Recorded</h3>
              <p className="text-xs text-slate-400">Send an email campaign to view delivery status records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-50 border-b border-blue-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 font-mono text-xs">
                        {log.recipient}
                      </td>
                      <td className="px-6 py-4 text-slate-700 group-hover:text-blue-600 transition-colors">
                        {log.subject}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {log.templates?.name || 'Custom / Raw HTML'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            log.status === 'sent'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-rose-50 border-rose-200 text-rose-500'
                          }`}
                        >
                          {log.status === 'sent' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-blue-100 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Email Delivery Log Details</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-1">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      selectedLog.status === 'sent' ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {selectedLog.status === 'sent' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {selectedLog.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-1">Provider</span>
                  <span className="text-slate-700 font-mono flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-blue-500" /> {selectedLog.provider}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block font-semibold">Recipient</span>
                  <span className="text-slate-900 font-mono text-sm">{selectedLog.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Subject</span>
                  <span className="text-slate-800 font-medium">{selectedLog.subject}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Message ID</span>
                  <span className="text-slate-500 font-mono text-[11px] truncate block">
                    {selectedLog.message_id || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Sent Timestamp</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedLog.error_message && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 space-y-1">
                  <span className="font-semibold block text-rose-400">Error Log Detail:</span>
                  <p className="font-mono text-[11px] leading-relaxed">{selectedLog.error_message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
