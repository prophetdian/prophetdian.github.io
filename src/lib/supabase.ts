import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rqlucgdeuvpkkrbnvjex.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fLoSYy-c_Q76RxL3nlfb4A_2hcweUta';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
