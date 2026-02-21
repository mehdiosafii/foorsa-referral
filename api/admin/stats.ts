import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaRef2026!';

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

function getDateFilter(period: string): string {
  switch (period) {
    case 'month': return `created_at >= date_trunc('month', NOW())`;
    case 'lastMonth': return `created_at >= date_trunc('month', NOW() - INTERVAL '1 month') AND created_at < date_trunc('month', NOW())`;
    case 'week': return `created_at >= date_trunc('week', NOW())`;
    case '7d': return `created_at >= NOW() - INTERVAL '7 days'`;
    case '30d': return `created_at >= NOW() - INTERVAL '30 days'`;
    default: return '1=1';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || ''; if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const period = (req.query.period as string) || 'all';
    const df = getDateFilter(period);

    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ref_users WHERE deleted_at IS NULL) as total_ambassadors,
        (SELECT COUNT(*) FROM ref_clicks WHERE ${df}) as total_clicks,
        (SELECT COUNT(*) FROM ref_leads WHERE deleted_at IS NULL AND ${df}) as total_leads,
        (SELECT COUNT(*) FROM ref_conversions WHERE ${df}) as total_conversions,
        (SELECT COUNT(*) FROM ref_tracking_links) as total_tracking_links,
        (SELECT COUNT(*) FROM ref_tracking_clicks WHERE ${df}) as total_tracking_clicks,
        (SELECT COUNT(*) FROM ref_tracking_leads WHERE ${df}) as total_tracking_leads
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
