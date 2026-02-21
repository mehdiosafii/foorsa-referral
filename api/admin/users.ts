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

function getDateFilter(period: string, alias: string): string {
  switch (period) {
    case 'month': return `AND ${alias}.created_at >= date_trunc('month', NOW())`;
    case 'lastMonth': return `AND ${alias}.created_at >= date_trunc('month', NOW() - INTERVAL '1 month') AND ${alias}.created_at < date_trunc('month', NOW())`;
    case 'week': return `AND ${alias}.created_at >= date_trunc('week', NOW())`;
    case '7d': return `AND ${alias}.created_at >= NOW() - INTERVAL '7 days'`;
    case '30d': return `AND ${alias}.created_at >= NOW() - INTERVAL '30 days'`;
    default: return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || ''; if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const period = (req.query.period as string) || 'all';
      const cdf = getDateFilter(period, 'c');
      const ldf = getDateFilter(period, 'l');
      const convdf = getDateFilter(period, 'conv');

      const result = await pool.query(`
        SELECT 
          u.*,
          (SELECT COUNT(*)::int FROM ref_clicks c WHERE c.user_id = u.id ${cdf}) as total_clicks,
          (SELECT COUNT(*)::int FROM ref_leads l WHERE l.user_id = u.id AND l.deleted_at IS NULL ${ldf}) as total_leads,
          (SELECT COUNT(*)::int FROM ref_conversions conv WHERE conv.user_id = u.id ${convdf}) as total_conversions
        FROM ref_users u
        WHERE u.deleted_at IS NULL
        ORDER BY u.created_at DESC
      `);
      const users = result.rows.map((r: any) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        profileImageUrl: r.profile_image_url,
        referralCode: r.referral_code,
        isAdmin: r.is_admin,
        instagramUrl: r.instagram_url,
        youtubeUrl: r.youtube_url,
        tiktokUrl: r.tiktok_url,
        instagramFollowers: r.instagram_followers,
        youtubeFollowers: r.youtube_followers,
        tiktokFollowers: r.tiktok_followers,
        createdAt: r.created_at,
        stats: {
          clicks: r.total_clicks || 0,
          leads: r.total_leads || 0,
          conversions: r.total_conversions || 0,
        },
      }));
      return res.status(200).json(users);
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
