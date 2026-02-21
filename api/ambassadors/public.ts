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

    const ambassadors = result.rows.map((r: any) => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      profileImageUrl: r.profile_image_url,
      referralCode: r.referral_code,
      instagramUrl: r.instagram_url,
      youtubeUrl: r.youtube_url,
      tiktokUrl: r.tiktok_url,
      instagramFollowers: r.instagram_followers,
      youtubeFollowers: r.youtube_followers,
      tiktokFollowers: r.tiktok_followers,
    }));
    return res.status(200).json(ambassadors);
  } catch (error: any) {
    console.error('Get ambassadors error:', error);
    return res.status(500).json({ error: error.message });
  }
}
