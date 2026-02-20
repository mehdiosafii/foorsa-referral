import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ref_clicks WHERE user_id = $1)::int as total_clicks,
        (SELECT COUNT(*) FROM ref_leads WHERE user_id = $1)::int as total_leads,
        (SELECT COUNT(*) FROM ref_conversions WHERE user_id = $1)::int as total_conversions
    `, [userId]);

    const stats = result.rows[0];
    const conversionRate = stats.total_leads > 0 ? (stats.total_conversions / stats.total_leads) * 100 : 0;

    return res.status(200).json({
      totalClicks: stats.total_clicks,
      totalLeads: stats.total_leads,
      totalConversions: stats.total_conversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
