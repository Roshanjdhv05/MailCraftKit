import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Mail,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Database,
  Building,
  Key,
  Layers,
  ArrowUpRight,
  Lock,
  LogOut,
  ShieldAlert,
  BarChart3,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { ImportTemplateModal } from '../components/Admin/ImportTemplateModal';
import { UserDetailsModal } from '../components/Admin/UserDetailsModal';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const AdminPortal: React.FC = () => {
  const navigate = useNavigate();

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('designmailer_admin_auth') === 'true';
  });
  const [adminUsernameInput, setAdminUsernameInput] = useState('designmailer');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Portal tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'templates' | 'logs'>('overview');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State data
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, templatesRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTemplates(),
        api.getAdminLogs(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (templatesRes.success) setTemplates(templatesRes.data || []);
      if (logsRes.success) setLogs(logsRes.data || []);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAllData();
    }
  }, [isAdminAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (adminUsernameInput.trim() === 'designmailer' && adminPasswordInput.trim() === '1234567') {
      sessionStorage.setItem('designmailer_admin_auth', 'true');
      setIsAdminAuthenticated(true);
      addToast('success', 'Admin access granted!');
    } else {
      setLoginError('Invalid admin username or password. (Hint: designmailer / 1234567)');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('designmailer_admin_auth');
    setIsAdminAuthenticated(false);
    setAdminPasswordInput('');
    addToast('success', 'Admin session locked.');
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}" from database?`)) return;

    try {
      const res = await api.deleteAdminTemplate(id);
      if (res.success) {
        addToast('success', 'Template deleted successfully');
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        addToast('error', res.message || 'Failed to delete template');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error deleting template');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // IF NOT AUTHENTICATED: Show Admin Authentication Gate (Standalone Page)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Lock Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Admin System Access</h2>
            <p className="text-xs text-slate-400">
              Separate administrative portal for MailCraftKit system management.
            </p>
          </div>

          {/* Credentials Hint Card */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-4 text-xs space-y-1">
            <div className="font-semibold text-indigo-300 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Credentials:</span>
            </div>
            <div className="text-slate-300 font-mono pt-1">
              Username: <strong className="text-indigo-200">designmailer</strong>
            </div>
            <div className="text-slate-300 font-mono">
              Password: <strong className="text-indigo-200">1234567</strong>
            </div>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3.5 text-xs text-rose-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Username</label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="designmailer"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter password (1234567)"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login to Admin Console</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Normal User App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DEDICATED ADMIN STANDALONE PORTAL (NO NORMAL USER SIDEBAR)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/90 border-rose-800 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* DEDICATED ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Admin Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">Admin Console</h1>
              <p className="text-[11px] text-emerald-400 font-medium">MailCraftKit System</p>
            </div>
          </div>

          {/* Admin Specific Navigation Items ONLY */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Management Views
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Users Directory</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'templates'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Templates & Import</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {templates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'logs'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email Activity Logs</span>
            </button>
          </nav>
        </div>

        {/* Admin Footer Controls */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Exit Admin</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>User App Panel</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-white">
              {activeTab === 'overview' && 'Overview System Metrics'}
              {activeTab === 'users' && 'Registered Users Directory'}
              {activeTab === 'templates' && 'System Templates & Import'}
              {activeTab === 'logs' && 'Global Email Activity Logs'}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-3 h-3 mr-1" /> Database Connected
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Template</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.totalUsers ?? users.length ?? 0}</div>
                  <p className="text-xs text-slate-400">Registered account profiles</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Emails Mailed</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.totalEmails ?? 0}</div>
                  <p className="text-xs text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                    {stats?.sentEmails ?? 0} successfully delivered
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Success Delivery Rate</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {stats?.totalEmails ? Math.round(((stats?.sentEmails || 0) / stats.totalEmails) * 100) : 100}%
                  </div>
                  <p className="text-xs text-slate-400">Based on system log metrics</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Templates In DB</span>
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.totalTemplates ?? templates.length ?? 0}</div>
                  <p className="text-xs text-slate-400">Available system layouts</p>
                </div>
              </div>

              {/* Recent System Activity Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-indigo-400" />
                    <span>Recent System Email Activity</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                  >
                    <span>View all activity logs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {(stats?.recentLogs || logs.slice(0, 5)).map((log: any, idx: number) => (
                        <tr key={log.id || idx} className="hover:bg-slate-850/50">
                          <td className="py-3 px-4 text-white font-medium">{log.recipient}</td>
                          <td className="py-3 px-4 text-slate-300">{log.subject}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.status === 'sent'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-500 text-sm">
                            No email activity recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search name, email, username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Showing <span className="text-white font-semibold">{filteredUsers.length}</span> registered users
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                        <th className="py-3.5 px-4">User Details</th>
                        <th className="py-3.5 px-4">Username</th>
                        <th className="py-3.5 px-4">Company</th>
                        <th className="py-3.5 px-4">Emails Sent</th>
                        <th className="py-3.5 px-4">Password</th>
                        <th className="py-3.5 px-4">Registered</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold border border-indigo-500/20">
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{user.full_name || 'MailCraftKit User'}</div>
                                <div className="text-xs text-slate-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{user.username || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-slate-300">{user.company_name || 'N/A'}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {user.sent_count ?? 0} sent
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                              <Key className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Encrypted</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-xs">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium rounded-lg transition-colors inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500">
                            No user profiles found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATES & IMPORT */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Database System Templates</h3>
                  <p className="text-xs text-slate-400">Email design templates stored in the Supabase database</p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import HTML Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
                  >
                    {/* Thumbnail / Header */}
                    <div className="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
                      {tmpl.thumbnail_url ? (
                        <img
                          src={tmpl.thumbnail_url}
                          alt={tmpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center space-y-2">
                          <FileText className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
                          <span className="text-xs font-mono text-slate-500 block">HTML Template</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                          {tmpl.is_system_template ? 'System' : 'Custom'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {tmpl.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {tmpl.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                        <span className="text-slate-500">
                          Category: <strong className="text-slate-300 font-medium">{tmpl.category || 'General'}</strong>
                        </span>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id, tmpl.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete template from DB"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                    <h4 className="text-base font-medium text-white">No Templates Found</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Import your first HTML email layout into the database using the Import Template button.
                    </p>
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-500 inline-flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Import Template Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                        <th className="py-3.5 px-4">Recipient</th>
                        <th className="py-3.5 px-4">Subject</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Sender Profile</th>
                        <th className="py-3.5 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {logs.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-850/50">
                          <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">{log.recipient}</td>
                          <td className="py-3.5 px-4 text-slate-200 font-medium">{log.subject}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.status === 'sent'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {log.status}
                            </span>
                            {log.error_message && (
                              <span className="block text-[11px] text-rose-400 mt-1 max-w-xs truncate">
                                {log.error_message}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {log.profiles?.email || log.user_id || 'System'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-500">
                            No email activity logs recorded in the database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportTemplateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchAllData}
        addToast={addToast}
      />

      <UserDetailsModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};
