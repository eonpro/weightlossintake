/**
 * Cron Endpoint: Process EONPRO Dead Letter Queue
 * 
 * This endpoint is called by Vercel Cron or an external scheduler
 * to retry failed EONPRO webhook submissions.
 * 
 * Schedule: Every 5 minutes
 * 
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getItemsReadyForRetry,
  updateItemAfterRetry,
  getQueueStats,
  healthCheck,
  isDLQConfigured,
  DLQItem,
} from '@/lib/dlq';

// EONPRO Configuration (same as in /api/airtable)
const EONPRO_WEBHOOK_URL = process.env.EONPRO_WEBHOOK_URL;
const EONPRO_WEBHOOK_SECRET = process.env.EONPRO_WEBHOOK_SECRET;
const CRON_SECRET = process.env.CRON_SECRET;

// Slack webhook for alerts (optional)
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const ALERT_EMAIL = process.env.ALERT_EMAIL;

interface EonproResponse {
  success: boolean;
  data?: {
    patientId?: number;
  };
  error?: string;
  message?: string;
}

/**
 * Send a single item to EONPRO
 */
async function sendToEonpro(payload: Record<string, unknown>): Promise<EonproResponse> {
  if (!EONPRO_WEBHOOK_URL || !EONPRO_WEBHOOK_SECRET) {
    return { success: false, error: 'EONPRO not configured' };
  }

  try {
    const response = await fetch(EONPRO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': EONPRO_WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch {
      return { 
        success: response.ok, 
        error: response.ok ? undefined : `HTTP ${response.status}: ${responseText.substring(0, 100)}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

/**
 * Send alert to Slack (if configured)
 */
async function sendAlert(message: string, item: DLQItem): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.log(`[DLQ-ALERT] ${message}`, { sessionId: item.sessionId, airtableId: item.airtableRecordId });
    return;
  }

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 EONPRO DLQ Alert`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${message}*\n` +
                    `• Session ID: \`${item.sessionId}\`\n` +
                    `• Airtable ID: \`${item.airtableRecordId}\`\n` +
                    `• Attempts: ${item.attempts}\n` +
                    `• First Failed: ${item.firstFailedAt}\n` +
                    `• Last Error: ${item.lastError.substring(0, 200)}`
            }
          }
        ]
      }),
    });
  } catch (error) {
    console.error('[DLQ-ALERT] Failed to send Slack alert:', error);
  }
}

/**
 * Process the queue - GET for health check, POST for processing
 */
export async function GET(request: NextRequest) {
  // Health check - no auth required
  const health = await healthCheck();
  const stats = await getQueueStats();

  return NextResponse.json({
    service: 'eonpro-dlq-processor',
    configured: isDLQConfigured(),
    redis: health,
    queue: stats,
    eonproConfigured: !!(EONPRO_WEBHOOK_URL && EONPRO_WEBHOOK_SECRET),
    timestamp: new Date().toISOString(),
  });
}

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

  // Check if DLQ is configured
  if (!isDLQConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'DLQ not configured',
      message: 'Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to environment',
    }, { status: 503 });
  }

  // Check if EONPRO is configured
  if (!EONPRO_WEBHOOK_URL || !EONPRO_WEBHOOK_SECRET) {
    return NextResponse.json({
      success: false,
      error: 'EONPRO not configured',
      message: 'Add EONPRO_WEBHOOK_URL and EONPRO_WEBHOOK_SECRET to environment',
    }, { status: 503 });
  }

  console.log('[DLQ] 🔄 Starting queue processing...');

  // Get items ready for retry
  const items = await getItemsReadyForRetry();
  
  if (items.length === 0) {
    console.log('[DLQ] ✅ Queue empty, nothing to process');
    return NextResponse.json({
      success: true,
      processed: 0,
      message: 'Queue empty',
    });
  }

  console.log(`[DLQ] Found ${items.length} items ready for retry`);

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    exhausted: 0,
    errors: [] as string[],
  };

  // Process each item
  for (const item of items) {
    results.processed++;
    
    console.log(`[DLQ] Processing ${item.id} (attempt ${item.attempts + 1}/10)...`);
    
    const response = await sendToEonpro(item.payload);
    
    if (response.success) {
      results.succeeded++;
      await updateItemAfterRetry(item, true);
      console.log(`[DLQ] ✅ ${item.id} succeeded!`);
    } else {
      results.failed++;
      const error = response.error || response.message || 'Unknown error';
      
      // Check if this will exhaust retries
      if (item.attempts + 1 >= 10) {
        results.exhausted++;
        await sendAlert('Submission EXHAUSTED all retries', item);
      }
      
      await updateItemAfterRetry(item, false, error);
      results.errors.push(`${item.id}: ${error}`);
      console.log(`[DLQ] ❌ ${item.id} failed: ${error}`);
    }

    // Small delay between items to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Get updated stats
  const stats = await getQueueStats();

  console.log(`[DLQ] 📊 Completed: ${results.succeeded}/${results.processed} succeeded, ${stats.queueDepth} remaining`);

  return NextResponse.json({
    success: true,
    ...results,
    queueDepth: stats.queueDepth,
    timestamp: new Date().toISOString(),
  });
}
