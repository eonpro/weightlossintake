/**
 * Cron Endpoint: EONPRO Reconciliation
 * 
 * Daily job that compares Airtable records with EONPRO to ensure
 * all submissions are properly synced.
 * 
 * Schedule: Daily at 6 AM UTC
 * 
 * Features:
 * - Fetches recent Airtable records (last 24h)
 * - Sends batch to EONPRO reconciliation endpoint
 * - Updates Airtable with sync status
 * - Alerts on missing or mismatched records
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Intake Submissions';
const EONPRO_RECONCILIATION_URL = process.env.EONPRO_RECONCILIATION_URL || 'https://app.eonpro.io/api/integrations/reconciliation';
const EONPRO_WEBHOOK_SECRET = process.env.EONPRO_WEBHOOK_SECRET;
const CRON_SECRET = process.env.CRON_SECRET;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface AirtableRecord {
  id: string;
  fields: {
    'Email'?: string;
    'First Name'?: string;
    'Last Name'?: string;
    'EONPRO Patient ID'?: string;
    'EONPRO Sync Status'?: string;
    'Qualified'?: boolean;
  };
  createdTime: string;
}

interface ReconciliationResult {
  summary: {
    total: number;
    synced: number;
    missing: number;
    mismatch: number;
    syncRate: string;
  };
  results: {
    synced: Array<{ email: string; airtableId: string; eonproId: number }>;
    missing: Array<{ email: string; airtableId: string }>;
    mismatch: Array<{ email: string; airtableId: string; issue: string }>;
  };
}

/**
 * Fetch recent Airtable records for reconciliation
 */
async function getRecentAirtableRecords(hoursBack: number = 24): Promise<AirtableRecord[]> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable not configured');
  }

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
  
  // Fetch records created in the last N hours with an email
  const filterFormula = `AND(IS_AFTER(CREATED_TIME(), '${cutoffTime}'), {Email} != '')`;
  
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100`,
    {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`);
  }

  const data = await response.json();
  return data.records || [];
}

/**
 * Send records to EONPRO for reconciliation
 */
async function reconcileWithEonpro(records: AirtableRecord[]): Promise<ReconciliationResult> {
  if (!EONPRO_WEBHOOK_SECRET) {
    throw new Error('EONPRO webhook secret not configured');
  }

  const airtableRecords = records.map(record => ({
    email: record.fields['Email'] || '',
    airtableId: record.id,
    firstName: record.fields['First Name'],
    lastName: record.fields['Last Name'],
    eonproPatientId: record.fields['EONPRO Patient ID'],
  })).filter(r => r.email);

  const response = await fetch(EONPRO_RECONCILIATION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': EONPRO_WEBHOOK_SECRET,
    },
    body: JSON.stringify({ airtableRecords }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EONPRO reconciliation failed: ${response.status} - ${text}`);
  }

  return await response.json();
}

/**
 * Update Airtable records with sync status
 */
async function updateAirtableSyncStatus(
  recordId: string,
  eonproPatientId: number | string,
  status: 'Synced' | 'Missing' | 'Mismatch'
): Promise<void> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) return;

  try {
    await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'EONPRO Patient ID': String(eonproPatientId),
            'EONPRO Sync Status': status,
          }
        }),
      }
    );
  } catch (error) {
    console.error(`[RECONCILIATION] Failed to update Airtable record ${recordId}:`, error);
  }
}

/**
 * Send alert for reconciliation issues
 */
async function sendReconciliationAlert(result: ReconciliationResult): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.log('[RECONCILIATION] Alert (no Slack):', JSON.stringify(result.summary));
    return;
  }

  const emoji = result.summary.missing > 0 || result.summary.mismatch > 0 ? '🚨' : '✅';

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${emoji} EONPRO Daily Reconciliation`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Daily Reconciliation Report*\n` +
                    `• Total Records: ${result.summary.total}\n` +
                    `• Synced: ${result.summary.synced} ✅\n` +
                    `• Missing in EONPRO: ${result.summary.missing} ${result.summary.missing > 0 ? '⚠️' : ''}\n` +
                    `• Mismatched: ${result.summary.mismatch} ${result.summary.mismatch > 0 ? '⚠️' : ''}\n` +
                    `• Sync Rate: ${result.summary.syncRate}`
            }
          }
        ]
      }),
    });
  } catch (error) {
    console.error('[RECONCILIATION] Failed to send Slack alert:', error);
  }
}

/**
 * GET - Return recent reconciliation status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get('hours') || '24', 10);

  try {
    const records = await getRecentAirtableRecords(hours);
    
    const summary = {
      totalRecords: records.length,
      withEonproId: records.filter(r => r.fields['EONPRO Patient ID']).length,
      pending: records.filter(r => !r.fields['EONPRO Patient ID']).length,
      syncStatuses: {
        synced: records.filter(r => r.fields['EONPRO Sync Status'] === 'Synced').length,
        missing: records.filter(r => r.fields['EONPRO Sync Status'] === 'Missing').length,
        mismatch: records.filter(r => r.fields['EONPRO Sync Status'] === 'Mismatch').length,
      }
    };

    return NextResponse.json({
      service: 'eonpro-reconciliation',
      configured: !!(AIRTABLE_PAT && AIRTABLE_BASE_ID && EONPRO_WEBHOOK_SECRET),
      hoursBack: hours,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      service: 'eonpro-reconciliation',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST - Run reconciliation (called by cron or manually)
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

  console.log('[RECONCILIATION] 🔄 Starting daily reconciliation...');

  try {
    // Get request body for optional parameters
    let hoursBack = 24;
    try {
      const body = await request.json();
      hoursBack = body.hoursBack || 24;
    } catch {
      // No body, use default
    }

    // Fetch recent Airtable records
    const records = await getRecentAirtableRecords(hoursBack);
    console.log(`[RECONCILIATION] Found ${records.length} records to reconcile`);

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No records to reconcile',
        hoursBack,
        timestamp: new Date().toISOString(),
      });
    }

    // Send to EONPRO for reconciliation
    const result = await reconcileWithEonpro(records);
    console.log(`[RECONCILIATION] Result: ${result.summary.synced}/${result.summary.total} synced`);

    // Update Airtable with results
    for (const synced of result.results.synced) {
      await updateAirtableSyncStatus(synced.airtableId, synced.eonproId, 'Synced');
    }
    
    for (const missing of result.results.missing) {
      await updateAirtableSyncStatus(missing.airtableId, '', 'Missing');
    }
    
    for (const mismatch of result.results.mismatch) {
      await updateAirtableSyncStatus(mismatch.airtableId, '', 'Mismatch');
    }

    // Send alert if there are issues
    if (result.summary.missing > 0 || result.summary.mismatch > 0) {
      await sendReconciliationAlert(result);
    }

    return NextResponse.json({
      success: true,
      ...result,
      hoursBack,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[RECONCILIATION] ❌ Failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
