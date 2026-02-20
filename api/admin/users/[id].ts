import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const pool = getPool();

  if (req.method === 'PATCH') {
    try {
      const fields = req.body;
      const sets: string[] = [];
      const vals: any[] = [];
      let i = 1;
      for (const [key, value] of Object.entries(fields)) {
        const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        sets.push(`${col} = $${i}`);
        vals.push(value);
        i++;
      }
      if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });
      sets.push(`updated_at = NOW()`);
      vals.push(id);
      const result = await pool.query(`UPDATE ref_users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const { password: _, ...user } = result.rows[0];
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await pool.query('UPDATE ref_users SET deleted_at = NOW() WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
