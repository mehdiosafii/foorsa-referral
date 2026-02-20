import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid code' });
  }

  // Track click for ambassador or tracking link
  if (req.method === 'POST' && !req.url?.includes('/lead')) {
    try {
      const { ipAddress, userAgent, referrer, geo } = req.body;

      // Check if it's an ambassador code
      const user = await queryOne<any>(
        'SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL',
        [code]
      );

      if (user) {
        await query(
          `INSERT INTO ref_clicks (user_id, ip_address, user_agent, referrer, country, country_code, city, region, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [user.id, ipAddress, userAgent, referrer, geo?.country, geo?.countryCode, geo?.city, geo?.region, geo?.latitude, geo?.longitude]
        );
        return res.status(200).json({ success: true });
      }

      // Check if it's a tracking link code
      const trackingLink = await queryOne<any>(
        'SELECT id FROM ref_tracking_links WHERE code = $1 AND is_active = true',
        [code]
      );

      if (trackingLink) {
        await query(
          `INSERT INTO ref_tracking_clicks (tracking_link_id, ip_address, user_agent, referrer, country, country_code, city)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [trackingLink.id, ipAddress, userAgent, referrer, geo?.country, geo?.countryCode, geo?.city]
        );
        return res.status(200).json({ success: true });
      }

      return res.status(404).json({ error: 'Code not found' });
    } catch (error: any) {
      console.error('Track click error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Submit lead
  if (req.method === 'POST' && req.url?.includes('/lead')) {
    try {
      const { fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message } = req.body;

      if (!fullName || !whatsappNumber) {
        return res.status(400).json({ error: 'Full name and WhatsApp number required' });
      }

      // Check if it's an ambassador code
      const user = await queryOne<any>(
        'SELECT id FROM ref_users WHERE referral_code = $1 AND deleted_at IS NULL',
        [code]
      );

      if (user) {
        const result = await query(
          `INSERT INTO ref_leads (user_id, full_name, email, phone, whatsapp_number, age, preferred_program, preferred_city, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new') RETURNING id`,
          [user.id, fullName, email, phone, whatsappNumber, age, preferredProgram, preferredCity, message]
        );
        return res.status(201).json({ success: true, leadId: result[0].id });
      }

      // Check if it's a tracking link code
      const trackingLink = await queryOne<any>(
        'SELECT id FROM ref_tracking_links WHERE code = $1 AND is_active = true',
        [code]
      );

      if (trackingLink) {
        const result = await query(
          `INSERT INTO ref_tracking_leads (tracking_link_id, full_name, email, whatsapp_number, age, preferred_program, preferred_city, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new') RETURNING id`,
          [trackingLink.id, fullName, email, whatsappNumber, age, preferredProgram, preferredCity, message]
        );
        return res.status(201).json({ success: true, leadId: result[0].id });
      }

      return res.status(404).json({ error: 'Code not found' });
    } catch (error: any) {
      console.error('Submit lead error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
