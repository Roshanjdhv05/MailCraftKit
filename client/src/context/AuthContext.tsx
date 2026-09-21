import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userName?: string, companyName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedUserJson = localStorage.getItem('designmailer_user_data');
    if (savedUserJson) {
      try {
        const parsedUser = JSON.parse(savedUserJson);
        setUser(parsedUser);
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem('designmailer_user_data');
      }
    }

    if (!isSupabaseConfigured) {
      // Mock dev user when Supabase credentials are not connected directly on client
      const mockUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'developer@designmailer.local',
        app_metadata: {},
        user_metadata: { full_name: 'Developer Mode', username: 'dev_user', company_name: 'MailCraftKit Inc' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Get current active session from Supabase Client
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userName?: string, companyName?: string) => {
    try {
      const res = await api.signUp({ email, password, fullName, username: userName, companyName });
      if (!res.success) {
        return { error: new Error(res.message || 'Signup failed') };
      }

      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('designmailer_user_data', JSON.stringify(res.data.user));
      }
      if (res.data?.session?.access_token) {
        setSession(res.data.session);
        localStorage.setItem('designmailer_auth_token', res.data.session.access_token);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.signIn({ email, password });
      if (!res.success) {
        return { error: new Error(res.message || 'Login failed') };
      }

      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('designmailer_user_data', JSON.stringify(res.data.user));
      }
      if (res.data?.session?.access_token) {
        setSession(res.data.session);
        localStorage.setItem('designmailer_auth_token', res.data.session.access_token);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('designmailer_auth_token');
    localStorage.removeItem('designmailer_user_data');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
