/**
 * EMR Health Check Endpoint
 * 
 * GET /api/emr/health
 * 
 * Tests connectivity to the EMR system and returns status.
 * Useful for monitoring and debugging integration issues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { emrClient, isEMRConfigured } from '@/lib/emr-client';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://intake.eonmeds.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: NextRequest) {
  // Check basic configuration
  const configStatus = emrClient.getConfigStatus();

  if (!configStatus.configured) {
    return NextResponse.json({
      status: 'not_configured',
      configured: false,
      hasUrl: configStatus.hasUrl,
      hasAuth: configStatus.hasAuth,
      message: 'EMR integration is not configured. Set EMR_API_URL and EMR_API_KEY environment variables.',
      envVarsNeeded: [
        'EMR_API_URL or EONPRO_WEBHOOK_URL',
        'EMR_API_KEY or EONPRO_WEBHOOK_SECRET',
      ],
    }, { headers: corsHeaders });
  }

  // Try to ping the EMR
  try {
    const healthResult = await emrClient.healthCheck();

    if (healthResult.success) {
      return NextResponse.json({
        status: 'healthy',
        configured: true,
        emrStatus: healthResult.data?.status || 'ok',
        emrVersion: healthResult.data?.version,
        timestamp: new Date().toISOString(),
      }, { headers: corsHeaders });
    }

    // EMR is configured but health check failed
    return NextResponse.json({
      status: 'unhealthy',
      configured: true,
      error: healthResult.error,
      message: 'EMR is configured but health check failed. The EMR server may be down or the API endpoint may not exist.',
      timestamp: new Date().toISOString(),
    }, { 
      status: 503,
      headers: corsHeaders 
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
