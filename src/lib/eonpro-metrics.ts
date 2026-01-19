/**
 * EONPRO Health Metrics
 * 
 * Tracks webhook performance metrics using Upstash Redis.
 * Provides real-time visibility into EONPRO integration health.
 * 
 * Metrics tracked:
 * - Success/failure counts (last 24h)
 * - Average latency
 * - Last health check status
 * - Queue depth
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client
const getRedis = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};

// Metrics keys
const KEYS = {
  SUCCESS_COUNT: 'eonpro:metrics:success:count',
  FAILURE_COUNT: 'eonpro:metrics:failure:count',
  LATENCY_SUM: 'eonpro:metrics:latency:sum',
  LATENCY_COUNT: 'eonpro:metrics:latency:count',
  LAST_SUCCESS: 'eonpro:metrics:last_success',
  LAST_FAILURE: 'eonpro:metrics:last_failure',
  LAST_HEALTH_CHECK: 'eonpro:health:last_check',
  HEALTH_STATUS: 'eonpro:health:status',
  HEALTH_LATENCY: 'eonpro:health:latency',
};

// TTL for metrics (24 hours)
const METRICS_TTL = 86400;

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: string | null;
  latencyMs: number | null;
  message?: string;
}

export interface EonproMetrics {
  successCount: number;
  failureCount: number;
  successRate: number;
  avgLatencyMs: number;
  lastSuccess: string | null;
  lastFailure: string | null;
  health: HealthStatus;
  queueDepth: number;
}

/**
 * Record a successful EONPRO submission
 */
export async function recordSuccess(latencyMs: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const now = new Date().toISOString();
  
  await Promise.all([
    redis.incr(KEYS.SUCCESS_COUNT),
    redis.expire(KEYS.SUCCESS_COUNT, METRICS_TTL),
    redis.incrby(KEYS.LATENCY_SUM, Math.round(latencyMs)),
    redis.expire(KEYS.LATENCY_SUM, METRICS_TTL),
    redis.incr(KEYS.LATENCY_COUNT),
    redis.expire(KEYS.LATENCY_COUNT, METRICS_TTL),
    redis.set(KEYS.LAST_SUCCESS, now),
  ]);
}

/**
 * Record a failed EONPRO submission
 */
export async function recordFailure(error: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const now = new Date().toISOString();
  
  await Promise.all([
    redis.incr(KEYS.FAILURE_COUNT),
    redis.expire(KEYS.FAILURE_COUNT, METRICS_TTL),
    redis.set(KEYS.LAST_FAILURE, JSON.stringify({ time: now, error })),
  ]);
}

/**
 * Record health check result
 */
export async function recordHealthCheck(
  healthy: boolean,
  latencyMs: number,
  message?: string
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const now = new Date().toISOString();
  const status = healthy 
    ? (latencyMs > 3000 ? 'degraded' : 'healthy')
    : 'unhealthy';

  await Promise.all([
    redis.set(KEYS.LAST_HEALTH_CHECK, now),
    redis.set(KEYS.HEALTH_STATUS, JSON.stringify({ status, message })),
    redis.set(KEYS.HEALTH_LATENCY, latencyMs),
  ]);
}

/**
 * Get current metrics
 */
export async function getMetrics(): Promise<EonproMetrics> {
  const redis = getRedis();
  
  if (!redis) {
    return {
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      avgLatencyMs: 0,
      lastSuccess: null,
      lastFailure: null,
      health: { status: 'unknown', lastCheck: null, latencyMs: null },
      queueDepth: 0,
    };
  }

  const [
    successCount,
    failureCount,
    latencySum,
    latencyCount,
    lastSuccess,
    lastFailure,
    lastHealthCheck,
    healthStatus,
    healthLatency,
    queueDepth,
  ] = await Promise.all([
    redis.get(KEYS.SUCCESS_COUNT),
    redis.get(KEYS.FAILURE_COUNT),
    redis.get(KEYS.LATENCY_SUM),
    redis.get(KEYS.LATENCY_COUNT),
    redis.get(KEYS.LAST_SUCCESS),
    redis.get(KEYS.LAST_FAILURE),
    redis.get(KEYS.LAST_HEALTH_CHECK),
    redis.get(KEYS.HEALTH_STATUS),
    redis.get(KEYS.HEALTH_LATENCY),
    redis.llen('eonpro:dlq'),
  ]);

  const success = Number(successCount) || 0;
  const failure = Number(failureCount) || 0;
  const total = success + failure;
  const avgLatency = latencyCount ? Math.round(Number(latencySum) / Number(latencyCount)) : 0;

  // Parse health status
  let health: HealthStatus = { status: 'unknown', lastCheck: null, latencyMs: null };
  if (healthStatus) {
    const parsed = typeof healthStatus === 'string' ? JSON.parse(healthStatus) : healthStatus;
    health = {
      status: parsed.status || 'unknown',
      lastCheck: lastHealthCheck as string || null,
      latencyMs: Number(healthLatency) || null,
      message: parsed.message,
    };
  }

  // Parse last failure
  let lastFailureTime: string | null = null;
  if (lastFailure) {
    try {
      const parsed = typeof lastFailure === 'string' ? JSON.parse(lastFailure) : lastFailure;
      lastFailureTime = parsed.time || null;
    } catch {
      lastFailureTime = null;
    }
  }

  return {
    successCount: success,
    failureCount: failure,
    successRate: total > 0 ? Math.round((success / total) * 100) : 100,
    avgLatencyMs: avgLatency,
    lastSuccess: lastSuccess as string || null,
    lastFailure: lastFailureTime,
    health,
    queueDepth: queueDepth || 0,
  };
}

/**
 * Reset metrics (for testing)
 */
export async function resetMetrics(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  await Promise.all(
    Object.values(KEYS).map(key => redis.del(key))
  );
}

/**
 * Check if metrics are configured
 */
export function isMetricsConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
