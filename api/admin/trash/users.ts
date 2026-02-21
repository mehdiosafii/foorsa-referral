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
      SELECT id, first_name as "firstName", last_name as "lastName", email, deleted_at as "deletedAt"
      FROM ref_users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
