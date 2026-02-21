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

  const { id } = req.query; // offer_id
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      // Get all ambassadors assigned to this offer
      const result = await pool.query(
        `SELECT 
          a.id,
          a.offer_id as "offerId",
          a.user_id as "userId",
          a.created_at as "createdAt",
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.email
        FROM ref_offer_assignments a
        JOIN ref_users u ON a.user_id = u.id
        WHERE a.offer_id = $1 AND u.deleted_at IS NULL
        ORDER BY a.created_at DESC`,
        [id]
      );
      return res.status(200).json(result.rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, userIds } = req.body;
      
      // Support both single userId and bulk userIds
      const idsToAssign = userIds || (userId ? [userId] : []);
      
      if (idsToAssign.length === 0) {
        return res.status(400).json({ error: 'userId or userIds required' });
      }

      const assignments = [];
      for (const uid of idsToAssign) {
        try {
          const result = await pool.query(
            `INSERT INTO ref_offer_assignments (offer_id, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (offer_id, user_id) DO NOTHING
             RETURNING *`,
            [id, uid]
          );
          if (result.rows.length > 0) {
            assignments.push({
              id: result.rows[0].id,
              offerId: result.rows[0].offer_id,
              userId: result.rows[0].user_id,
              createdAt: result.rows[0].created_at,
            });
          }
        } catch (err) {
          // Skip on error (e.g., user doesn't exist)
          console.error(`Failed to assign user ${uid}:`, err);
        }
      }

      return res.status(201).json({ 
        success: true, 
        assigned: assignments.length,
        assignments 
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      await pool.query(
        'DELETE FROM ref_offer_assignments WHERE offer_id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
