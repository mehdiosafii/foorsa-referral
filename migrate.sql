-- Foorsa Referral Engine - Database Migration
-- Creates all tables with ref_ prefix to avoid conflicts with Foorsa Reward

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS ref_respondio_webhook_log CASCADE;
DROP TABLE IF EXISTS ref_respondio_contacts CASCADE;
DROP TABLE IF EXISTS ref_lead_exports CASCADE;
DROP TABLE IF EXISTS ref_whatsapp_messages CASCADE;
DROP TABLE IF EXISTS ref_whatsapp_sequence_assignments CASCADE;
DROP TABLE IF EXISTS ref_whatsapp_sequence_steps CASCADE;
DROP TABLE IF EXISTS ref_whatsapp_sequences CASCADE;
DROP TABLE IF EXISTS ref_webhooks CASCADE;
DROP TABLE IF EXISTS ref_api_keys CASCADE;
DROP TABLE IF EXISTS ref_tracking_leads CASCADE;
DROP TABLE IF EXISTS ref_tracking_clicks CASCADE;
DROP TABLE IF EXISTS ref_tracking_links CASCADE;
DROP TABLE IF EXISTS ref_conversions CASCADE;
DROP TABLE IF EXISTS ref_leads CASCADE;
DROP TABLE IF EXISTS ref_clicks CASCADE;
DROP TABLE IF EXISTS ref_users CASCADE;

-- Users table - referral ambassadors
CREATE TABLE ref_users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  password VARCHAR,
  profile_image_url VARCHAR,
  referral_code VARCHAR UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  instagram_url VARCHAR,
  youtube_url VARCHAR,
  tiktok_url VARCHAR,
  instagram_followers INTEGER DEFAULT 0,
  youtube_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX ref_users_referral_code_idx ON ref_users(referral_code);
CREATE INDEX ref_users_email_idx ON ref_users(email);

-- Click tracking for ambassadors
CREATE TABLE ref_clicks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id VARCHAR NOT NULL REFERENCES ref_users(id),
  ip_address VARCHAR,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR,
  country_code VARCHAR,
  city VARCHAR,
  region VARCHAR,
  latitude VARCHAR,
  longitude VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_clicks_user_id_idx ON ref_clicks(user_id);
CREATE INDEX ref_clicks_created_at_idx ON ref_clicks(created_at);

-- Leads - form submissions from ambassadors
CREATE TABLE ref_leads (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id VARCHAR NOT NULL REFERENCES ref_users(id),
  full_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  whatsapp_number VARCHAR NOT NULL,
  age INTEGER,
  preferred_program VARCHAR,
  preferred_city VARCHAR,
  message TEXT,
  status VARCHAR DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX ref_leads_user_id_idx ON ref_leads(user_id);
CREATE INDEX ref_leads_status_idx ON ref_leads(status);
CREATE INDEX ref_leads_created_at_idx ON ref_leads(created_at);

-- Conversions - successful sales
CREATE TABLE ref_conversions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id VARCHAR NOT NULL REFERENCES ref_users(id),
  lead_id VARCHAR REFERENCES ref_leads(id),
  amount INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_conversions_user_id_idx ON ref_conversions(user_id);
CREATE INDEX ref_conversions_lead_id_idx ON ref_conversions(lead_id);

-- Admin tracking links for different platforms
CREATE TABLE ref_tracking_links (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_tracking_links_code_idx ON ref_tracking_links(code);
CREATE INDEX ref_tracking_links_platform_idx ON ref_tracking_links(platform);

-- Clicks on admin tracking links
CREATE TABLE ref_tracking_clicks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tracking_link_id VARCHAR NOT NULL REFERENCES ref_tracking_links(id),
  ip_address VARCHAR,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR,
  country_code VARCHAR,
  city VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_tracking_clicks_link_id_idx ON ref_tracking_clicks(tracking_link_id);
CREATE INDEX ref_tracking_clicks_created_at_idx ON ref_tracking_clicks(created_at);

-- Leads from tracking links
CREATE TABLE ref_tracking_leads (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tracking_link_id VARCHAR NOT NULL REFERENCES ref_tracking_links(id),
  full_name VARCHAR NOT NULL,
  email VARCHAR,
  whatsapp_number VARCHAR NOT NULL,
  age INTEGER,
  preferred_program VARCHAR,
  preferred_city VARCHAR,
  message TEXT,
  status VARCHAR DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_tracking_leads_link_id_idx ON ref_tracking_leads(tracking_link_id);
CREATE INDEX ref_tracking_leads_status_idx ON ref_tracking_leads(status);

-- API Keys for external integrations
CREATE TABLE ref_api_keys (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name VARCHAR NOT NULL,
  key VARCHAR UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  permissions TEXT[] DEFAULT ARRAY['leads:read'],
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_api_keys_key_idx ON ref_api_keys(key);

-- Webhook configurations
CREATE TABLE ref_webhooks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  events TEXT[] DEFAULT ARRAY['lead.created'],
  secret_key VARCHAR,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp sequences for automated follow-ups
CREATE TABLE ref_whatsapp_sequences (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name VARCHAR NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  auto_assign BOOLEAN DEFAULT FALSE,
  target_lead_status VARCHAR,
  target_source VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sequence steps
CREATE TABLE ref_whatsapp_sequence_steps (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sequence_id VARCHAR NOT NULL REFERENCES ref_whatsapp_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  message_template TEXT NOT NULL,
  stop_on_reply BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_sequence_steps_sequence_idx ON ref_whatsapp_sequence_steps(sequence_id);
CREATE INDEX ref_sequence_steps_order_idx ON ref_whatsapp_sequence_steps(sequence_id, step_order);

-- Sequence assignments to leads
CREATE TABLE ref_whatsapp_sequence_assignments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  lead_id VARCHAR NOT NULL REFERENCES ref_leads(id),
  sequence_id VARCHAR NOT NULL REFERENCES ref_whatsapp_sequences(id),
  current_step_order INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'active',
  auto_assigned BOOLEAN DEFAULT FALSE,
  next_send_at TIMESTAMP,
  last_sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_sequence_assignments_lead_idx ON ref_whatsapp_sequence_assignments(lead_id);
CREATE INDEX ref_sequence_assignments_sequence_idx ON ref_whatsapp_sequence_assignments(sequence_id);
CREATE INDEX ref_sequence_assignments_status_next_idx ON ref_whatsapp_sequence_assignments(status, next_send_at);

-- WhatsApp message queue
CREATE TABLE ref_whatsapp_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  lead_id VARCHAR REFERENCES ref_leads(id),
  phone VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  source VARCHAR,
  source_info VARCHAR,
  triggered_by VARCHAR,
  sequence_id VARCHAR REFERENCES ref_whatsapp_sequences(id),
  sequence_step_id VARCHAR REFERENCES ref_whatsapp_sequence_steps(id),
  status VARCHAR DEFAULT 'pending',
  respondio_contact_id INTEGER,
  respondio_message_id VARCHAR,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_whatsapp_messages_status_idx ON ref_whatsapp_messages(status);
CREATE INDEX ref_whatsapp_messages_next_retry_idx ON ref_whatsapp_messages(next_retry_at);
CREATE INDEX ref_whatsapp_messages_sequence_idx ON ref_whatsapp_messages(sequence_id);

-- Lead export tracking
CREATE TABLE ref_lead_exports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  lead_id VARCHAR NOT NULL REFERENCES ref_leads(id),
  exported_to VARCHAR NOT NULL,
  exported_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'success',
  response TEXT
);

CREATE INDEX ref_lead_exports_lead_id_idx ON ref_lead_exports(lead_id);

-- Respond.io contacts
CREATE TABLE ref_respondio_contacts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  respondio_id VARCHAR UNIQUE NOT NULL,
  phone_e164 VARCHAR,
  phone_raw VARCHAR,
  name VARCHAR,
  email VARCHAR,
  respondio_lifecycle VARCHAR,
  foorsa_stage VARCHAR,
  ambassador_id VARCHAR REFERENCES ref_users(id),
  ambassador_code VARCHAR,
  source VARCHAR,
  campaign VARCHAR,
  tags TEXT[],
  is_orphan_lead BOOLEAN DEFAULT FALSE,
  sync_status VARCHAR DEFAULT 'pending',
  sync_direction VARCHAR,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_respondio_contacts_respondio_id_idx ON ref_respondio_contacts(respondio_id);
CREATE INDEX ref_respondio_contacts_phone_idx ON ref_respondio_contacts(phone_e164);
CREATE INDEX ref_respondio_contacts_ambassador_idx ON ref_respondio_contacts(ambassador_id);

-- Respond.io webhook log
CREATE TABLE ref_respondio_webhook_log (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_id VARCHAR,
  event_type VARCHAR NOT NULL,
  payload JSONB,
  respondio_contact_id VARCHAR,
  status VARCHAR DEFAULT 'pending',
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ref_respondio_webhook_log_event_id_idx ON ref_respondio_webhook_log(event_id);
CREATE INDEX ref_respondio_webhook_log_status_idx ON ref_respondio_webhook_log(status);

-- Create default admin user
-- Email: admin@foorsa.ma
-- Password: FoorsaRef2026!
-- Hashed with bcrypt (10 rounds): $2b$10$YourHashedPasswordHere
-- Note: You'll need to update this with the actual bcrypt hash

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
