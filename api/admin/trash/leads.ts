import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaRef2026!';

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || '';
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const db = getPool();
    const result = await db.query(`
      SELECT l.id, l.full_name as "fullName", l.email, l.deleted_at as "deletedAt",
        COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as "userName"
      FROM ref_leads l
      LEFT JOIN ref_users u ON u.id = l.user_id
      WHERE l.deleted_at IS NOT NULL
      ORDER BY l.deleted_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
