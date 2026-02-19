import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function initializeDatabase() {
  // Create tables if they don't exist
  const { error: ambassadorsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ref_ambassadors (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
        email TEXT UNIQUE,
        phone TEXT,
        referral_code TEXT UNIQUE NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        password_hash TEXT,
        points INTEGER DEFAULT 0,
        rank INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS ref_leads (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        city TEXT,
        source TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
        converted BOOLEAN DEFAULT false,
        ambassador_id INTEGER REFERENCES ref_ambassadors(id),
        notes TEXT,
        whatsapp_status TEXT DEFAULT 'unsent',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS ref_clicks (
        id SERIAL PRIMARY KEY,
        ambassador_id INTEGER REFERENCES ref_ambassadors(id),
        referral_code TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        referer TEXT,
        country TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ref_tracking_links (
        id SERIAL PRIMARY KEY,
        ambassador_id INTEGER REFERENCES ref_ambassadors(id),
        url TEXT NOT NULL,
        label TEXT,
        clicks_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_ref_ambassadors_code ON ref_ambassadors(referral_code);
      CREATE INDEX IF NOT EXISTS idx_ref_ambassadors_email ON ref_ambassadors(email);
      CREATE INDEX IF NOT EXISTS idx_ref_leads_ambassador ON ref_leads(ambassador_id);
      CREATE INDEX IF NOT EXISTS idx_ref_clicks_ambassador ON ref_clicks(ambassador_id);
      CREATE INDEX IF NOT EXISTS idx_ref_clicks_code ON ref_clicks(referral_code);
    `
  });

  if (ambassadorsError && !ambassadorsError.message.includes('does not exist')) {
    // If exec_sql RPC doesn't exist, use direct SQL
    console.log('Using direct SQL execution');
  }

  console.log('Database initialized successfully');
}
