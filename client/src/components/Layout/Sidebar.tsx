import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCode,
  History,
  FileUp,
  Settings,
  LogOut,
  Send,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Visual Builder', path: '/builder', icon: Sparkles },
    { label: 'Import HTML', path: '/import', icon: FileUp },
    { label: 'Templates', path: '/templates', icon: FileCode },
    { label: 'My Emails', path: '/history', icon: History },
    { label: 'Bulk Campaign', path: '/bulk', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900/90 via-blue-950/85 to-indigo-950/90 backdrop-blur-xl border-r border-sky-300/20 shadow-xl flex flex-col justify-between shrink-0 select-none text-white">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3.5 border-b border-sky-200/15 bg-sky-950/20">
          <img src="/favicon.png" alt="Mailcraft Icon" className="h-14 sm:h-16 w-auto object-contain bg-transparent drop-shadow-md shrink-0" />
          <div>
            <h1 className="font-extrabold text-xl text-white tracking-tight">Mailcraft</h1>
            <p className="text-[11px] text-sky-200/80 font-medium">Email Platform</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ease-out transform hover:translate-x-1.5 active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold border border-sky-300/40 shadow-lg shadow-blue-600/30'
                      : 'text-sky-100/75 hover:text-white hover:bg-gradient-to-r hover:from-sky-500/20 hover:to-blue-600/20 hover:border hover:border-sky-300/30 hover:shadow-md hover:shadow-sky-500/10'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sky-200/15">
        <div className="flex items-center justify-between p-3 rounded-xl bg-sky-950/40 border border-sky-300/20 backdrop-blur-sm shadow-inner">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-white truncate">
              {user?.user_metadata?.full_name || 'MailCraftKit User'}
            </div>
            <div className="text-[11px] text-sky-200/70 truncate">{user?.email || 'user@local'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-sky-200 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
