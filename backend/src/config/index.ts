import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)).default('8000'),
  HOST: z.string().default('localhost'),

  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // API Security
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  API_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  API_CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('debug'),

  // Game Configuration
  CARDS_PER_ROLL: z.string().transform(Number).pipe(z.number().positive()).default('3'),
  PITY_TIMER_THRESHOLD: z.string().transform(Number).pipe(z.number().positive()).default('50'),
  MAX_DECK_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('30'),
});

// Validate and export configuration
const env = envSchema.parse(process.env);

export const config = {
  // Server
  server: {
    port: env.PORT,
    host: env.HOST,
    env: env.NODE_ENV,
  },

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // Redis
  redis: {
    url: env.REDIS_URL,
  },

  // Authentication
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  // API Security
  security: {
    rateLimitWindowMs: env.API_RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.API_RATE_LIMIT_MAX_REQUESTS,
    corsOrigin: env.API_CORS_ORIGIN,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
  },

  // Game
  game: {
    cardsPerRoll: env.CARDS_PER_ROLL,
    pityTimerThreshold: env.PITY_TIMER_THRESHOLD,
    maxDeckSize: env.MAX_DECK_SIZE,
  },
} as const;

// Type exports
export type Config = typeof config;
export type Environment = typeof env.NODE_ENV;
