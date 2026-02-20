import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        l.*,
        u.first_name,
        u.last_name,
        u.email as ambassador_email,
        u.referral_code
      FROM ref_leads l
      LEFT JOIN ref_users u ON l.user_id = u.id
      WHERE l.deleted_at IS NULL
      ORDER BY l.created_at DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Get all leads error:', error);
    return res.status(500).json({ error: error.message });
  }
}
