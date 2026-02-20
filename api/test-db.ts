import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test creating Pool inline
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
    
    const result = await pool.query('SELECT COUNT(*) FROM ref_users WHERE deleted_at IS NULL');
    await pool.end();
    
    return res.status(200).json({ 
      status: 'ok',
      userCount: result.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ 
      status: 'error',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
}
