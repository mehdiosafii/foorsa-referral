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
        id, 
        first_name, 
        last_name, 
        profile_image_url, 
        referral_code,
        instagram_url,
        youtube_url,
        tiktok_url,
        instagram_followers,
        youtube_followers,
        tiktok_followers
      FROM ref_users 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Get ambassadors error:', error);
    return res.status(500).json({ error: error.message });
  }
}
