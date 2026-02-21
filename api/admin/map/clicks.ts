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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // Return empty array — no geolocation data collected currently
    return res.status(200).json([]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
