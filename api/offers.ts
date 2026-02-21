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

async function ensureTables(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ref_offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      title_ar TEXT,
      title_fr TEXT,
      description TEXT,
      description_ar TEXT,
      description_fr TEXT,
      image_url TEXT,
      price TEXT,
      category TEXT,
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS ref_offer_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      offer_id UUID REFERENCES ref_offers(id) ON DELETE CASCADE,
      user_id UUID REFERENCES ref_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(offer_id, user_id)
    );
  `);
}

function transformOffer(row: any) {
  return {
    id: row.id,
    title: row.title,
    titleAr: row.title_ar,
    titleFr: row.title_fr,
    description: row.description,
    descriptionAr: row.description_ar,
    descriptionFr: row.description_fr,
    imageUrl: row.image_url,
    price: row.price,
    category: row.category,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = getPool();
  await ensureTables(pool);

  const { userId } = req.query;

  try {
    if (userId) {
      // Get offers assigned to this specific ambassador
      const result = await pool.query(
        `SELECT DISTINCT o.* 
         FROM ref_offers o
         INNER JOIN ref_offer_assignments a ON o.id = a.offer_id
         WHERE o.is_active = true 
           AND o.deleted_at IS NULL 
           AND a.user_id = $1
         ORDER BY o.sort_order ASC, o.created_at DESC`,
        [userId]
      );
      
      // If no specific assignments, return all active offers
      if (result.rows.length === 0) {
        const allResult = await pool.query(
          `SELECT * FROM ref_offers 
           WHERE is_active = true AND deleted_at IS NULL 
           ORDER BY sort_order ASC, created_at DESC`
        );
        return res.status(200).json(allResult.rows.map(transformOffer));
      }
      
      return res.status(200).json(result.rows.map(transformOffer));
    } else {
      // Public: return all active offers
      const result = await pool.query(
        `SELECT * FROM ref_offers 
         WHERE is_active = true AND deleted_at IS NULL 
         ORDER BY sort_order ASC, created_at DESC`
      );
      return res.status(200).json(result.rows.map(transformOffer));
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
