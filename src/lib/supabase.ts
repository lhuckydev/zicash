import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('ZiCash: Supabase credentials missing. Check environment variables.');
  }
}

// Ensure URL is clean and starts with https
const formattedUrl = supabaseUrl?.startsWith('http') 
  ? supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
  : `https://${supabaseUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')}`;

export const supabase = createClient(formattedUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
