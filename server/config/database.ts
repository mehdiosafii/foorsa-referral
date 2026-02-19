import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://cetxjzzoswrcykhcxwai.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// DB init: tables must be created via Supabase SQL Editor (see database-init.sql).
// The app uses the Supabase REST client, which doesn't support DDL.
// Self-healing: route handlers catch "relation does not exist" and return empty arrays.
let dbChecked = false;

export async function initializeDatabase(): Promise<void> {
  if (dbChecked) return;
  try {
    // Just verify connectivity by querying one table
    const { error } = await supabase.from('ref_ambassadors').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      console.warn('ref_ambassadors table not found — run database-init.sql in Supabase SQL Editor');
    }
    dbChecked = true;
  } catch (err) {
    console.error('DB check error:', err);
    dbChecked = true;
  }
}
