import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppException } from '../exceptions/AppException.ts';
import logger from '../lib/logger.ts';

/**
 * Global error handling middleware that catches all errors
 * Must be registered after all routes
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers have already been sent, delegate to the default error handler
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppException) {
    // Log all errors for debugging
    logger.error({ err: error, stack: error.stack }, 'Error');
    
    res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
    return;
  }

  // Handle other known error types
  if (error.name === 'ValidationError') {
    logger.error({ err: error, stack: error.stack }, 'ValidationError caught in global error handler');
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation error',
      details: error.message
    });
    return;
  }

  if (error.name === 'CastError') {
    logger.error({ err: error, stack: error.stack }, 'CastError caught in global error handler');
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Invalid ID format'
    });
    return;
  }

  // Default error response for unexpected errors
  logger.error({ err: error, stack: error.stack }, 'Unexpected error caught in global error handler');
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    // If in production, return a generic error message
    // Otherwise, return the details of the stack trace
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Async error wrapper for individual route handlers
 * This ensures async errors are properly caught and passed to the global handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

