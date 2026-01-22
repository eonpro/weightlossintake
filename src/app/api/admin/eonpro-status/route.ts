/**
 * Admin API: EONPRO Integration Status Dashboard
 * 
 * Provides a comprehensive view of the EONPRO integration health.
 * Used for monitoring and debugging.
 * 
 * Security: Requires Clerk authentication
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMetrics, isMetricsConfigured } from '@/lib/eonpro-metrics';
import { getQueueStats, getDeadLetters, isDLQConfigured } from '@/lib/dlq';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Verify Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Gather all status information
  const [metrics, queueStats, deadLetters] = await Promise.all([
    getMetrics(),
    getQueueStats(),
    getDeadLetters(),
  ]);

  // Calculate overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  const issues: string[] = [];

  // Check health status
  if (metrics.health.status === 'unhealthy') {
    overallStatus = 'unhealthy';
    issues.push('EONPRO webhook is unhealthy');
  } else if (metrics.health.status === 'degraded') {
    overallStatus = 'degraded';
    issues.push('EONPRO webhook is slow');
  }

  // Check success rate
  if (metrics.successRate < 95 && (metrics.successCount + metrics.failureCount) > 10) {
    if (metrics.successRate < 80) {
      overallStatus = 'unhealthy';
      issues.push(`Low success rate: ${metrics.successRate}%`);
    } else if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
      issues.push(`Success rate below target: ${metrics.successRate}%`);
    }
  }

  // Check queue depth
  if (queueStats.queueDepth > 10) {
    if (queueStats.queueDepth > 50) {
      overallStatus = 'unhealthy';
      issues.push(`High queue depth: ${queueStats.queueDepth}`);
    } else if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
      issues.push(`Queue depth elevated: ${queueStats.queueDepth}`);
    }
  }

  // Check dead letters
  if (deadLetters.length > 0) {
    if (deadLetters.length > 5) {
      overallStatus = 'unhealthy';
    } else if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
    issues.push(`${deadLetters.length} items in dead letter queue`);
  }

  return NextResponse.json({
    status: overallStatus,
    issues,
    configuration: {
      metricsConfigured: isMetricsConfigured(),
      dlqConfigured: isDLQConfigured(),
      eonproConfigured: !!(process.env.EONPRO_WEBHOOK_URL && process.env.EONPRO_WEBHOOK_SECRET),
      slackConfigured: !!process.env.SLACK_WEBHOOK_URL,
    },
    metrics: {
      successRate: `${metrics.successRate}%`,
      avgLatency: `${metrics.avgLatencyMs}ms`,
      last24h: {
        success: metrics.successCount,
        failure: metrics.failureCount,
        total: metrics.successCount + metrics.failureCount,
      },
      timestamps: {
        lastSuccess: metrics.lastSuccess,
        lastFailure: metrics.lastFailure,
      },
    },
    health: metrics.health,
    queue: {
      ...queueStats,
      deadLetters: deadLetters.length,
    },
    deadLetterSummary: deadLetters.slice(0, 5).map(item => ({
      id: item.id,
      sessionId: item.sessionId,
      attempts: item.attempts,
      firstFailedAt: item.firstFailedAt,
      lastError: item.lastError.substring(0, 100),
    })),
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST - Manual actions (retry dead letters, clear metrics, etc.)
 */
export async function POST(request: Request) {
  // Verify Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'retry_dead_letters':
        // This would move dead letters back to the main queue
        // Implementation depends on specific requirements
        return NextResponse.json({
          success: true,
          message: 'Dead letter retry not yet implemented',
        });

      case 'clear_metrics':
        // Reset metrics (use with caution)
        const { resetMetrics } = await import('@/lib/eonpro-metrics');
        await resetMetrics();
        return NextResponse.json({
          success: true,
          message: 'Metrics cleared',
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action',
          availableActions: ['retry_dead_letters', 'clear_metrics'],
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
