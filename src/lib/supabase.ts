/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
);

// Graceful client initialization
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;
