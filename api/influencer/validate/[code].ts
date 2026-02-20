import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { code } = req.query;
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, first_name, last_name, profile_image_url, referral_code FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (result.rows.length === 0) return res.status(404).json({ valid: false });
    return res.status(200).json({ valid: true, user: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
