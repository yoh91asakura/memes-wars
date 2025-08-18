import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication error
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

// Authorization error
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

// Rate limit error
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}

// 404 Not Found handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Global error handler
export const errorHandler = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
    details = Object.keys((error as any).keyValue);
  }

  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger.log(logLevel, `${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, {
    statusCode,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    stack: error.stack,
    details,
  });

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  // Add error code for client handling
  if (error instanceof AppError || error instanceof ZodError) {
    errorResponse.error.code = error.constructor.name;
  }

  // Add details in development mode or for validation errors
  if (details && (process.env['NODE_ENV'] === 'development' || statusCode === 400)) {
    errorResponse.error.details = details;
  }

  // Don't leak error details in production for 5xx errors
  if (statusCode >= 500 && process.env['NODE_ENV'] === 'production') {
    errorResponse.error.message = 'Internal Server Error';
  }

  res.status(statusCode).json(errorResponse);
};

// Async wrapper for route handlers
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Success response helper
export const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Paginated response helper
export const paginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      count: data.length,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    timestamp: new Date().toISOString(),
  });
};
