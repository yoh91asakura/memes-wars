import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// Extended Request interface to track timing
interface RequestWithTiming extends Request {
  startTime?: number;
}

// Request logging middleware
export const requestLogger = (req: RequestWithTiming, res: Response, next: NextFunction) => {
  // Start timing
  req.startTime = Date.now();

  // Get request information
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || 'Unknown';
  const userId = (req as any).user?.id;

  // Log request start
  logger.http(`${method} ${originalUrl} started`, {
    ip,
    userAgent,
    userId,
    body: method === 'POST' || method === 'PUT' || method === 'PATCH' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || '0';

    // Determine log level based on status code
    const logLevel = statusCode >= 400 ? 'warn' : 'http';

    // Log response
    logger.log(logLevel, `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength} bytes`, {
      ip,
      userAgent,
      userId,
      statusCode,
      duration,
      contentLength: parseInt(contentLength, 10),
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// API usage analytics middleware
export const analyticsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Track API endpoint usage
  const endpoint = `${req.method} ${req.route?.path || req.originalUrl}`;
  const userId = (req as any).user?.id;
  
  // Log API usage for analytics
  logger.info('API Usage', {
    endpoint,
    userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: RequestWithTiming, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  // Override res.end to measure performance
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        duration,
        statusCode: res.statusCode,
        ip: req.ip,
        userId: (req as any).user?.id,
      });
    }

    // Log performance metrics
    logger.debug('Request Performance', {
      method: req.method,
      url: req.originalUrl,
      duration,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Security logging middleware
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./,           // Directory traversal
    /<script/i,       // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i,   // XSS via javascript protocol
    /on\w+=/i,       // Event handlers
  ];

  const requestData = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers,
  });

  // Check for suspicious patterns
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

  if (isSuspicious) {
    logger.warn('Suspicious Request Detected', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.body,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString(),
    });
  }

  // Log authentication attempts
  if (req.originalUrl.includes('/auth/')) {
    logger.info('Authentication Attempt', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: req.body?.email,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};
