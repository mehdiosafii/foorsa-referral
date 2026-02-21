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
    deletedAt: row.deleted_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.headers['x-admin-password'] as string) || '';
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT * FROM ref_offers WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      return res.status(200).json(transformOffer(result.rows[0]));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fields = [
        { key: 'title', dbKey: 'title' },
        { key: 'titleAr', dbKey: 'title_ar' },
        { key: 'titleFr', dbKey: 'title_fr' },
        { key: 'description', dbKey: 'description' },
        { key: 'descriptionAr', dbKey: 'description_ar' },
        { key: 'descriptionFr', dbKey: 'description_fr' },
        { key: 'imageUrl', dbKey: 'image_url' },
        { key: 'price', dbKey: 'price' },
        { key: 'category', dbKey: 'category' },
        { key: 'isActive', dbKey: 'is_active' },
        { key: 'sortOrder', dbKey: 'sort_order' },
      ];

      for (const field of fields) {
        if (req.body[field.key] !== undefined) {
          updates.push(`${field.dbKey} = $${paramIndex}`);
          values.push(req.body[field.key]);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE ref_offers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      return res.status(200).json(transformOffer(result.rows[0]));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Soft delete
      await pool.query(
        'UPDATE ref_offers SET deleted_at = NOW() WHERE id = $1',
        [id]
      );
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
