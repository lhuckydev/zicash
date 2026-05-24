
import { createClient } from '@supabase/supabase-js';

// Clean the Supabase URL to ensure it doesn't have the REST suffix or trailing slashes
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.warn('ZiCash: Supabase credentials are missing or using placeholders. Inventory sync will fail.');
}

// Ensure the URL starts with https://
const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

export const supabase = createClient(formattedUrl, supabaseAnonKey);
