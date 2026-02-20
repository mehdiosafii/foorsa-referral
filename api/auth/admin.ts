import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaRef2026!';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ 
        success: true, 
        user: { 
          id: 'admin', 
          email: 'admin@foorsa.ma',
          isAdmin: true 
        } 
      });
    }

    return res.status(401).json({ error: 'Invalid password' });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: error.message });
  }
}
