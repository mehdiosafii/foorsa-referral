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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || '';
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const db = getPool();
    const days = parseInt(req.query.days as string) || 90;

    // Get all dates with clicks or leads, merged into single rows
    const result = await db.query(`
      SELECT d.date,
        COALESCE(c.count, 0)::int as clicks,
        COALESCE(l.count, 0)::int as leads
      FROM (
        SELECT DATE(created_at) as date FROM ref_clicks WHERE created_at >= NOW() - INTERVAL '${days} days'
        UNION
        SELECT DATE(created_at) as date FROM ref_leads WHERE created_at >= NOW() - INTERVAL '${days} days' AND deleted_at IS NULL
      ) d
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*)::int as count FROM ref_clicks
        WHERE created_at >= NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at)
      ) c ON c.date = d.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*)::int as count FROM ref_leads
        WHERE created_at >= NOW() - INTERVAL '${days} days' AND deleted_at IS NULL GROUP BY DATE(created_at)
      ) l ON l.date = d.date
      ORDER BY d.date
    `);

    return res.status(200).json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
