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
    });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const p = getPool();
    const result = await p.query('SELECT * FROM ref_users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashed && user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      profileImageUrl: user.profile_image_url,
      referralCode: user.referral_code,
      isAdmin: user.is_admin,
      instagramUrl: user.instagram_url,
      youtubeUrl: user.youtube_url,
      tiktokUrl: user.tiktok_url,
      instagramFollowers: user.instagram_followers,
      youtubeFollowers: user.youtube_followers,
      tiktokFollowers: user.tiktok_followers,
      createdAt: user.created_at,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
