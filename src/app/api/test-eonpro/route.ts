import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// EONPRO WEBHOOK TEST ENDPOINT
// =============================================================================
// This endpoint allows manual testing of the EONPRO webhook integration
// 
// Usage:
//   POST /api/test-eonpro
//   Headers: x-admin-secret: YOUR_SECRET (required in production)
//   Body: { testMode: true } or { data: { firstName, lastName, ... } }
//
// Security:
//   - In production, requires x-admin-secret header matching ADMIN_SECRET env var
//   - In development, admin secret is optional
//   - Never sends real patient data unless explicitly provided
// =============================================================================

const EONPRO_WEBHOOK_URL = process.env.EONPRO_WEBHOOK_URL;
const EONPRO_WEBHOOK_SECRET = process.env.EONPRO_WEBHOOK_SECRET;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-admin-secret';
const isDev = process.env.NODE_ENV === 'development';

interface EonproTestResult {
  success: boolean;
  message: string;
  details?: {
    configured: boolean;
    webhookUrl?: string;
    hasSecret: boolean;
    testResponse?: unknown;
    responseStatus?: number;
    responseTime?: number;
    error?: string;
  };
}

// Generate test patient data
function generateTestData() {
  const timestamp = Date.now();
  return {
    submissionId: `test-${timestamp}`,
    submittedAt: new Date().toISOString(),
    source: 'weightlossintake-test',
    data: {
      // Use clearly fake test data
      firstName: 'TEST_DO_NOT_PROCESS',
      lastName: 'WebhookTest',
      email: `test-${timestamp}@eonmeds-webhook-test.invalid`,
      phone: '555-000-0000',
      dateOfBirth: '1990-01-01',
      gender: 'Test',
      
      // Address
      streetAddress: '123 Test Street',
      apartment: '',
      city: 'Test City',
      state: 'FL',
      zipCode: '00000',
      
      // Metadata
      submissionType: 'Test',
      qualified: 'Test',
      intakeNotes: 'AUTOMATED TEST - DO NOT PROCESS',
      language: 'en',
      intakeSource: 'eonmeds-intake-test',
      airtableRecordId: `test-${timestamp}`,
      
      // Test flag to help EONPRO identify test submissions
      isTestSubmission: true,
    },
  };
}

export async function POST(request: NextRequest) {
  // Verify admin secret in production
  const providedSecret = request.headers.get('x-admin-secret');
  
  if (!isDev && providedSecret !== ADMIN_SECRET) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized - invalid or missing x-admin-secret header',
    }, { status: 401 });
  }

  // Check configuration
  const isConfigured = !!(EONPRO_WEBHOOK_URL && EONPRO_WEBHOOK_SECRET);
  
  if (!isConfigured) {
    return NextResponse.json({
      success: false,
      message: 'EONPRO webhook not configured',
      details: {
        configured: false,
        webhookUrl: EONPRO_WEBHOOK_URL ? '[SET]' : '[MISSING]',
        hasSecret: !!EONPRO_WEBHOOK_SECRET,
      },
    }, { status: 500 });
  }

  // Parse request body
  let body: { testMode?: boolean; data?: Record<string, unknown> } = {};
  try {
    body = await request.json();
  } catch {
    body = { testMode: true };
  }

  // Generate or use provided test data
  const testData = body.data 
    ? {
        submissionId: `custom-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        source: 'weightlossintake-test',
        data: body.data,
      }
    : generateTestData();

  // Send test request to EONPRO
  const startTime = Date.now();
  
  try {
    console.log('[TEST-EONPRO] Sending test request to:', EONPRO_WEBHOOK_URL);
    console.log('[TEST-EONPRO] Submission ID:', testData.submissionId);
    
    const response = await fetch(EONPRO_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': EONPRO_WEBHOOK_SECRET!,
      },
      body: JSON.stringify(testData),
    });

    const responseTime = Date.now() - startTime;
    
    let responseBody: unknown;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    console.log('[TEST-EONPRO] Response status:', response.status);
    console.log('[TEST-EONPRO] Response time:', responseTime, 'ms');
    console.log('[TEST-EONPRO] Response body:', JSON.stringify(responseBody, null, 2));

    const result: EonproTestResult = {
      success: response.ok,
      message: response.ok 
        ? 'EONPRO webhook test successful!' 
        : `EONPRO webhook returned status ${response.status}`,
      details: {
        configured: true,
        webhookUrl: EONPRO_WEBHOOK_URL!.replace(/\/[^/]+$/, '/***'), // Hide path details
        hasSecret: true,
        testResponse: responseBody,
        responseStatus: response.status,
        responseTime: responseTime,
      },
    };

    return NextResponse.json(result, { 
      status: response.ok ? 200 : 502 
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('[TEST-EONPRO] Error:', error);

    return NextResponse.json({
      success: false,
      message: 'EONPRO webhook test failed - network error',
      details: {
        configured: true,
        webhookUrl: EONPRO_WEBHOOK_URL!.replace(/\/[^/]+$/, '/***'),
        hasSecret: true,
        responseTime: responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }, { status: 502 });
  }
}

// GET endpoint for configuration check (no actual webhook call)
export async function GET(request: NextRequest) {
  // Verify admin secret in production
  const providedSecret = request.headers.get('x-admin-secret');
  
  if (!isDev && providedSecret !== ADMIN_SECRET) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized',
    }, { status: 401 });
  }

  const isConfigured = !!(EONPRO_WEBHOOK_URL && EONPRO_WEBHOOK_SECRET);

  return NextResponse.json({
    success: true,
    message: isConfigured 
      ? 'EONPRO webhook is configured' 
      : 'EONPRO webhook is NOT configured',
    details: {
      configured: isConfigured,
      webhookUrl: EONPRO_WEBHOOK_URL 
        ? `${EONPRO_WEBHOOK_URL.substring(0, 30)}...` 
        : '[NOT SET]',
      hasSecret: !!EONPRO_WEBHOOK_SECRET,
      environment: process.env.NODE_ENV,
    },
  });
}
