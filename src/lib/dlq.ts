/**
 * Dead Letter Queue (DLQ) for EONPRO Webhook
 * 
 * Uses Upstash Redis to store failed submissions for retry.
 * Failed EONPRO webhooks are queued here and processed by a cron job.
 * 
 * Features:
 * - Persistent queue (survives serverless cold starts)
 * - Exponential backoff (1min, 2min, 4min, 8min...)
 * - Max 10 retry attempts
 * - Automatic cleanup after success
 * - Alert on exhaustion
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (uses env vars automatically)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Queue configuration
const QUEUE_KEY = 'eonpro:dlq';
const MAX_RETRIES = 10;
const INITIAL_BACKOFF_MS = 60000; // 1 minute

// Types
export interface DLQItem {
  id: string;
  airtableRecordId: string;
  sessionId: string;
  payload: Record<string, unknown>;
  attempts: number;
  firstFailedAt: string;
  lastFailedAt: string;
  lastError: string;
  nextRetryAt: string;
}

export interface DLQStats {
  queueDepth: number;
  oldestItem: string | null;
  itemsReadyForRetry: number;
}

/**
 * Check if DLQ is configured
 */
export function isDLQConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Add a failed submission to the queue
 */
export async function queueFailedSubmission(
  airtableRecordId: string,
  sessionId: string,
  payload: Record<string, unknown>,
  error: string
): Promise<string> {
  if (!isDLQConfigured()) {
    console.warn('[DLQ] Not configured, skipping queue');
    return '';
  }

  const id = `dlq-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();
  const nextRetry = new Date(Date.now() + INITIAL_BACKOFF_MS).toISOString();

  const item: DLQItem = {
    id,
    airtableRecordId,
    sessionId,
    payload,
    attempts: 1,
    firstFailedAt: now,
    lastFailedAt: now,
    lastError: error,
    nextRetryAt: nextRetry,
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(item));
  
  console.log(`[DLQ] ✅ Queued submission ${id} for retry at ${nextRetry}`);
  
  return id;
}

/**
 * Get all items ready for retry (nextRetryAt <= now)
 */
export async function getItemsReadyForRetry(): Promise<DLQItem[]> {
  if (!isDLQConfigured()) {
    return [];
  }

  const now = new Date().toISOString();
  const allItems = await redis.lrange(QUEUE_KEY, 0, -1);
  
  const readyItems: DLQItem[] = [];
  
  for (const itemStr of allItems) {
    try {
      const item = typeof itemStr === 'string' ? JSON.parse(itemStr) : itemStr as DLQItem;
      if (item.nextRetryAt <= now) {
        readyItems.push(item);
      }
    } catch (e) {
      console.error('[DLQ] Failed to parse item:', e);
    }
  }
  
  return readyItems;
}

/**
 * Update an item after a retry attempt
 */
export async function updateItemAfterRetry(
  item: DLQItem,
  success: boolean,
  error?: string
): Promise<void> {
  if (!isDLQConfigured()) {
    return;
  }

  // Remove old item from queue
  const allItems = await redis.lrange(QUEUE_KEY, 0, -1);
  for (const itemStr of allItems) {
    try {
      const existingItem = typeof itemStr === 'string' ? JSON.parse(itemStr) : itemStr as DLQItem;
      if (existingItem.id === item.id) {
        await redis.lrem(QUEUE_KEY, 1, typeof itemStr === 'string' ? itemStr : JSON.stringify(itemStr));
        break;
      }
    } catch (e) {
      // Skip malformed items
    }
  }

  if (success) {
    console.log(`[DLQ] ✅ Successfully processed ${item.id} after ${item.attempts} attempts`);
    // Don't re-add - item is done!
    return;
  }

  // Check if we've exhausted retries
  const newAttempts = item.attempts + 1;
  
  if (newAttempts > MAX_RETRIES) {
    console.error(`[DLQ] 💀 EXHAUSTED: ${item.id} failed after ${MAX_RETRIES} attempts`);
    // Move to dead letter (permanent failure)
    await redis.lpush('eonpro:dead', JSON.stringify({
      ...item,
      attempts: newAttempts,
      lastError: error || item.lastError,
      exhaustedAt: new Date().toISOString(),
    }));
    return;
  }

  // Calculate next retry with exponential backoff
  const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, newAttempts - 1);
  const nextRetry = new Date(Date.now() + backoffMs).toISOString();

  const updatedItem: DLQItem = {
    ...item,
    attempts: newAttempts,
    lastFailedAt: new Date().toISOString(),
    lastError: error || item.lastError,
    nextRetryAt: nextRetry,
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(updatedItem));
  
  console.log(`[DLQ] 🔄 Requeued ${item.id} for attempt ${newAttempts}/${MAX_RETRIES} at ${nextRetry}`);
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<DLQStats> {
  if (!isDLQConfigured()) {
    return { queueDepth: 0, oldestItem: null, itemsReadyForRetry: 0 };
  }

  const allItems = await redis.lrange(QUEUE_KEY, 0, -1);
  const now = new Date().toISOString();
  
  let oldestItem: string | null = null;
  let itemsReadyForRetry = 0;
  
  for (const itemStr of allItems) {
    try {
      const item = typeof itemStr === 'string' ? JSON.parse(itemStr) : itemStr as DLQItem;
      
      if (!oldestItem || item.firstFailedAt < oldestItem) {
        oldestItem = item.firstFailedAt;
      }
      
      if (item.nextRetryAt <= now) {
        itemsReadyForRetry++;
      }
    } catch (e) {
      // Skip malformed items
    }
  }
  
  return {
    queueDepth: allItems.length,
    oldestItem,
    itemsReadyForRetry,
  };
}

/**
 * Get items in the permanent failure queue (dead letters)
 */
export async function getDeadLetters(): Promise<DLQItem[]> {
  if (!isDLQConfigured()) {
    return [];
  }

  const items = await redis.lrange('eonpro:dead', 0, -1);
  return items.map(item => 
    typeof item === 'string' ? JSON.parse(item) : item as DLQItem
  );
}

/**
 * Clear the queue (use with caution!)
 */
export async function clearQueue(): Promise<void> {
  if (!isDLQConfigured()) {
    return;
  }

  await redis.del(QUEUE_KEY);
  console.log('[DLQ] ⚠️ Queue cleared');
}

/**
 * Health check - verify Redis connection
 */
export async function healthCheck(): Promise<{ healthy: boolean; error?: string }> {
  if (!isDLQConfigured()) {
    return { healthy: false, error: 'DLQ not configured' };
  }

  try {
    await redis.ping();
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
