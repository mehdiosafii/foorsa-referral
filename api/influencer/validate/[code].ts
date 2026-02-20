import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) { pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 }); }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { code } = req.query;
    const p = getPool();
    const result = await p.query(
      'SELECT id, first_name, last_name, profile_image_url, referral_code FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (result.rows.length === 0) return res.status(404).json({ valid: false });
    return res.status(200).json({ valid: true, user: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
