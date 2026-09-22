import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'anten-isp-production-super-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare plain text password against bcrypt hash
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  // If hash is plain text in legacy/demo data, check equality directly or with bcrypt
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    return plainText === hash;
  }
  return bcrypt.compare(plainText, hash);
}

/**
 * Generate a signed JWT session token
 */
export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT session token
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Server-side Express middleware to authenticate session via Authorization header or Cookie
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.anten_session) {
    token = req.cookies.anten_session;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Sesi tidak ditemukan atau belum login.',
    });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan login kembali.',
    });
  }

  req.user = payload;
  next();
}

/**
 * Server-side Role-based authorization middleware
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Tidak diautentikasi.',
      });
    }

    // Administrator has universal access
    if (req.user.role === 'Administrator' || req.user.role === 'Super Admin') {
      return next();
    }

    const hasRole = allowedRoles.some(
      (role) => role.toLowerCase() === req.user?.role.toLowerCase()
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.`,
      });
    }

    next();
  };
}
