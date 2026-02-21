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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const db = getPool();
  // Delete items trashed more than 30 days ago
  const users = await db.query("DELETE FROM ref_users WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'");
  const leads = await db.query("DELETE FROM ref_leads WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days'");
  return res.status(200).json({ deletedUsers: users.rowCount, deletedLeads: leads.rowCount });
}
