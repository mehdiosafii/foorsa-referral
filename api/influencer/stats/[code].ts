import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { code } = req.query;
    const pool = getPool();
    const userResult = await pool.query('SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL', [code]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const userId = userResult.rows[0].id;
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ref_clicks WHERE user_id = $1)::int as total_clicks,
        (SELECT COUNT(*) FROM ref_leads WHERE user_id = $1 AND deleted_at IS NULL)::int as total_leads,
        (SELECT COUNT(*) FROM ref_conversions WHERE user_id = $1)::int as total_conversions
    `, [userId]);
    
    const stats = result.rows[0];
    return res.status(200).json({
      totalClicks: stats.total_clicks,
      totalLeads: stats.total_leads,
      totalConversions: stats.total_conversions,
      conversionRate: stats.total_leads > 0 ? parseFloat(((stats.total_conversions / stats.total_leads) * 100).toFixed(2)) : 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
