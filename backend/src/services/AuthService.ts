import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@database/connection';
import { config } from '@config/index';
import { logger } from '@/utils/logger';
import { AuthError, ValidationError, NotFoundError } from '@api/middleware/errorHandling';

// Types for authentication
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
  jti: string; // JWT ID for tracking
}

export interface RefreshPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  lastLogin?: Date;
}

class AuthService {
  private readonly saltRounds = 12;
  private readonly jwtSecret = config.auth.jwtSecret;
  private readonly jwtRefreshSecret = config.auth.jwtRefreshSecret;
  private readonly jwtExpiresIn = config.auth.jwtExpiresIn;
  private readonly jwtRefreshExpiresIn = config.auth.jwtRefreshExpiresIn;

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(user: AuthenticatedUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      username: user.username,
      jti: uuidv4(),
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'meme-wars-api',
      audience: 'meme-wars-client',
    });
  }

  /**
   * Generate JWT refresh token and store in database
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = uuidv4();
    const expiresAt = new Date();
    
    // Parse refresh token expiration (e.g., '7d', '24h', '30m')
    const match = this.jwtRefreshExpiresIn.match(/(\d+)([dhm])/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
      }
    } else {
      // Default to 7 days
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: tokenId,
        userId,
        expiresAt,
      },
    });

    const payload: Omit<RefreshPayload, 'iat' | 'exp'> = {
      userId,
      tokenId,
    };

    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
      issuer: 'meme-wars-api',
      audience: 'meme-wars-client',
    });
  }

  /**
   * Verify JWT access token
   */
  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'meme-wars-api',
        audience: 'meme-wars-client',
      }) as JWTPayload;

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isActive: true, isBanned: true },
      });

      if (!user || !user.isActive || user.isBanned) {
        throw new AuthError('User account is not valid');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Token expired');
      }
      throw error;
    }
  }

  /**
   * Verify JWT refresh token
   */
  async verifyRefreshToken(token: string): Promise<RefreshPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret, {
        issuer: 'meme-wars-api',
        audience: 'meme-wars-client',
      }) as RefreshPayload;

      // Verify refresh token exists in database and is not expired
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { id: decoded.tokenId },
        include: { user: { select: { id: true, isActive: true, isBanned: true } } },
      });

      if (!refreshToken || refreshToken.expiresAt < new Date()) {
        throw new AuthError('Invalid refresh token');
      }

      if (!refreshToken.user.isActive || refreshToken.user.isBanned) {
        throw new AuthError('User account is not valid');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthenticatedUser> {
    const { username, email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new ValidationError('Email already registered');
      }
      if (existingUser.username === username) {
        throw new ValidationError('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user and associated stats in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          avatar: true,
          bio: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      // Create user stats
      await tx.userStats.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    logger.info(`New user registered: ${user.username} (${user.email})`);
    return user;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthenticatedUser; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        bio: true,
        password: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthError('Account is deactivated');
    }

    if (user.isBanned) {
      throw new AuthError('Account is banned');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const { password: _, ...userWithoutPassword } = user;
    const accessToken = this.generateAccessToken(userWithoutPassword);
    const refreshToken = await this.generateRefreshToken(user.id);

    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiresIn,
      tokenType: 'Bearer',
    };

    logger.info(`User logged in: ${user.username} (${user.email})`);
    return { user: userWithoutPassword, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const decoded = await this.verifyRefreshToken(refreshToken);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Remove old refresh token
    await prisma.refreshToken.delete({
      where: { id: decoded.tokenId },
    });

    logger.info(`Tokens refreshed for user: ${user.username}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.jwtExpiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      try {
        const decoded = await this.verifyRefreshToken(refreshToken);
        await prisma.refreshToken.delete({
          where: { id: decoded.tokenId },
        });
      } catch (error) {
        // Token might be invalid or expired, continue with logout
      }
    }

    // If userId provided, invalidate all refresh tokens for user
    if (userId) {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }

    logger.info(`User logged out`);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await this.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AuthError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password and invalidate all refresh tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId },
      }),
    ]);

    logger.info(`Password changed for user: ${userId}`);
  }
}

export const authService = new AuthService();
export default authService;
