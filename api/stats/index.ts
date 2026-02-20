import type { VercelRequest, VercelResponse } from '@vercel/node';

import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    const stats = const pool = getPool(); const result = await pool.query<any>(`
      SELECT 
        (SELECT COUNT(*) FROM ref_clicks WHERE user_id = $1) as total_clicks,
        (SELECT COUNT(*) FROM ref_leads WHERE user_id = $1) as total_leads,
        (SELECT COUNT(*) FROM ref_conversions WHERE user_id = $1) as total_conversions
    `, [userId]);

    const conversionRate = stats.total_leads > 0 
      ? (stats.total_conversions / stats.total_leads) * 100 
      : 0;

    return res.status(200).json({
      totalClicks: parseInt(stats.total_clicks),
      totalLeads: parseInt(stats.total_leads),
      totalConversions: parseInt(stats.total_conversions),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}
