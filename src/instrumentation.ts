// =============================================================================
// NEXT.JS INSTRUMENTATION
// =============================================================================
// This file is used to initialize server-side instrumentation
// such as Sentry, OpenTelemetry, etc.
// =============================================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization (if needed)
    await import('../sentry.server.config');
  }
}
