import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

const supabaseUrl = process.env.SUPABASE_URL || 'https://rqlucgdeuvpkkrbnvjex.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('Supabase Service Role Key is missing. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
