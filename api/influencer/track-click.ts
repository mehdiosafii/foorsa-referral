import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../lib/db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { referralCode, ipAddress, userAgent, referrer } = req.body;
    if (!referralCode) return res.status(400).json({ error: 'Referral code required' });
    
    const pool = getPool();
    const userResult = await pool.query('SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL', [referralCode]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Invalid referral code' });
    
    await pool.query(
      'INSERT INTO ref_clicks (user_id, ip_address, user_agent, referrer) VALUES ($1, $2, $3, $4)',
      [userResult.rows[0].id, ipAddress || req.headers['x-forwarded-for'] || '', userAgent || req.headers['user-agent'] || '', referrer || req.headers['referer'] || '']
    );
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
