import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseServiceKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseServiceKey.includes('placeholder')
  );
};

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
