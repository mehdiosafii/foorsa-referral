import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaRef2026!';

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const password = (req.headers['x-admin-password'] as string) || '';
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
