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
    const leaderboard = const pool = getPool(); const result = await pool.query(`
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT c.id) as total_clicks,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT conv.id) as total_conversions,
        ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT l.id) DESC, COUNT(DISTINCT c.id) DESC) as rank
      FROM ref_users u
      LEFT JOIN ref_clicks c ON u.id = c.user_id
      LEFT JOIN ref_leads l ON u.id = l.user_id AND l.deleted_at IS NULL
      LEFT JOIN ref_conversions conv ON u.id = conv.user_id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, u.first_name, u.last_name, u.profile_image_url
      ORDER BY total_leads DESC, total_clicks DESC
      LIMIT 50
    `);

    return res.status(200).json(result.rows.length > 0 ? result.rows[0] : result.rows);
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ error: error.message });
  }
}
