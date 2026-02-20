import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';



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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { referralCode, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message } = req.body;
    if (!referralCode || !fullName || !whatsappNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const pool = getPool();
    const userResult = await pool.query('SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL', [referralCode]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Invalid referral code' });
    
    const result = await pool.query(
      `INSERT INTO ref_leads (user_id, full_name, email, phone, whatsapp_number, age, preferred_program, preferred_city, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new') RETURNING *`,
      [userResult.rows[0].id, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message]
    );
    return res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
