import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { ValidationError } from './errorHandling';

// Validation middleware factory
export const validateRequest = (schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`));
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // MongoDB ObjectId validation
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),

  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Pagination schema
  pagination: z.object({
    page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
    limit: z.string().optional().default('10').transform(Number).pipe(z.number().min(1).max(100)),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // Email validation
  email: z.string().email('Invalid email format').toLowerCase(),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),

  // Username validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
};

// Auth validation schemas
export const authSchemas = {
  register: z.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),

  forgotPassword: z.object({
    email: commonSchemas.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
};

// User validation schemas
export const userSchemas = {
  updateProfile: z.object({
    username: commonSchemas.username.optional(),
    email: commonSchemas.email.optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  getUserById: z.object({
    userId: commonSchemas.objectId,
  }),
};

// Card validation schemas
export const cardSchemas = {
  getCards: z.object({
    ...commonSchemas.pagination.shape,
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'cosmic']).optional(),
    type: z.enum(['creature', 'spell', 'artifact']).optional(),
    search: z.string().optional(),
  }),

  getCardById: z.object({
    cardId: commonSchemas.objectId,
  }),

  rollCards: z.object({
    packType: z.enum(['basic', 'premium', 'legendary']).default('basic'),
    count: z.number().min(1).max(10).default(1),
  }),

  craftCard: z.object({
    cardId: commonSchemas.objectId,
    materialCardIds: z.array(commonSchemas.objectId).min(1),
  }),
};

// Game validation schemas
export const gameSchemas = {
  createMatch: z.object({
    opponentId: commonSchemas.objectId.optional(),
    deckId: commonSchemas.objectId,
    matchType: z.enum(['casual', 'ranked', 'tournament']).default('casual'),
  }),

  getMatchById: z.object({
    matchId: commonSchemas.objectId,
  }),

  playCard: z.object({
    matchId: commonSchemas.objectId,
    cardId: commonSchemas.objectId,
    position: z.object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    }),
  }),

  endTurn: z.object({
    matchId: commonSchemas.objectId,
  }),
};

// Matchmaking validation schemas
export const matchmakingSchemas = {
  joinQueue: z.object({
    deckId: commonSchemas.objectId,
    matchType: z.enum(['casual', 'ranked']).default('casual'),
    preferredRegion: z.enum(['na', 'eu', 'asia', 'auto']).default('auto'),
  }),

  leaveQueue: z.object({
    queueId: commonSchemas.objectId,
  }),
};

// File upload validation schema
export const uploadSchema = z.object({
  file: z.object({
    mimetype: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
    size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  }),
});

// Export validation middleware with pre-configured schemas
export const validate = {
  // Auth validations
  register: validateRequest({ body: authSchemas.register }),
  login: validateRequest({ body: authSchemas.login }),
  refreshToken: validateRequest({ body: authSchemas.refreshToken }),
  forgotPassword: validateRequest({ body: authSchemas.forgotPassword }),
  resetPassword: validateRequest({ body: authSchemas.resetPassword }),

  // User validations
  updateProfile: validateRequest({ body: userSchemas.updateProfile }),
  changePassword: validateRequest({ body: userSchemas.changePassword }),
  getUserById: validateRequest({ params: userSchemas.getUserById }),

  // Card validations
  getCards: validateRequest({ query: cardSchemas.getCards }),
  getCardById: validateRequest({ params: cardSchemas.getCardById }),
  rollCards: validateRequest({ body: cardSchemas.rollCards }),
  craftCard: validateRequest({ body: cardSchemas.craftCard }),

  // Game validations
  createMatch: validateRequest({ body: gameSchemas.createMatch }),
  getMatchById: validateRequest({ params: gameSchemas.getMatchById }),
  playCard: validateRequest({ body: gameSchemas.playCard }),
  endTurn: validateRequest({ body: gameSchemas.endTurn }),

  // Matchmaking validations
  joinQueue: validateRequest({ body: matchmakingSchemas.joinQueue }),
  leaveQueue: validateRequest({ body: matchmakingSchemas.leaveQueue }),

  // Common validations
  pagination: validateRequest({ query: commonSchemas.pagination }),
  objectId: (paramName: string) => validateRequest({ 
    params: z.object({ [paramName]: commonSchemas.objectId }) 
  }),
};
