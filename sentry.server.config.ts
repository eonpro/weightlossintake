// =============================================================================
// SENTRY SERVER CONFIGURATION - PHI Safe
// =============================================================================
// This file provides PHI-safe Sentry configuration for server-side.
//
// To enable Sentry:
// 1. npm install @sentry/nextjs
// 2. Set SENTRY_DSN in environment variables
// 3. Run: npx @sentry/wizard@latest -i nextjs
//
// The configuration below is ready to use once @sentry/nextjs is installed.
// =============================================================================

import { scrubPHI } from './sentry.client.config';

// Re-export scrubPHI for server usage
export { scrubPHI };

// =============================================================================
// SENTRY SERVER CONFIGURATION OBJECT
// =============================================================================

export const sentryServerConfig = {
  // Environment identification
  environment: process.env.NODE_ENV || 'development',

  // Performance monitoring (lower for server to reduce overhead)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,

  // Error sampling
  sampleRate: 1.0,

  // Ignore common non-actionable errors
  ignoreErrors: [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'Too many requests',
    'VALIDATION_ERROR',
  ],
};

// =============================================================================
// EXAMPLE SENTRY INITIALIZATION (uncomment when @sentry/nextjs is installed)
// =============================================================================
/*
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  ...sentryServerConfig,

  beforeSend(event) {
    // Scrub PHI from error messages
    if (event.message) {
      event.message = scrubPHI(event.message);
    }

    // Scrub PHI from exception values
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => ({
        ...exception,
        value: exception.value ? scrubPHI(exception.value) : exception.value,
      }));
    }

    // Remove request body (may contain PHI)
    if (event.request) {
      delete event.request.data;
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['x-api-key'];
        delete event.request.headers['cookie'];
      }
    }

    // Scrub user data - only keep session ID
    if (event.user) {
      event.user = { id: event.user.id };
    }

    // Remove extra context that might contain PHI
    if (event.extra) {
      const safeKeys = ['request_id', 'status_code', 'duration', 'route'];
      const safeExtra: Record<string, unknown> = {};
      for (const key of safeKeys) {
        if (key in event.extra) {
          safeExtra[key] = event.extra[key];
        }
      }
      event.extra = safeExtra;
    }

    return event;
  },
});
*/
