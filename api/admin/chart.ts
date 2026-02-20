import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const pool = getPool();
    const days = parseInt(req.query.days as string) || 30;
    
    const clicksResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM ref_clicks
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    const leadsResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM ref_leads
      WHERE created_at >= NOW() - INTERVAL '${days} days' AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    return res.status(200).json({
      clicks: clicksResult.rows,
      leads: leadsResult.rows,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
