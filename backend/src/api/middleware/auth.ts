import { Request, Response, NextFunction } from 'express';
import { AuthError } from './errorHandling';
import { authService, JWTPayload, AuthenticatedUser } from '@services/AuthService';
import { logger } from '@/utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      jwtPayload?: JWTPayload;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 */
const extractTokenFromHeader = (authHeader: string): string => {
  if (!authHeader) {
    throw new AuthError('No authorization header provided');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AuthError('Invalid authorization header format');
  }

  return parts[1];
};

/**
 * Authentication middleware - verifies JWT token and loads user
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthError('Access token required');
    }

    const token = extractTokenFromHeader(authHeader);
    
    // Verify token
    const jwtPayload = await authService.verifyAccessToken(token);
    
    // Get user data
    const user = await authService.getUserById(jwtPayload.userId);
    
    // Attach user and payload to request
    req.user = user;
    req.jwtPayload = jwtPayload;

    logger.debug('User authenticated successfully', {
      userId: user.id,
      username: user.username,
      tokenId: jwtPayload.jti,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path,
    });

    if (error instanceof AuthError) {
      return res.status(401).json({
        success: false,
        error: {
          message: error.message,
          code: 'AUTHENTICATION_FAILED',
          timestamp: new Date().toISOString(),
        },
      });
    }

    next(error);
  }
};

/**
 * Optional authentication middleware - loads user if token provided
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No token provided, continue without authentication
      return next();
    }

    const token = extractTokenFromHeader(authHeader);
    
    // Verify token
    const jwtPayload = await authService.verifyAccessToken(token);
    
    // Get user data
    const user = await authService.getUserById(jwtPayload.userId);
    
    // Attach user and payload to request
    req.user = user;
    req.jwtPayload = jwtPayload;

    logger.debug('Optional authentication successful', {
      userId: user.id,
      username: user.username,
    });

    next();
  } catch (error) {
    // Log the error but continue without authentication
    logger.debug('Optional authentication failed, continuing without auth', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
    });
    
    next();
  }
};

/**
 * Role-based access control middleware
 * Note: Currently not implemented as we don't have roles in the schema
 * This is a placeholder for future role-based authorization
 */
export const authorize = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // TODO: Implement role checking when roles are added to user model
    // For now, just allow authenticated users
    next();
  };
};

/**
 * Check if user owns a resource or is admin
 * Useful for protecting user-specific endpoints
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const resourceUserId = req.params[userIdParam];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Missing ${userIdParam} parameter`,
          code: 'MISSING_PARAMETER',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied: insufficient permissions',
          code: 'ACCESS_DENIED',
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 * More restrictive than general API rate limiting
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This would typically use a more sophisticated rate limiting strategy
  // For now, we'll use the general rate limiting from app.ts
  // In production, consider implementing:
  // - IP-based rate limiting for login attempts
  // - Account lockout after multiple failed attempts
  // - Progressive delays for repeated failures
  
  next();
};

/**
 * Middleware to ensure user account is verified
 */
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Email verification required',
        code: 'EMAIL_VERIFICATION_REQUIRED',
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

export default {
  authenticate,
  optionalAuthenticate,
  authorize,
  requireOwnership,
  authRateLimit,
  requireEmailVerification,
};
