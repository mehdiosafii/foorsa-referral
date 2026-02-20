import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { query, queryOne } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET all users
  if (req.method === 'GET') {
    try {
      const users = await query(`
        SELECT 
          u.*,
          COUNT(DISTINCT c.id) as total_clicks,
          COUNT(DISTINCT l.id) as total_leads,
          COUNT(DISTINCT conv.id) as total_conversions
        FROM ref_users u
        LEFT JOIN ref_clicks c ON u.id = c.user_id
        LEFT JOIN ref_leads l ON u.id = l.user_id AND l.deleted_at IS NULL
        LEFT JOIN ref_conversions conv ON u.id = conv.user_id
        WHERE u.deleted_at IS NULL
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);

      return res.status(200).json(users);
    } catch (error: any) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // POST create new ambassador
  if (req.method === 'POST') {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        password,
        instagramUrl,
        youtubeUrl,
        tiktokUrl,
        instagramFollowers,
        youtubeFollowers,
        tiktokFollowers
      } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate referral code from name
      const referralCode = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now().toString(36)}`;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO ref_users 
        (first_name, last_name, email, phone, password, referral_code, instagram_url, youtube_url, tiktok_url, instagram_followers, youtube_followers, tiktok_followers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [firstName, lastName, email, phone, hashedPassword, referralCode, instagramUrl, youtubeUrl, tiktokUrl, instagramFollowers || 0, youtubeFollowers || 0, tiktokFollowers || 0]
      );

      const { password: _, ...userWithoutPassword } = result[0];
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error('Create user error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
