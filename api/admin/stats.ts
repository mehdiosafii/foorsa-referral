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
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ref_users WHERE deleted_at IS NULL) as total_ambassadors,
        (SELECT COUNT(*) FROM ref_clicks) as total_clicks,
        (SELECT COUNT(*) FROM ref_leads WHERE deleted_at IS NULL) as total_leads,
        (SELECT COUNT(*) FROM ref_conversions) as total_conversions,
        (SELECT COUNT(*) FROM ref_tracking_links) as total_tracking_links,
        (SELECT COUNT(*) FROM ref_tracking_clicks) as total_tracking_clicks,
        (SELECT COUNT(*) FROM ref_tracking_leads) as total_tracking_leads
    `);

    const stats = result.rows[0];
    return res.status(200).json({
      totalAmbassadors: parseInt(stats.total_ambassadors),
      totalUsers: parseInt(stats.total_ambassadors),
      totalClicks: parseInt(stats.total_clicks),
      totalLeads: parseInt(stats.total_leads),
      totalConversions: parseInt(stats.total_conversions),
      totalTrackingLinks: parseInt(stats.total_tracking_links),
      totalTrackingClicks: parseInt(stats.total_tracking_clicks),
      totalTrackingLeads: parseInt(stats.total_tracking_leads),
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}
