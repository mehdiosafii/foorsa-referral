import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) { pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 }); }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const p = getPool();

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      const result = await p.query('UPDATE ref_leads SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
      return res.status(200).json(result.rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await p.query('UPDATE ref_leads SET deleted_at = NOW() WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
