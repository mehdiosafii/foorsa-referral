import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const pool = getPool();
    const days = parseInt(req.query.days as string) || 30;
    
    const clicksResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM ref_clicks
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at) ORDER BY date
    `, [userId]);
    
    const leadsResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM ref_leads
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days' AND deleted_at IS NULL
      GROUP BY DATE(created_at) ORDER BY date
    `, [userId]);
    
    return res.status(200).json({ clicks: clicksResult.rows, leads: leadsResult.rows });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
