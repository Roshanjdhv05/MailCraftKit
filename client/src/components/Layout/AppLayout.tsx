import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
  noScroll?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ title, children, noScroll }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        <Topbar title={title} />
        <main className={`flex-1 min-h-0 bg-slate-50 ${noScroll ? 'flex flex-col p-4 overflow-hidden' : 'overflow-y-auto p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
