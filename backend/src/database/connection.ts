import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Prisma client instance
let prisma: PrismaClient;

// Global Prisma instance for Next.js development
declare const globalThis: {
  prismaGlobal: PrismaClient;
} & typeof global;

// Initialize Prisma client with optimal configuration
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
    errorFormat: 'pretty',
  });

  // Log database queries in development
  if (process.env['NODE_ENV'] === 'development') {
    client.$on('query', (e) => {
      logger.debug('Database Query', {
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target,
      });
    });
  }

  // Log database errors
  client.$on('error', (e) => {
    logger.error('Database Error', {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp,
    });
  });

  // Log database warnings
  client.$on('warn', (e) => {
    logger.warn('Database Warning', {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp,
    });
  });

  return client;
};

// Initialize Prisma client (reuse in development to prevent hot reload issues)
if (process.env['NODE_ENV'] === 'production') {
  prisma = createPrismaClient();
} else {
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient();
  }
  prisma = globalThis.prismaGlobal;
}

/**
 * Initialize database connection and verify connectivity
 */
export const initDatabase = async (): Promise<void> => {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected successfully');

    // Log database info
    const result = await prisma.$queryRaw`
      SELECT version() as version, 
             current_database() as database,
             current_user as user
    ` as any[];

    logger.info('📊 Database Info', {
      version: result[0].version.split(' ')[0],
      database: result[0].database,
      user: result[0].user,
    });

    // Check if migrations are up to date
    try {
      const migrations = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "_prisma_migrations" 
        WHERE applied_steps_count > 0
      ` as any[];
      
      logger.info(`🔄 Applied migrations: ${migrations[0].count}`);
    } catch (error) {
      logger.warn('Could not check migrations table (expected on first run)');
    }

  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw new Error('Database connection failed');
  }
};

/**
 * Close database connection gracefully
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

/**
 * Health check for database connectivity
 */
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}> => {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    
    return {
      status: 'unhealthy',
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const [userCount, cardCount, deckCount, matchCount] = await Promise.all([
      prisma.user.count(),
      prisma.card.count(),
      prisma.deck.count(),
      prisma.match.count(),
    ]);

    return {
      users: userCount,
      cards: cardCount,
      decks: deckCount,
      matches: matchCount,
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    throw error;
  }
};

/**
 * Clean up expired tokens and temporary data
 */
export const cleanupExpiredData = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Delete expired refresh tokens
    const expiredRefreshTokens = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Delete expired password reset tokens
    const expiredResetTokens = await prisma.passwordReset.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: now,
            },
          },
          {
            used: true,
            createdAt: {
              lt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
            },
          },
        ],
      },
    });

    // Clean up old matchmaking queue entries (older than 1 hour)
    const oldQueueEntries = await prisma.matchmakingQueue.deleteMany({
      where: {
        OR: [
          {
            leftAt: {
              lt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            },
          },
          {
            joinedAt: {
              lt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            },
            status: 'CANCELLED',
          },
        ],
      },
    });

    logger.info('🧹 Cleanup completed', {
      expiredRefreshTokens: expiredRefreshTokens.count,
      expiredResetTokens: expiredResetTokens.count,
      oldQueueEntries: oldQueueEntries.count,
    });

  } catch (error) {
    logger.error('Error during data cleanup:', error);
  }
};

// Export Prisma client instance
export { prisma };
export default prisma;
