import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { EmailEditor } from './pages/EmailEditor';
import { ImportHtml } from './pages/ImportHtml';
import { SendEmail } from './pages/SendEmail';
import { EmailHistory } from './pages/EmailHistory';
import { Settings } from './pages/Settings';
import { BulkEmail } from './pages/BulkEmail';
import { AdminPortal } from './pages/AdminPortal';
import { LandingPage } from './pages/LandingPage';
import { isSupabaseConfigured } from './lib/supabase';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-medium">
        Loading MailCraftKit Session...
      </div>
    );
  }

  if (isSupabaseConfigured && !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EmailEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/builder"
            element={
              <ProtectedRoute>
                <ImportHtml initialMode="visual" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/import"
            element={
              <ProtectedRoute>
                <ImportHtml initialMode="raw" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/send"
            element={
              <ProtectedRoute>
                <SendEmail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <EmailHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bulk"
            element={
              <ProtectedRoute>
                <BulkEmail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
