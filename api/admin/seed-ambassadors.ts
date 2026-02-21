import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import crypto from 'crypto';
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
  const ambassadors = [
    { first: 'Houda', last: 'HOUDA', email: 'houda@foorsa.ma', code: 'HOUDA', pw: 'Houda@2025!' },
    { first: 'Zahraa', last: 'ZAHRA', email: 'zahraa@foorsa.ma', code: 'ZAHRA', pw: 'Zahraa@2025!' },
    { first: 'Hadil', last: 'HADIL', email: 'hadil@foorsa.ma', code: 'HADIL', pw: 'Hadil@2025!' },
    { first: 'Hamza', last: 'HAMZA', email: 'hamza@foorsa.ma', code: 'HAMZA', pw: 'Hamza@2025!' },
    { first: 'Rita', last: 'RITAA', email: 'rita@foorsa.ma', code: 'RITAA', pw: 'Rita@2025!' },
    { first: 'Soulaiman', last: 'SOULA', email: 'soulaiman@foorsa.ma', code: 'SOULA', pw: 'Soula@2025!' },
  ];
  let created = 0;
  for (const a of ambassadors) {
    const hash = crypto.createHash('sha256').update(a.pw).digest('hex');
    const result = await db.query(
      `INSERT INTO ref_users (first_name, last_name, email, referral_code, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4, $5, 'ambassador', $6)
       ON CONFLICT (email) DO NOTHING`,
      [a.first, a.last, a.email, a.code, hash, `${a.first} ${a.last}`]
    );
    if (result.rowCount && result.rowCount > 0) created++;
  }
  return res.status(200).json({ message: `Created ${created} new ambassadors (${ambassadors.length - created} already existed)` });
}
