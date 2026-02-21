import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaRef2026!';
let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  return pool;
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || '';
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query;
  const db = getPool();

  if (req.method === 'PATCH') {
    try {
      const { name, platform, code, is_active } = req.body;
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
      if (platform !== undefined) { fields.push(`platform = $${idx++}`); values.push(platform); }
      if (code !== undefined) { fields.push(`code = $${idx++}`); values.push(code); }
      if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
      if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
      values.push(id);
      const result = await db.query(
        `UPDATE ref_tracking_links SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.status(200).json(result.rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM ref_tracking_links WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
