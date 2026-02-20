import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const pool = getPool();
    const result = await pool.query('SELECT * FROM ref_users WHERE id = $1 AND deleted_at IS NULL', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...user } = result.rows[0];
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
