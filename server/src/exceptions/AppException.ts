/**
 * Base exception class for application-specific errors
 */
export abstract class AppException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    this.name = this.constructor.name;
  }

  /**
   * Check if this is an operational (expected) error (4xx status codes)
   */
  get isOperational(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }
}

/**
 * Exception for validation errors (400)
 */
export class ValidationException extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Exception for authentication errors (401)
 */
export class AuthenticationException extends AppException {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Exception for authorization errors (403)
 */
export class AuthorizationException extends AppException {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

/**
 * Exception for not found errors (404)
 */
export class NotFoundException extends AppException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Exception for conflict errors (409)
 */
export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Exception for general server errors (500)
 */
export class ServerException extends AppException {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

