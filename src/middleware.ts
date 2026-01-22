// =============================================================================
// NEXT.JS MIDDLEWARE - Security, Auth & Observability
// =============================================================================
// Runs on every request before it reaches the route handler
// Integrates Clerk authentication for protected routes
// Uses Upstash Redis for distributed rate limiting (works in serverless)
// =============================================================================

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// =============================================================================
// ROUTE MATCHERS
// =============================================================================

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/intake(.*)',
  '/v2/intake(.*)',
  '/checkout(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/airtable(.*)',
  '/api/stripe/webhook',
  '/api/emr(.*)',
  '/api/intakeq(.*)',
  '/api/client-info',
]);

// Admin routes that require authentication
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

// API routes that should have stricter rate limits
const isApiRoute = createRouteMatcher([
  '/api/(.*)',
]);

// =============================================================================
// CONFIGURATION
// =============================================================================

// Generate a unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// List of blocked user agents (bots, scrapers, etc.)
const BLOCKED_USER_AGENTS = [
  'Scrapy',
  'python-requests',
  'curl',
  'wget',
  // Add more as needed
];

// =============================================================================
// UPSTASH RATE LIMITING (Distributed - works across serverless instances)
// =============================================================================

// Check if Upstash is configured
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_UPSTASH = !!(UPSTASH_URL && UPSTASH_TOKEN);

// Create rate limiters (only if Upstash is configured)
let generalRatelimit: Ratelimit | null = null;
let apiRatelimit: Ratelimit | null = null;

if (USE_UPSTASH) {
  const redis = new Redis({
    url: UPSTASH_URL,
    token: UPSTASH_TOKEN,
  });

  // General rate limit: 100 requests per minute per IP
  generalRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:general',
  });

  // API rate limit: 30 requests per minute per IP (stricter)
  apiRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  });
}

// In-memory fallback for development (when Upstash not configured)
const memoryRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

function inMemoryRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = memoryRateLimitMap.get(ip);

  // Cleanup old entries occasionally
  if (Math.random() < 0.01) {
    for (const [key, value] of memoryRateLimitMap.entries()) {
      if (value.resetTime < now) memoryRateLimitMap.delete(key);
    }
  }

  if (!record || record.resetTime < now) {
    memoryRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { success: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// =============================================================================
// CLERK MIDDLEWARE WITH CUSTOM LOGIC
// =============================================================================

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // ==========================================================================
  // SECURITY: Block suspicious user agents (optional, lightweight check)
  // ==========================================================================
  if (process.env.NODE_ENV === 'production') {
    const isBlockedAgent = BLOCKED_USER_AGENTS.some(
      (agent) => userAgent.toLowerCase().includes(agent.toLowerCase())
    );
    
    if (isBlockedAgent && !pathname.startsWith('/api/health')) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'BLOCKED_USER_AGENT',
        requestId,
        ip: clientIp,
        userAgent,
        pathname,
      }));
      
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // ==========================================================================
  // RATE LIMITING (Distributed via Upstash, with in-memory fallback)
  // ==========================================================================
  if (process.env.ENABLE_MIDDLEWARE_RATE_LIMIT === 'true') {
    let rateLimitResult: { success: boolean; remaining: number; reset?: number };

    if (USE_UPSTASH) {
      // Use stricter rate limit for API routes
      const limiter = isApiRoute(request) ? apiRatelimit : generalRatelimit;
      if (limiter) {
        const result = await limiter.limit(clientIp);
        rateLimitResult = {
          success: result.success,
          remaining: result.remaining,
          reset: result.reset,
        };
      } else {
        rateLimitResult = { success: true, remaining: 100 };
      }
    } else {
      // Fallback to in-memory for development
      rateLimitResult = inMemoryRateLimit(clientIp);
    }

    if (!rateLimitResult.success) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'RATE_LIMITED',
        requestId,
        ip: clientIp,
        pathname,
        distributed: USE_UPSTASH,
      }));
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-Request-Id': requestId,
          'X-RateLimit-Remaining': '0',
          ...(rateLimitResult.reset && { 'X-RateLimit-Reset': rateLimitResult.reset.toString() }),
        },
      });
    }
  }

  // ==========================================================================
  // AUTHENTICATION CHECK
  // ==========================================================================

  // Protect admin routes - require authentication
  if (isAdminRoute(request)) {
    await auth.protect();
  }

  // ==========================================================================
  // LOG REQUEST (structured JSON for observability)
  // ==========================================================================
  if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
    const duration = Date.now() - startTime;

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'REQUEST',
      requestId,
      method: request.method,
      pathname,
      ip: clientIp,
      userAgent: userAgent.substring(0, 100),
      duration,
      authenticated: !isPublicRoute(request),
    }));
  }

  // ==========================================================================
  // ADD CUSTOM HEADERS TO RESPONSE
  // ==========================================================================
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Request tracing
  response.headers.set('x-request-id', requestId);
  
  // Security headers (additional to vercel.json)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Cache control for dynamic pages
  if (pathname.startsWith('/intake') || pathname.startsWith('/v2/intake')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});

// =============================================================================
// MIDDLEWARE MATCHER
// =============================================================================
// Configure which paths the middleware runs on

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
