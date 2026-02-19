import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { authenticateAmbassador, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'foorsa-referral-jwt-secret';

// POST /api/ambassador/login
router.post('/api/ambassador/login', async (req, res) => {
  try {
    const { referralCode, password } = req.body;

    if (!referralCode || !password) {
      return res.status(400).json({ error: 'Referral code and password required' });
    }

    const { data: ambassador, error } = await supabase
      .from('ref_ambassadors')
      .select('*')
      .eq('referral_code', referralCode)
      .is('deleted_at', null)
      .single();

    if (error || !ambassador) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, ambassador.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      {
        ambassadorId: ambassador.id,
        referralCode: ambassador.referral_code,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('ambassadorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    });

    res.json({
      success: true,
      ambassador: {
        id: ambassador.id,
        firstName: ambassador.first_name,
        lastName: ambassador.last_name,
        fullName: ambassador.full_name,
        email: ambassador.email,
        referralCode: ambassador.referral_code,
        points: ambassador.points,
        rank: ambassador.rank,
      },
    });
  } catch (error) {
    console.error('Ambassador login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/ambassador/logout
router.post('/api/ambassador/logout', (req, res) => {
  res.clearCookie('ambassadorToken');
  res.json({ success: true });
});

// GET /api/ambassador/me
router.get('/api/ambassador/me', authenticateAmbassador, async (req: AuthRequest, res) => {
  try {
    const { data: ambassador, error } = await supabase
      .from('ref_ambassadors')
      .select('*')
      .eq('id', req.ambassador!.id)
      .is('deleted_at', null)
      .single();

    if (error || !ambassador) {
      return res.status(404).json({ error: 'Ambassador not found' });
    }

    res.json({
      id: ambassador.id,
      firstName: ambassador.first_name,
      lastName: ambassador.last_name,
      fullName: ambassador.full_name,
      email: ambassador.email,
      phone: ambassador.phone,
      referralCode: ambassador.referral_code,
      points: ambassador.points,
      rank: ambassador.rank,
      createdAt: ambassador.created_at,
    });
  } catch (error) {
    console.error('Get ambassador error:', error);
    res.status(500).json({ error: 'Failed to get ambassador' });
  }
});

// GET /api/stats - Ambassador's own stats
router.get('/api/stats', authenticateAmbassador, async (req: AuthRequest, res) => {
  try {
    const ambassadorId = req.ambassador!.id;

    // Get counts
    const { count: clicksCount } = await supabase
      .from('ref_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('ambassador_id', ambassadorId);

    const { count: leadsCount } = await supabase
      .from('ref_leads')
      .select('*', { count: 'exact', head: true })
      .eq('ambassador_id', ambassadorId)
      .is('deleted_at', null);

    const { count: convertedCount } = await supabase
      .from('ref_leads')
      .select('*', { count: 'exact', head: true })
      .eq('ambassador_id', ambassadorId)
      .eq('converted', true)
      .is('deleted_at', null);

    const { data: ambassador } = await supabase
      .from('ref_ambassadors')
      .select('points, rank')
      .eq('id', ambassadorId)
      .single();

    const conversionRate = leadsCount ? ((convertedCount || 0) / leadsCount) * 100 : 0;

    res.json({
      clicks: clicksCount || 0,
      leads: leadsCount || 0,
      conversions: convertedCount || 0,
      conversionRate: conversionRate.toFixed(1),
      points: ambassador?.points || 0,
      rank: ambassador?.rank || 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/stats/chart - Ambassador's chart data
router.get('/api/stats/chart', authenticateAmbassador, async (req: AuthRequest, res) => {
  try {
    const ambassadorId = req.ambassador!.id;
    const days = 30;

    // Get clicks per day for last 30 days
    const { data: clicksData } = await supabase
      .from('ref_clicks')
      .select('created_at')
      .eq('ambassador_id', ambassadorId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    // Get leads per day
    const { data: leadsData } = await supabase
      .from('ref_leads')
      .select('created_at')
      .eq('ambassador_id', ambassadorId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    // Group by date
    const chartData: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const clicks = clicksData?.filter(c => c.created_at.startsWith(dateStr)).length || 0;
      const leads = leadsData?.filter(l => l.created_at.startsWith(dateStr)).length || 0;

      chartData.push({
        date: dateStr,
        clicks,
        leads,
      });
    }

    res.json(chartData);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// GET /api/leads/recent - Ambassador's recent leads
router.get('/api/leads/recent', authenticateAmbassador, async (req: AuthRequest, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('ref_leads')
      .select('*')
      .eq('ambassador_id', req.ambassador!.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(leads || []);
  } catch (error) {
    console.error('Recent leads error:', error);
    res.status(500).json({ error: 'Failed to fetch recent leads' });
  }
});

// GET /api/ambassador/map/clicks - Ambassador's click map data
router.get('/api/ambassador/map/clicks', authenticateAmbassador, async (req: AuthRequest, res) => {
  try {
    const { data: clicks } = await supabase
      .from('ref_clicks')
      .select('country, created_at')
      .eq('ambassador_id', req.ambassador!.id)
      .not('country', 'is', null)
      .limit(100);

    res.json(clicks || []);
  } catch (error) {
    console.error('Map clicks error:', error);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

export default router;
