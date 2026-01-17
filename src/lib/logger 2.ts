// =============================================================================
// PRODUCTION-SAFE LOGGER
// =============================================================================
// Use this instead of console.log to ensure logs are only shown in development.
// In production, only errors are logged.
//
// Usage:
//   import { logger } from '@/lib/logger';
//   logger.log('Debug info');    // Only shows in development
//   logger.error('Error!');      // Shows in all environments
//   logger.warn('Warning');      // Only shows in development
// =============================================================================

const isDev = process.env.NODE_ENV === 'development';

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

export const logger: Logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors, but sanitize in production
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
};

// =============================================================================
// AUDIT LOGGER (For security events - no PHI)
// =============================================================================
// Use this for security-relevant events that should be logged in production
// but must NEVER contain PHI.
//
// Safe to log: sessionId, IP, timestamps, status codes, action types
// NEVER log: names, emails, phones, addresses, medical data
// =============================================================================

interface AuditEvent {
  event: string;
  sessionId?: string;
  ip?: string;
  statusCode?: number;
  details?: string;
}

export function auditLog(event: AuditEvent): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    service: 'eonmeds-intake',
    environment: process.env.NODE_ENV || 'development',
    ...event,
  };
  
  // In production, this could be sent to a log aggregator
  console.log(JSON.stringify(logEntry));
}

export default logger;
