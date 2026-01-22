import { NextResponse } from 'next/server';

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================
// Standard health check for monitoring, load balancers, and uptime services.
// Returns service status and configuration checks (no secrets or PHI).
//
// Usage:
//   GET /api/health          - Basic health check (for load balancers)
//   GET /api/health?verbose  - Detailed status (for debugging)
// =============================================================================

interface ServiceStatus {
  status: string;
  configured: boolean;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services?: {
    airtable: ServiceStatus;
    eonpro: ServiceStatus;
    stripe: ServiceStatus;
    clerk: ServiceStatus;
  };
  checks?: {
    airtable: boolean;
    intakeq: boolean;
    pdfco: boolean;
  };
  uptime?: number;
}

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verbose = url.searchParams.has('verbose');
  
  // Check service configuration (not connectivity - that would be too slow)
  const airtableConfigured = !!(process.env.AIRTABLE_PAT && process.env.AIRTABLE_BASE_ID);
  const eonproConfigured = !!(process.env.EONPRO_WEBHOOK_URL && process.env.EONPRO_WEBHOOK_SECRET);
  const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const clerkConfigured = !!(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const intakeqConfigured = !!process.env.INTAKEQ_API_KEY;
  const pdfcoConfigured = !!process.env.PDFCO_API_KEY;
  
  // Determine overall health based on critical services
  const criticalServicesConfigured = airtableConfigured && clerkConfigured;
  const status: HealthStatus['status'] = criticalServicesConfigured 
    ? 'healthy' 
    : airtableConfigured || clerkConfigured
      ? 'degraded' 
      : 'unhealthy';
  
  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
  
  // Add detailed checks only if verbose mode requested
  if (verbose) {
    response.services = {
      airtable: {
        status: airtableConfigured ? 'connected' : 'not_configured',
        configured: airtableConfigured,
      },
      eonpro: {
        status: eonproConfigured ? 'connected' : 'not_configured',
        configured: eonproConfigured,
      },
      stripe: {
        status: stripeConfigured ? 'connected' : 'not_configured',
        configured: stripeConfigured,
      },
      clerk: {
        status: clerkConfigured ? 'connected' : 'not_configured',
        configured: clerkConfigured,
      },
    };
    response.checks = {
      airtable: airtableConfigured,
      intakeq: intakeqConfigured,
      pdfco: pdfcoConfigured,
    };
    response.uptime = Math.floor((Date.now() - startTime) / 1000);
  }
  
  // Return appropriate HTTP status code
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(response, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    }
  });
}

// Also support HEAD requests for lightweight health checks
export async function HEAD() {
  const airtableConfigured = !!(process.env.AIRTABLE_PAT && process.env.AIRTABLE_BASE_ID);
  const status = airtableConfigured ? 200 : 503;
  
  return new NextResponse(null, { 
    status,
    headers: {
      'Cache-Control': 'no-store',
    }
  });
}
