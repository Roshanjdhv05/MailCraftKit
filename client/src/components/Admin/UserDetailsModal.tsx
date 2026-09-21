import React from 'react';
import { X, User, Mail, Building, Key, Server, Calendar, Send, ShieldCheck } from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-lg border border-indigo-500/20">
              {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{user.full_name || 'User Profile'}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Total Mails</span>
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-base">
                <Send className="w-4 h-4" />
                <span>{user.sent_count ?? 0}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Password</span>
              <span className="inline-flex items-center space-x-1 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Role</span>
              <span className="text-xs text-slate-300 font-medium">Standard User</span>
            </div>
          </div>

          {/* Account Profile Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Identity & Profile</span>
            </h3>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">User ID (UUID)</span>
                  <span className="font-mono text-xs text-slate-300 break-all">{user.id}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Username</span>
                  <span className="text-slate-200">{user.username || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Full Name</span>
                  <span className="text-slate-200">{user.full_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Company Name</span>
                  <span className="text-slate-200">{user.company_name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMTP Configuration Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Custom SMTP Details</span>
            </h3>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">SMTP Host</span>
                  <span className="font-mono text-xs text-indigo-300">{user.smtp_host || 'Default (smtp.gmail.com)'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">SMTP Port</span>
                  <span className="font-mono text-xs text-slate-300">{user.smtp_port || 587}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Sender Email</span>
                  <span className="text-slate-200">{user.smtp_from_email || user.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Sender Name</span>
                  <span className="text-slate-200">{user.smtp_from_name || 'MailCraftKit Sender'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created: {new Date(user.created_at).toLocaleString()}</span>
            </span>
            <span>Last Updated: {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
