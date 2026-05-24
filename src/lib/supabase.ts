import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('ZiCash: Critical initialization failure. Supabase credentials missing.');
  }
}

// Production-ready URL sanitation
const sanitizeUrl = (url: string | undefined) => {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
};

const formattedUrl = sanitizeUrl(supabaseUrl);

export const supabase = createClient(formattedUrl, supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'zicash-auth-token',
  },
  db: {
    schema: 'public',
  },
});