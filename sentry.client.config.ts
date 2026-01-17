// =============================================================================
// SENTRY CLIENT CONFIGURATION - PHI Safe
// =============================================================================
// This file provides PHI-safe Sentry configuration.
//
// To enable Sentry:
// 1. npm install @sentry/nextjs
// 2. Set NEXT_PUBLIC_SENTRY_DSN in environment variables
// 3. Run: npx @sentry/wizard@latest -i nextjs
//
// The configuration below is ready to use once @sentry/nextjs is installed.
// =============================================================================

// =============================================================================
// PHI SCRUBBING FUNCTION
// =============================================================================
// Removes common PHI patterns from strings - HIPAA compliance

export function scrubPHI(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // Email addresses
  text = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL_REDACTED]'
  );

  // Phone numbers (various formats)
  text = text.replace(
    /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
    '[PHONE_REDACTED]'
  );

  // SSN
  text = text.replace(
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    '[SSN_REDACTED]'
  );

  // Dates that look like DOB (MM/DD/YYYY, YYYY-MM-DD, etc.)
  text = text.replace(
    /\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](19|20)\d{2}\b/g,
    '[DATE_REDACTED]'
  );
  text = text.replace(
    /\b(19|20)\d{2}[/-](0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])\b/g,
    '[DATE_REDACTED]'
  );

  // ZIP codes (5 or 9 digit)
  text = text.replace(/\b\d{5}(-\d{4})?\b/g, '[ZIP_REDACTED]');

  // Weight values (e.g., "200 lbs", "150lbs")
  text = text.replace(/\b\d{2,3}\s*(lbs?|pounds?|kg)\b/gi, '[WEIGHT_REDACTED]');

  // Height values (e.g., "5'10\"", "5 ft 10 in")
  text = text.replace(
    /\b\d['′]\s*\d{1,2}["″]?\b|\b\d\s*(ft|feet)\s*\d{1,2}\s*(in|inches?)?\b/gi,
    '[HEIGHT_REDACTED]'
  );

  return text;
}

// =============================================================================
// SENTRY CONFIGURATION OBJECT
// =============================================================================
// Export this configuration for use when Sentry is initialized

export const sentryClientConfig = {
  // Environment identification
  environment: process.env.NODE_ENV || 'development',

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Error sampling
  sampleRate: 1.0,

  // Replay for debugging (only in production, low sample rate)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Ignore common non-actionable errors
  ignoreErrors: [
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'NetworkError',
    'ResizeObserver loop',
    'AbortError',
  ],
};

// =============================================================================
// EXAMPLE SENTRY INITIALIZATION (uncomment when @sentry/nextjs is installed)
// =============================================================================
/*
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ...sentryClientConfig,

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
    }

    // Scrub user data
    if (event.user) {
      event.user = { id: event.user.id };
    }

    return event;
  },

  beforeBreadcrumb(breadcrumb) {
    // Don't log console messages (might contain PHI)
    if (breadcrumb.category === 'console') {
      return null;
    }
    return breadcrumb;
  },
});
*/
