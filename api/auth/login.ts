import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

import crypto from 'crypto';


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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM ref_users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare SHA-256 hashed password
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashed && user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...u } = user;
    // Transform snake_case to camelCase for frontend
    const camelUser = {
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      role: u.role,
      referralCode: u.referral_code,
      profileImageUrl: u.profile_image_url,
      instagramUrl: u.instagram_url,
      youtubeUrl: u.youtube_url,
      tiktokUrl: u.tiktok_url,
      instagramFollowers: u.instagram_followers,
      youtubeFollowers: u.youtube_followers,
      tiktokFollowers: u.tiktok_followers,
      createdAt: u.created_at,
    };
    return res.status(200).json({ success: true, user: camelUser });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
