import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';



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
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          tl.*,
          COUNT(DISTINCT tc.id)::int as total_clicks,
          COUNT(DISTINCT tld.id)::int as total_leads
        FROM ref_tracking_links tl
        LEFT JOIN ref_tracking_clicks tc ON tl.id = tc.tracking_link_id
        LEFT JOIN ref_tracking_leads tld ON tl.id = tld.tracking_link_id
        GROUP BY tl.id
        ORDER BY tl.created_at DESC
      `);
      return res.status(200).json(result.rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, platform, code } = req.body;
      if (!name || !platform || !code) return res.status(400).json({ error: 'Missing fields' });
      const result = await pool.query(
        'INSERT INTO ref_tracking_links (name, platform, code) VALUES ($1, $2, $3) RETURNING *',
        [name, platform, code]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
