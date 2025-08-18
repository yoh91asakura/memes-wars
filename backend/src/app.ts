import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from '@config/index';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@api/middleware/errorHandling';
import { requestLogger } from '@api/middleware/logging';
import { cacheService } from '@services/CacheService';

// Import routes
import authRoutes from '@api/routes/auth.routes';
import userRoutes from '@api/routes/users.routes';
import cardRoutes from '@api/routes/cards.routes';
import gameRoutes from '@api/routes/game.routes';
import matchmakingRoutes from '@api/routes/matchmaking.routes';

// Import WebSocket handlers
import { setupGameSocket } from '@websocket/GameSocket';
import { setupMatchmakingSocket } from '@websocket/MatchmakingSocket';

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.security.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Apply rate limiting to API routes only
app.use('/api', limiter);

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const cacheHealth = await cacheService.healthCheck();
    const cacheStats = await cacheService.getStats();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.server.env,
      version: process.env['npm_package_version'] || '1.0.0',
      services: {
        cache: {
          status: cacheHealth.status,
          latency: `${cacheHealth.latency}ms`,
          stats: {
            hits: cacheStats.hits,
            misses: cacheStats.misses,
            keys: cacheStats.keys,
            memory: cacheStats.memory,
          },
        },
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: config.server.env,
      error: 'Health check failed',
    });
  }
});

// API Documentation
app.get('/api/docs', (_req, res) => {
  res.json({
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      cards: '/api/cards/*',
      game: '/api/game/*',
      matchmaking: '/api/matchmaking/*',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/matchmaking', matchmakingRoutes);

// Setup WebSocket handlers
setupGameSocket(io);
setupMatchmakingSocket(io);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Try to initialize database connection
    try {
      const { initDatabase } = await import('@database/connection');
      await initDatabase();
    } catch (dbError) {
      logger.warn('Database connection failed - continuing without database:', dbError);
      logger.info('📊 Running in database-less mode - some features will be limited');
    }

    // Try to initialize Redis cache connection  
    try {
      await cacheService.connect();
    } catch (cacheError) {
      logger.warn('Redis connection failed - continuing without cache:', cacheError);
      logger.info('🔄 Running in cache-less mode - performance may be impacted');
    }

    httpServer.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Server running on http://${config.server.host}:${config.server.port}`);
      logger.info(`📝 API Documentation: http://${config.server.host}:${config.server.port}/api/docs`);
      logger.info(`🩺 Health Check: http://${config.server.host}:${config.server.port}/health`);
      logger.info(`🎮 Environment: ${config.server.env}`);
      
      if (config.server.env === 'development') {
        logger.info(`🔧 Development mode - additional logging enabled`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await cacheService.disconnect();
  httpServer.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await cacheService.disconnect();
  httpServer.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app, httpServer, io };
export default app;
