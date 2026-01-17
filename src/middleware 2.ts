// =============================================================================
// NEXT.JS MIDDLEWARE - Security & Observability
// =============================================================================
// Runs on every request before it reaches the route handler
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

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

// Rate limit configuration (simple in-memory for middleware)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per IP per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// =============================================================================
// MIDDLEWARE FUNCTION
// =============================================================================

export function middleware(request: NextRequest) {
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
  // RATE LIMITING (Simple in-memory for edge middleware)
  // For production, use Upstash Redis for distributed rate limiting
  // ==========================================================================
  if (process.env.ENABLE_MIDDLEWARE_RATE_LIMIT === 'true') {
    const now = Date.now();
    const record = rateLimitMap.get(clientIp);
    
    if (!record || record.resetTime < now) {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'RATE_LIMITED',
        requestId,
        ip: clientIp,
        pathname,
      }));
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-Request-Id': requestId,
        },
      });
    } else {
      record.count++;
    }
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.resetTime < now) {
          rateLimitMap.delete(key);
        }
      }
    }
  }

  // ==========================================================================
  // ADD REQUEST HEADERS
  // ==========================================================================
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-request-start', startTime.toString());

  // ==========================================================================
  // PROCESS REQUEST
  // ==========================================================================
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ==========================================================================
  // ADD RESPONSE HEADERS
  // ==========================================================================
  
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

  // ==========================================================================
  // LOG REQUEST (structured JSON for observability)
  // ==========================================================================
  if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
    // Only log in production or when explicitly enabled
    const duration = Date.now() - startTime;
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'REQUEST',
      requestId,
      method: request.method,
      pathname,
      ip: clientIp,
      userAgent: userAgent.substring(0, 100), // Truncate for brevity
      duration,
      // Never log query params as they might contain PHI
    }));
  }

  return response;
}

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
