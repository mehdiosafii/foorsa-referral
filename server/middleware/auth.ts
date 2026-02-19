import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'foorsa-referral-jwt-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FoorsaAdmin2026!';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    referralCode: string;
    isAdmin: boolean;
  };
  ambassador?: {
    id: number;
    referralCode: string;
  };
}

export function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const adminPassword = req.headers['x-admin-password'] as string;
  const token = req.cookies?.adminToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
      if (decoded.isAdmin) {
        req.user = { id: 0, referralCode: '', isAdmin: true };
        return next();
      }
    } catch (err) {
      // Token invalid, continue to password check
    }
  }

  if (adminPassword === ADMIN_PASSWORD) {
    req.user = { id: 0, referralCode: '', isAdmin: true };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

export function authenticateAmbassador(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.ambassadorToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      ambassadorId: number;
      referralCode: string;
    };
    req.ambassador = {
      id: decoded.ambassadorId,
      referralCode: decoded.referralCode,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.ambassadorToken || req.cookies?.adminToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.isAdmin) {
        req.user = { id: 0, referralCode: '', isAdmin: true };
      } else if (decoded.ambassadorId) {
        req.ambassador = {
          id: decoded.ambassadorId,
          referralCode: decoded.referralCode,
        };
      }
    } catch (err) {
      // Invalid token, continue without auth
    }
  }

  next();
}
