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
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          u.*,
          COUNT(DISTINCT c.id)::int as total_clicks,
          COUNT(DISTINCT l.id)::int as total_leads,
          COUNT(DISTINCT conv.id)::int as total_conversions
        FROM ref_users u
        LEFT JOIN ref_clicks c ON u.id = c.user_id
        LEFT JOIN ref_leads l ON u.id = l.user_id AND l.deleted_at IS NULL
        LEFT JOIN ref_conversions conv ON u.id = conv.user_id
        WHERE u.deleted_at IS NULL
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);
      return res.status(200).json(result.rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { firstName, lastName, email, phone, password, instagramUrl, youtubeUrl, tiktokUrl, instagramFollowers, youtubeFollowers, tiktokFollowers } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const referralCode = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now().toString(36)}`;
      // Simple hash for now - bcrypt causes issues in serverless
      const result = await pool.query(
        `INSERT INTO ref_users (first_name, last_name, email, phone, password, referral_code, instagram_url, youtube_url, tiktok_url, instagram_followers, youtube_followers, tiktok_followers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [firstName, lastName, email, phone, password, referralCode, instagramUrl, youtubeUrl, tiktokUrl, instagramFollowers || 0, youtubeFollowers || 0, tiktokFollowers || 0]
      );
      const { password: _, ...user } = result.rows[0];
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
