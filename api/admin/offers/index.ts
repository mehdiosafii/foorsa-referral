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
      user_id VARCHAR NOT NULL,
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
    location: row.location,
    deadline: row.deadline,
    stories: row.stories,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || '';
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const pool = getPool();
  await ensureTables(pool);

  // Auto-archive offers whose deadline has passed
  try {
    await pool.query(
      `UPDATE ref_offers 
       SET is_active = false, updated_at = NOW() 
       WHERE is_active = true 
         AND deleted_at IS NULL 
         AND deadline IS NOT NULL 
         AND deadline != ''
         AND deadline::date < CURRENT_DATE`
    );
  } catch (_) { /* deadline column may not exist yet */ }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT * FROM ref_offers 
        WHERE deleted_at IS NULL 
        ORDER BY sort_order ASC, created_at DESC
      `);
      const offers = result.rows.map(transformOffer);
      return res.status(200).json(offers);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        title, titleAr, titleFr, 
        description, descriptionAr, descriptionFr, 
        imageUrl, price, category, isActive, sortOrder 
      } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const result = await pool.query(
        `INSERT INTO ref_offers 
        (title, title_ar, title_fr, description, description_ar, description_fr, 
         image_url, price, category, is_active, sort_order) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [title, titleAr || null, titleFr || null, description || null, 
         descriptionAr || null, descriptionFr || null, imageUrl || null, 
         price || null, category || null, isActive !== false, sortOrder || 0]
      );
      
      return res.status(201).json(transformOffer(result.rows[0]));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
