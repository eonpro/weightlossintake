import { NextResponse } from 'next/server';

/**
 * API v1 Health Check
 * 
 * Provides detailed health status for the API.
 * This is the v1 version with enhanced service status.
 */

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  configured: boolean;
  latency?: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  services: {
    airtable: ServiceStatus;
    eonpro: ServiceStatus;
    stripe: ServiceStatus;
    clerk: ServiceStatus;
    upstash: ServiceStatus;
  };
}

const startTime = Date.now();

export async function GET() {
  const airtableConfigured = !!(process.env.AIRTABLE_PAT && process.env.AIRTABLE_BASE_ID);
  const eonproConfigured = !!(process.env.EONPRO_WEBHOOK_URL && process.env.EONPRO_WEBHOOK_SECRET);
  const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const clerkConfigured = !!(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const upstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

  const allCriticalConfigured = airtableConfigured && clerkConfigured;
  const status: HealthResponse['status'] = allCriticalConfigured 
    ? 'healthy' 
    : airtableConfigured || clerkConfigured 
      ? 'degraded' 
      : 'unhealthy';

  const response: HealthResponse = {
    status,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      airtable: {
        status: airtableConfigured ? 'operational' : 'down',
        configured: airtableConfigured,
      },
      eonpro: {
        status: eonproConfigured ? 'operational' : 'down',
        configured: eonproConfigured,
      },
      stripe: {
        status: stripeConfigured ? 'operational' : 'down',
        configured: stripeConfigured,
      },
      clerk: {
        status: clerkConfigured ? 'operational' : 'down',
        configured: clerkConfigured,
      },
      upstash: {
        status: upstashConfigured ? 'operational' : 'down',
        configured: upstashConfigured,
      },
    },
  };

  return NextResponse.json(response, {
    status: status === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
