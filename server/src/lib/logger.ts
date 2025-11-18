import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Remove verbose metadata and focus on useful information
  base: undefined,
  // Custom timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  // Custom formatters to make logs more readable
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  // Remove unnecessary fields from log output
  messageKey: 'message',
});

// HTTP logging configuration
export const httpLogger = pinoHttp({
  logger,
  // Custom request logging
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500) return 'error';
    return 'info';
  },
  // Custom request message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },
  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err?.message || 'Unknown error'}`;
  },
  // Only log relevant request data
  customProps: (req, res) => {
    return {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: res.getHeader('X-Response-Time'),
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    };
  },
  // Skip logging for health checks and static files
  autoLogging: {
    ignore: (req) => {
      return req.url === '/health' || (req.url?.startsWith('/static/') ?? false);
    }
  }
});

export default logger;

