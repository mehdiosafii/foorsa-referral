import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../../db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { code } = req.query;
    const pool = getPool();
    const result = await pool.query('SELECT * FROM ref_tracking_links WHERE code = $1 AND is_active = true', [code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tracking link not found' });
    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
