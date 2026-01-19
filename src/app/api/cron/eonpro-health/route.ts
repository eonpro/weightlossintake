/**
 * Cron Endpoint: EONPRO Health Monitor
 * 
 * Proactively checks EONPRO webhook health every 5 minutes.
 * Detects issues before they cause submission failures.
 * 
 * Schedule: Every 5 minutes (offset from queue processor)
 * 
 * Features:
 * - Ping EONPRO health endpoint
 * - Track latency metrics
 * - Alert on degraded/unhealthy status
 * - Store health history
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordHealthCheck, getMetrics, isMetricsConfigured } from '@/lib/eonpro-metrics';
import { getQueueStats } from '@/lib/dlq';

// Configuration
const EONPRO_WEBHOOK_URL = process.env.EONPRO_WEBHOOK_URL;
const EONPRO_WEBHOOK_SECRET = process.env.EONPRO_WEBHOOK_SECRET;
const CRON_SECRET = process.env.CRON_SECRET;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Thresholds
const LATENCY_WARNING_MS = 3000;  // 3 seconds
const LATENCY_CRITICAL_MS = 10000; // 10 seconds
const TIMEOUT_MS = 15000; // 15 second timeout

interface HealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  statusCode?: number;
  message: string;
}

/**
 * Perform health check against EONPRO
 */
async function checkEonproHealth(): Promise<HealthCheckResult> {
  if (!EONPRO_WEBHOOK_URL || !EONPRO_WEBHOOK_SECRET) {
    return {
      healthy: false,
      latencyMs: 0,
      message: 'EONPRO not configured',
    };
  }

  const startTime = Date.now();
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Send a minimal health check ping
    // Using the webhook URL with a special health check payload
    const response = await fetch(EONPRO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': EONPRO_WEBHOOK_SECRET,
        'x-health-check': 'true',
      },
      body: JSON.stringify({
        submissionId: `health-check-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        schemaVersion: '1.0',
        source: 'weightlossintake',
        healthCheck: true,
        data: {},
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    // Check response
    if (response.ok) {
      return {
        healthy: true,
        latencyMs,
        statusCode: response.status,
        message: latencyMs > LATENCY_WARNING_MS 
          ? `Slow response (${latencyMs}ms)` 
          : 'OK',
      };
    } else {
      return {
        healthy: false,
        latencyMs,
        statusCode: response.status,
        message: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        healthy: false,
        latencyMs: TIMEOUT_MS,
        message: `Timeout after ${TIMEOUT_MS}ms`,
      };
    }

    return {
      healthy: false,
      latencyMs,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send alert for unhealthy status
 */
async function sendHealthAlert(result: HealthCheckResult): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.log('[HEALTH] ⚠️ Alert (no Slack configured):', result.message);
    return;
  }

  const emoji = result.healthy ? '⚠️' : '🚨';
  const status = result.healthy ? 'DEGRADED' : 'UNHEALTHY';

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${emoji} EONPRO Health Alert`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*EONPRO Status: ${status}*\n` +
                    `• Latency: ${result.latencyMs}ms\n` +
                    `• Status Code: ${result.statusCode || 'N/A'}\n` +
                    `• Message: ${result.message}\n` +
                    `• Time: ${new Date().toISOString()}`
            }
          }
        ]
      }),
    });
  } catch (error) {
    console.error('[HEALTH] Failed to send Slack alert:', error);
  }
}

/**
 * GET - Return current health status and metrics
 */
export async function GET() {
  const metrics = await getMetrics();
  const queueStats = await getQueueStats();

  return NextResponse.json({
    service: 'eonpro-health-monitor',
    configured: isMetricsConfigured(),
    eonproConfigured: !!(EONPRO_WEBHOOK_URL && EONPRO_WEBHOOK_SECRET),
    metrics: {
      successRate: `${metrics.successRate}%`,
      avgLatency: `${metrics.avgLatencyMs}ms`,
      last24h: {
        success: metrics.successCount,
        failure: metrics.failureCount,
      },
      lastSuccess: metrics.lastSuccess,
      lastFailure: metrics.lastFailure,
    },
    health: metrics.health,
    queue: queueStats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST - Run health check (called by cron)
 */
export async function POST(request: NextRequest) {
  // Verify cron secret (if configured)
  if (CRON_SECRET) {
    const providedSecret = request.headers.get('x-cron-secret') || 
                          request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  console.log('[HEALTH] 🔍 Running EONPRO health check...');

  // Perform health check
  const result = await checkEonproHealth();
  
  // Record metrics
  if (isMetricsConfigured()) {
    await recordHealthCheck(result.healthy, result.latencyMs, result.message);
  }

  // Determine if we need to alert
  const shouldAlert = !result.healthy || result.latencyMs > LATENCY_CRITICAL_MS;
  
  if (shouldAlert) {
    console.log(`[HEALTH] ⚠️ ${result.healthy ? 'Degraded' : 'Unhealthy'}: ${result.message}`);
    await sendHealthAlert(result);
  } else {
    console.log(`[HEALTH] ✅ Healthy (${result.latencyMs}ms)`);
  }

  // Get current queue stats
  const queueStats = await getQueueStats();

  return NextResponse.json({
    success: true,
    health: {
      status: result.healthy 
        ? (result.latencyMs > LATENCY_WARNING_MS ? 'degraded' : 'healthy')
        : 'unhealthy',
      latencyMs: result.latencyMs,
      statusCode: result.statusCode,
      message: result.message,
    },
    queue: queueStats,
    alertSent: shouldAlert,
    timestamp: new Date().toISOString(),
  });
}
