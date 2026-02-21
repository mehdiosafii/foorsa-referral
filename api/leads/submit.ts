import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const RESPONDIO_TOKEN = process.env.RESPONDIO_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQ1Mywic3BhY2VJZCI6MjE3MTY3LCJvcmdJZCI6MjE2MTI2LCJ0eXBlIjoiYXBpIiwiaWF0IjoxNzIyMjI3Njc3fQ.zSqvUI1BAOH5eqJDYaZpBDMbV3pCnlJX6Sfob823SoM';
const RESPONDIO_BASE = 'https://api.respond.io/v2';
const CONVERSION_LIFECYCLES = ['Our Student', 'Our Student (March)', 'New Old applicant'];

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let phone = raw.replace(/[\s\-\(\)\.]/g, '');
  if (phone.startsWith('00')) phone = '+' + phone.substring(2);
  if (phone.startsWith('+')) {
    if (phone.startsWith('+2120') && phone.length > 13) phone = '+212' + phone.substring(5);
    return phone;
  }
  if (phone.startsWith('212')) {
    if (phone.startsWith('2120') && phone.length > 12) return '+212' + phone.substring(4);
    return '+' + phone;
  }
  if (phone.startsWith('0')) return '+212' + phone.substring(1);
  if (phone.length === 9 && /^[5-7]/.test(phone)) return '+212' + phone;
  return phone;
}

async function syncLeadWithRespondio(pool: Pool, leadId: string, userId: string, rawPhone: string): Promise<void> {
  try {
    const phone = normalizePhone(rawPhone);
    if (!phone || phone.length < 10) return;

    // Small delay to not block the response
    await new Promise(r => setTimeout(r, 100));

    const res = await fetch(`${RESPONDIO_BASE}/contact/phone:${encodeURIComponent(phone)}`, {
      headers: { 'Authorization': `Bearer ${RESPONDIO_TOKEN}`, 'Content-Type': 'application/json' },
    });

    if (res.status !== 200) return;

    const contact = await res.json();
    const lifecycle = contact?.lifecycle;
    if (!lifecycle || lifecycle === 'Unknown') return;

    // Update lead status with lifecycle
    await pool.query('UPDATE ref_leads SET status = $1 WHERE id = $2', [lifecycle, leadId]);

    // If conversion lifecycle, insert into ref_conversions
    if (CONVERSION_LIFECYCLES.includes(lifecycle)) {
      await pool.query(
        `INSERT INTO ref_conversions (id, user_id, lead_id, amount, notes, created_at)
         SELECT gen_random_uuid()::varchar, $1, $2, 0, $3, NOW()
         WHERE NOT EXISTS (SELECT 1 FROM ref_conversions WHERE lead_id = $2)`,
        [userId, leadId, 'Auto-converted: lifecycle = ' + lifecycle]
      );
    }
  } catch (_err) {
    // Don't fail lead submission if Respond.io is down
    console.error('Respond.io sync error:', _err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { referralCode, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message } = req.body;
    if (!fullName || !whatsappNumber) return res.status(400).json({ error: 'Full name and WhatsApp number required' });

    const pool = getPool();
    
    // Find ambassador by referral code
    const userResult = await pool.query('SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL', [referralCode]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Invalid referral code' });
    
    const userId = userResult.rows[0].id;
    const result = await pool.query(
      `INSERT INTO ref_leads (user_id, full_name, email, phone, whatsapp_number, age, preferred_program, preferred_city, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new') RETURNING *`,
      [userId, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message]
    );

    const lead = result.rows[0];

    // Fire-and-forget: sync with Respond.io (don't await to keep response fast)
    syncLeadWithRespondio(pool, lead.id, userId, whatsappNumber || phone).catch(() => {});

    return res.status(201).json({ success: true, lead });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
