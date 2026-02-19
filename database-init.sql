-- Foorsa Referral Engine Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Ambassadors table
CREATE TABLE IF NOT EXISTS ref_ambassadors (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
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

-- Leads table
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

-- Clicks tracking table
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

-- Tracking links table
CREATE TABLE IF NOT EXISTS ref_tracking_links (
  id SERIAL PRIMARY KEY,
  ambassador_id INTEGER REFERENCES ref_ambassadors(id),
  url TEXT NOT NULL,
  label TEXT,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ref_ambassadors_code ON ref_ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_ref_ambassadors_email ON ref_ambassadors(email);
CREATE INDEX IF NOT EXISTS idx_ref_leads_ambassador ON ref_leads(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ref_clicks_ambassador ON ref_clicks(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ref_clicks_code ON ref_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_ref_leads_created ON ref_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ref_clicks_created ON ref_clicks(created_at DESC);

-- Helper function to increment ambassador points (optional)
CREATE OR REPLACE FUNCTION increment_ambassador_points(ambassador_id INTEGER, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE ref_ambassadors 
  SET points = points + points_to_add 
  WHERE id = ambassador_id;
END;
$$ LANGUAGE plpgsql;

-- Sample data (optional - comment out if not needed)
-- INSERT INTO ref_ambassadors (first_name, last_name, email, phone, referral_code, password_hash, points)
-- VALUES 
--   ('Ahmed', 'Benali', 'ahmed@test.com', '+212600000001', 'AHMBEF001', '$2a$10$hash', 50),
--   ('Fatima', 'Zahra', 'fatima@test.com', '+212600000002', 'FATZED002', '$2a$10$hash', 75);
