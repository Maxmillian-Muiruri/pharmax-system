import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import prisma from '../lib/prisma.js';

// Access to the token blacklist from auth controller
let tokenBlacklist: Set<string> | null = null;

export function setTokenBlacklist(blacklist: Set<string>) {
  tokenBlacklist = blacklist;
}

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
    isActive: boolean;
  };
}

/**
 * Verify JWT from Authorization header and attach req.user
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    if (tokenBlacklist && tokenBlacklist.has(token)) {
      throw new AppError('Token has been invalidated', 401, 'TOKEN_BLACKLISTED');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Session expired, please log in again', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }

    // Ensure it's an access token
    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
    }

    // Attach user from DB to ensure it still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, userType: true, isActive: true },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('User account is disabled', 403, 'ACCOUNT_DISABLED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
