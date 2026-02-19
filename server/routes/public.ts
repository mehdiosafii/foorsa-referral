import { Router } from 'express';
import { supabase } from '../config/database.js';
import { getClientIp } from '../utils/helpers.js';

const router = Router();

// GET /api/leaderboard - Public leaderboard
router.get('/api/leaderboard', async (req, res) => {
  try {
    const { data: ambassadors, error } = await supabase
      .from('ref_ambassadors')
      .select('id, full_name, first_name, last_name, points, rank, referral_code')
      .is('deleted_at', null)
      .order('points', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Update ranks
    const rankedAmbassadors = ambassadors?.map((amb, index) => ({
      ...amb,
      rank: index + 1,
    })) || [];

    res.json(rankedAmbassadors);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST /api/leads - Submit a new lead from landing page
router.post('/api/leads', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, referralCode } = req.body;

    if (!firstName || !phone) {
      return res.status(400).json({ error: 'First name and phone are required' });
    }

    // Find ambassador by referral code if provided
    let ambassadorId = null;
    if (referralCode) {
      const { data: ambassador } = await supabase
        .from('ref_ambassadors')
        .select('id')
        .eq('referral_code', referralCode)
        .is('deleted_at', null)
        .single();

      ambassadorId = ambassador?.id || null;
    }

    // Create lead
    const { data: lead, error } = await supabase
      .from('ref_leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city,
        source: referralCode || 'direct',
        ambassador_id: ambassadorId,
        status: 'pending',
        converted: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ambassador points if applicable
    if (ambassadorId) {
      await supabase.rpc('increment_ambassador_points', {
        ambassador_id: ambassadorId,
        points_to_add: 10,
      }).catch(() => {
        // Fallback if RPC doesn't exist
        supabase
          .from('ref_ambassadors')
          .update({ points: supabase.raw('points + 10') })
          .eq('id', ambassadorId);
      });
    }

    res.json({ success: true, lead });
  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

// GET /ref/:code - Track click and redirect
router.get('/ref/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Find ambassador
    const { data: ambassador } = await supabase
      .from('ref_ambassadors')
      .select('id, referral_code')
      .eq('referral_code', code)
      .is('deleted_at', null)
      .single();

    if (ambassador) {
      // Record click
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const referer = req.headers['referer'] || req.headers['referrer'] || '';

      await supabase.from('ref_clicks').insert({
        ambassador_id: ambassador.id,
        referral_code: code,
        ip_address: ip,
        user_agent: userAgent,
        referer,
        country: null, // Could add GeoIP lookup here
      });

      // Increment tracking link clicks if exists
      await supabase
        .from('ref_tracking_links')
        .update({ clicks_count: supabase.raw('clicks_count + 1') })
        .eq('ambassador_id', ambassador.id);
    }

    // Redirect to landing page with tracking code
    res.redirect(`/?ref=${code}`);
  } catch (error) {
    console.error('Tracking error:', error);
    res.redirect('/');
  }
});

export default router;
