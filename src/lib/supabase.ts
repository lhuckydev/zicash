
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Production-ready URL sanitation
const sanitizeUrl = (url: string | undefined) => {
  if (!url) return 'https://placeholder-project.supabase.co'; // Fallback to prevent crash during eval
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
};

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('ZiCash Warning: Supabase credentials missing. Check your .env file.');
  }
}

const formattedUrl = sanitizeUrl(supabaseUrl);

export const supabase = createClient(
  formattedUrl, 
  supabaseAnonKey || 'anonymous-key-placeholder', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'zicash-auth-token',
    },
    db: {
      schema: 'public',
    },
  }
);
