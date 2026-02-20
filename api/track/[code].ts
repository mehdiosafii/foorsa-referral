import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './_helpers';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid code' });
  }

  const pool = getPool();

  if (req.method === 'POST') {
    try {
      const { ipAddress, userAgent, referrer, geo, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message } = req.body;

      // Check ambassador code
      const userResult = await pool.query('SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL', [code]);
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // If lead data present, submit lead
        if (fullName && whatsappNumber) {
          const leadResult = await pool.query(
            `INSERT INTO ref_leads (user_id, full_name, email, phone, whatsapp_number, age, preferred_program, preferred_city, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new') RETURNING id`,
            [userId, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message]
          );
          return res.status(201).json({ success: true, leadId: leadResult.rows[0].id });
        }
        
        // Otherwise track click
        await pool.query(
          `INSERT INTO ref_clicks (user_id, ip_address, user_agent, referrer, country, country_code, city, region, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [userId, ipAddress, userAgent, referrer, geo?.country, geo?.countryCode, geo?.city, geo?.region, geo?.latitude, geo?.longitude]
        );
        return res.status(200).json({ success: true });
      }

      // Check tracking link code
      const trackResult = await pool.query('SELECT id FROM ref_tracking_links WHERE code = $1 AND is_active = true', [code]);
      
      if (trackResult.rows.length > 0) {
        const linkId = trackResult.rows[0].id;
        
        if (fullName && whatsappNumber) {
          const leadResult = await pool.query(
            `INSERT INTO ref_tracking_leads (tracking_link_id, full_name, email, whatsapp_number, age, preferred_program, preferred_city, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new') RETURNING id`,
            [linkId, fullName, email, whatsappNumber, age, preferredProgram, preferredCity, message]
          );
          return res.status(201).json({ success: true, leadId: leadResult.rows[0].id });
        }
        
        await pool.query(
          `INSERT INTO ref_tracking_clicks (tracking_link_id, ip_address, user_agent, referrer, country, country_code, city)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [linkId, ipAddress, userAgent, referrer, geo?.country, geo?.countryCode, geo?.city]
        );
        return res.status(200).json({ success: true });
      }

      return res.status(404).json({ error: 'Code not found' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      // Validate code exists (ambassador or tracking link)
      const userResult = await pool.query('SELECT id, first_name, last_name, profile_image_url, referral_code FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL', [code]);
      if (userResult.rows.length > 0) {
        return res.status(200).json({ type: 'ambassador', data: userResult.rows[0] });
      }
      const trackResult = await pool.query('SELECT id, name, platform, code FROM ref_tracking_links WHERE code = $1 AND is_active = true', [code]);
      if (trackResult.rows.length > 0) {
        return res.status(200).json({ type: 'tracking_link', data: trackResult.rows[0] });
      }
      return res.status(404).json({ error: 'Code not found' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
