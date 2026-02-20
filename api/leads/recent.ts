import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT l.*, u.first_name, u.last_name, u.referral_code
      FROM ref_leads l
      LEFT JOIN ref_users u ON l.user_id = u.id
      WHERE l.deleted_at IS NULL
      ORDER BY l.created_at DESC
      LIMIT 20
    `);
    return res.status(200).json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
