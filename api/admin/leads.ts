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

function getDateFilter(period: string, alias: string): string {
  switch (period) {
    case 'month': return `AND ${alias}.created_at >= date_trunc('month', NOW())`;
    case 'lastMonth': return `AND ${alias}.created_at >= date_trunc('month', NOW() - INTERVAL '1 month') AND ${alias}.created_at < date_trunc('month', NOW())`;
    case 'week': return `AND ${alias}.created_at >= date_trunc('week', NOW())`;
    case '7d': return `AND ${alias}.created_at >= NOW() - INTERVAL '7 days'`;
    case '30d': return `AND ${alias}.created_at >= NOW() - INTERVAL '30 days'`;
    default: return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || ''; if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const period = (req.query.period as string) || 'all';
    const df = getDateFilter(period, 'l');

    const result = await pool.query(`
      SELECT 
        l.*,
        u.first_name,
        u.last_name,
        u.email as ambassador_email,
        u.referral_code
      FROM ref_leads l
      LEFT JOIN ref_users u ON l.user_id = u.id
      WHERE l.deleted_at IS NULL ${df}
      ORDER BY l.created_at DESC
    `);

    const leads = result.rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      whatsappNumber: r.whatsapp_number,
      age: r.age,
      preferredProgram: r.preferred_program,
      preferredCity: r.preferred_city,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
      deletedAt: r.deleted_at,
      userName: r.first_name ? `${r.first_name} ${r.last_name || ''}`.trim() : '',
      ambassadorEmail: r.ambassador_email,
      referralCode: r.referral_code,
    }));
    return res.status(200).json(leads);
  } catch (error: any) {
    console.error('Get all leads error:', error);
    return res.status(500).json({ error: error.message });
  }
}
