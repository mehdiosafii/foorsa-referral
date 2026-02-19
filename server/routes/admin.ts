import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { authenticateAdmin, AuthRequest } from '../middleware/auth.js';
import { generateReferralCode, generateWhatsAppLink } from '../utils/helpers.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'foorsa-referral-jwt-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaAdmin2026!';

// POST /api/login - Admin login
router.post('/api/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      res.json({ success: true, user: { isAdmin: true } });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/logout
router.post('/api/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

// GET /api/auth/user
router.get('/api/auth/user', authenticateAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// GET /api/admin/stats - Admin dashboard stats
router.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const { count: ambassadorsCount } = await supabase
      .from('ref_ambassadors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: leadsCount } = await supabase
      .from('ref_leads')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: clicksCount } = await supabase
      .from('ref_clicks')
      .select('*', { count: 'exact', head: true });

    const { count: convertedCount } = await supabase
      .from('ref_leads')
      .select('*', { count: 'exact', head: true })
      .eq('converted', true)
      .is('deleted_at', null);

    const conversionRate = leadsCount ? ((convertedCount || 0) / leadsCount) * 100 : 0;

    res.json({
      ambassadors: ambassadorsCount || 0,
      leads: leadsCount || 0,
      clicks: clicksCount || 0,
      conversions: convertedCount || 0,
      conversionRate: conversionRate.toFixed(1),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/chart - Admin chart data
router.get('/api/admin/chart', authenticateAdmin, async (req, res) => {
  try {
    const days = 30;

    const { data: clicksData } = await supabase
      .from('ref_clicks')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const { data: leadsData } = await supabase
      .from('ref_leads')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const chartData: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const clicks = clicksData?.filter(c => c.created_at.startsWith(dateStr)).length || 0;
      const leads = leadsData?.filter(l => l.created_at.startsWith(dateStr)).length || 0;

      chartData.push({ date: dateStr, clicks, leads });
    }

    res.json(chartData);
  } catch (error) {
    console.error('Admin chart error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// GET /api/admin/users - List all ambassadors
router.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const { data: ambassadors, error } = await supabase
      .from('ref_ambassadors')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(ambassadors || []);
  } catch (error) {
    console.error('List ambassadors error:', error);
    res.status(500).json({ error: 'Failed to fetch ambassadors' });
  }
});

// POST /api/admin/users - Create ambassador
router.post('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !password) {
      return res.status(400).json({ error: 'First name, last name, and password required' });
    }

    // Generate referral code
    let referralCode = generateReferralCode(firstName, lastName);
    
    // Check if code exists, regenerate if needed
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      const { data } = await supabase
        .from('ref_ambassadors')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (!data) {
        codeExists = false;
      } else {
        referralCode = generateReferralCode(firstName, lastName);
        attempts++;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: ambassador, error } = await supabase
      .from('ref_ambassadors')
      .insert({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        referral_code: referralCode,
        password_hash: passwordHash,
        points: 0,
        is_admin: false,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(ambassador);
  } catch (error) {
    console.error('Create ambassador error:', error);
    res.status(500).json({ error: 'Failed to create ambassador' });
  }
});

// PUT /api/admin/users/:id - Update ambassador
router.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, password, points } = req.body;

    const updates: any = {};
    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (points !== undefined) updates.points = points;
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }
    if (firstName || lastName) {
      // Re-compute full_name
      const fn = firstName || '';
      const ln = lastName || '';
      updates.full_name = `${fn} ${ln}`.trim() || undefined;
    }

    const { data: ambassador, error } = await supabase
      .from('ref_ambassadors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(ambassador);
  } catch (error) {
    console.error('Update ambassador error:', error);
    res.status(500).json({ error: 'Failed to update ambassador' });
  }
});

// DELETE /api/admin/users/:id - Soft delete ambassador
router.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('ref_ambassadors')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete ambassador error:', error);
    res.status(500).json({ error: 'Failed to delete ambassador' });
  }
});

// GET /api/admin/leads - List all leads
router.get('/api/admin/leads', authenticateAdmin, async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('ref_leads')
      .select(`
        *,
        ambassador:ref_ambassadors(id, full_name, referral_code)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(leads || []);
  } catch (error) {
    console.error('List leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST /api/admin/leads/quick-send - Generate WhatsApp link for a lead
router.post('/api/admin/leads/quick-send', authenticateAdmin, async (req, res) => {
  try {
    const { leadId, message } = req.body;

    const { data: lead } = await supabase
      .from('ref_leads')
      .select('phone, first_name')
      .eq('id', leadId)
      .single();

    if (!lead || !lead.phone) {
      return res.status(400).json({ error: 'Lead phone not found' });
    }

    const defaultMessage = message || `Bonjour ${lead.first_name}, nous avons reçu votre demande concernant les études en Chine. Pouvons-nous discuter?`;
    const whatsappLink = generateWhatsAppLink(lead.phone, defaultMessage);

    // Update lead whatsapp_status
    await supabase
      .from('ref_leads')
      .update({ whatsapp_status: 'sent' })
      .eq('id', leadId);

    res.json({ whatsappLink });
  } catch (error) {
    console.error('Quick send error:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp link' });
  }
});

// POST /api/admin/leads/bulk-send - Generate WhatsApp links for multiple leads
router.post('/api/admin/leads/bulk-send', authenticateAdmin, async (req, res) => {
  try {
    const { leadIds, message } = req.body;

    const { data: leads } = await supabase
      .from('ref_leads')
      .select('id, phone, first_name')
      .in('id', leadIds);

    const results = leads?.map(lead => {
      if (!lead.phone) return null;
      const defaultMessage = message || `Bonjour ${lead.first_name}, nous avons reçu votre demande concernant les études en Chine.`;
      return {
        leadId: lead.id,
        whatsappLink: generateWhatsAppLink(lead.phone, defaultMessage),
      };
    }).filter(Boolean) || [];

    // Update whatsapp_status for all
    await supabase
      .from('ref_leads')
      .update({ whatsapp_status: 'sent' })
      .in('id', leadIds);

    res.json({ results });
  } catch (error) {
    console.error('Bulk send error:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp links' });
  }
});

// GET /api/admin/analytics/summary
router.get('/api/admin/analytics/summary', authenticateAdmin, async (req, res) => {
  try {
    const { data: topAmbassadors } = await supabase
      .from('ref_ambassadors')
      .select('id, full_name, points, referral_code')
      .is('deleted_at', null)
      .order('points', { ascending: false })
      .limit(5);

    const { data: recentLeads } = await supabase
      .from('ref_leads')
      .select('id, first_name, last_name, created_at, status')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      topAmbassadors: topAmbassadors || [],
      recentLeads: recentLeads || [],
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/analytics/timeseries
router.get('/api/admin/analytics/timeseries', authenticateAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const { data: clicksData } = await supabase
      .from('ref_clicks')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const { data: leadsData } = await supabase
      .from('ref_leads')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const timeseriesData: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const clicks = clicksData?.filter(c => c.created_at.startsWith(dateStr)).length || 0;
      const leads = leadsData?.filter(l => l.created_at.startsWith(dateStr)).length || 0;

      timeseriesData.push({ date: dateStr, clicks, leads });
    }

    res.json(timeseriesData);
  } catch (error) {
    console.error('Timeseries error:', error);
    res.status(500).json({ error: 'Failed to fetch timeseries data' });
  }
});

// GET /api/admin/tracking-links
router.get('/api/admin/tracking-links', authenticateAdmin, async (req, res) => {
  try {
    const { data: links, error } = await supabase
      .from('ref_tracking_links')
      .select(`
        *,
        ambassador:ref_ambassadors(id, full_name, referral_code)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(links || []);
  } catch (error) {
    console.error('Tracking links error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking links' });
  }
});

// GET /api/admin/map/clicks - Admin map data
router.get('/api/admin/map/clicks', authenticateAdmin, async (req, res) => {
  try {
    const { data: clicks } = await supabase
      .from('ref_clicks')
      .select('country, created_at')
      .not('country', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    res.json(clicks || []);
  } catch (error) {
    console.error('Map clicks error:', error);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// POST /api/admin/seed-ambassadors - Seed test data
router.post('/api/admin/seed-ambassadors', authenticateAdmin, async (req, res) => {
  try {
    const testAmbassadors = [
      { firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed@test.com', phone: '+212600000001' },
      { firstName: 'Fatima', lastName: 'Zahra', email: 'fatima@test.com', phone: '+212600000002' },
      { firstName: 'Youssef', lastName: 'Idrissi', email: 'youssef@test.com', phone: '+212600000003' },
    ];

    const created = [];
    for (const amb of testAmbassadors) {
      const referralCode = generateReferralCode(amb.firstName, amb.lastName);
      const passwordHash = await bcrypt.hash('test123', 10);

      const { data } = await supabase
        .from('ref_ambassadors')
        .insert({
          first_name: amb.firstName,
          last_name: amb.lastName,
          email: amb.email,
          phone: amb.phone,
          referral_code: referralCode,
          password_hash: passwordHash,
          points: Math.floor(Math.random() * 100),
        })
        .select()
        .single();

      if (data) created.push(data);
    }

    res.json({ success: true, created });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed ambassadors' });
  }
});

// GET /api/admin/trash/users - Get deleted ambassadors
router.get('/api/admin/trash/users', authenticateAdmin, async (req, res) => {
  try {
    const { data: ambassadors, error } = await supabase
      .from('ref_ambassadors')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    res.json(ambassadors || []);
  } catch (error) {
    console.error('Trash users error:', error);
    res.status(500).json({ error: 'Failed to fetch trash' });
  }
});

// GET /api/admin/trash/leads - Get deleted leads
router.get('/api/admin/trash/leads', authenticateAdmin, async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('ref_leads')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    res.json(leads || []);
  } catch (error) {
    console.error('Trash leads error:', error);
    res.status(500).json({ error: 'Failed to fetch trash' });
  }
});

// POST /api/admin/trash/cleanup - Permanently delete old trash items
router.post('/api/admin/trash/cleanup', authenticateAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('ref_ambassadors')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo);

    await supabase
      .from('ref_leads')
      .delete()
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo);

    res.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup trash' });
  }
});

export default router;
