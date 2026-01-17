// =============================================================================
// DISTRIBUTED RATE LIMITING - Upstash Redis
// =============================================================================
// Provides production-grade rate limiting that works across serverless instances.
// Falls back to in-memory rate limiting if Upstash is not configured.
// =============================================================================

import { NextRequest } from 'next/server';
import { logger } from './logger';

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitConfig {
  limit: number; // Max requests per window
  window: number; // Window size in seconds
  identifier?: string; // Custom identifier (defaults to IP)
}

// =============================================================================
// UPSTASH REDIS CONFIGURATION
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_UPSTASH = !!(UPSTASH_URL && UPSTASH_TOKEN);

// =============================================================================
// IN-MEMORY FALLBACK (for development or when Upstash is not configured)
// =============================================================================

const memoryStore = new Map<string, { count: number; resetTime: number }>();

function inMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const record = memoryStore.get(key);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of memoryStore.entries()) {
      if (v.resetTime < now) {
        memoryStore.delete(k);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.floor((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.floor(record.resetTime / 1000),
    };
  }

  record.count++;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.floor(record.resetTime / 1000),
  };
}

// =============================================================================
// UPSTASH REDIS RATE LIMITING
// =============================================================================

async function upstashRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;

  try {
    // Use Upstash REST API for atomic rate limiting
    const response = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        // INCR the counter
        ['INCR', key],
        // Set expiry if this is a new key
        ['EXPIRE', key, windowSeconds, 'NX'],
        // Get TTL for reset time
        ['TTL', key],
      ]),
    });

    if (!response.ok) {
      throw new Error(`Upstash error: ${response.status}`);
    }

    const results = await response.json();
    const count = results[0]?.result || 1;
    const ttl = results[2]?.result || windowSeconds;
    const remaining = Math.max(0, limit - count);
    const reset = Math.floor(Date.now() / 1000) + ttl;

    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    // Log error and fall back to allowing the request
    logger.error('[Rate Limit] Upstash error:', error);
    return {
      success: true, // Fail open
      limit,
      remaining: limit,
      reset: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }
}

// =============================================================================
// MAIN RATE LIMIT FUNCTION
// =============================================================================

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window, identifier } = config;

  // Determine identifier (IP or custom)
  const id =
    identifier ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Convert window to milliseconds for in-memory, keep as seconds for Upstash
  const windowMs = window * 1000;

  if (USE_UPSTASH) {
    return upstashRateLimit(id, limit, window);
  }

  return inMemoryRateLimit(id, limit, windowMs);
}

// =============================================================================
// PRESET RATE LIMITERS
// =============================================================================

export const rateLimiters = {
  // API endpoints - strict
  api: (request: NextRequest) =>
    rateLimit(request, {
      limit: parseInt(process.env.API_RATE_LIMIT_MAX || '30', 10),
      window: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60', 10),
    }),

  // Airtable submissions - moderate
  airtable: (request: NextRequest) =>
    rateLimit(request, {
      limit: parseInt(process.env.AIRTABLE_RATE_LIMIT_MAX || '30', 10),
      window: parseInt(process.env.AIRTABLE_RATE_LIMIT_WINDOW_MS || '60000', 10) / 1000,
    }),

  // IntakeQ - strict (expensive operation)
  intakeq: (request: NextRequest) =>
    rateLimit(request, {
      limit: parseInt(process.env.INTAKEQ_RATE_LIMIT_MAX || '10', 10),
      window: parseInt(process.env.INTAKEQ_RATE_LIMIT_WINDOW_MS || '60000', 10) / 1000,
    }),

  // Stripe payments - very strict
  stripe: (request: NextRequest) =>
    rateLimit(request, {
      limit: 5,
      window: 60,
    }),

  // General page requests - lenient
  page: (request: NextRequest) =>
    rateLimit(request, {
      limit: 100,
      window: 60,
    }),
};

// =============================================================================
// HELPER: Add rate limit headers to response
// =============================================================================

export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toString());

  if (!result.success) {
    headers.set('Retry-After', '60');
  }
}

// =============================================================================
// STATUS CHECK
// =============================================================================

export function isUpstashConfigured(): boolean {
  return USE_UPSTASH;
}
