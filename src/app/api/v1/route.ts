import { NextResponse } from 'next/server';

/**
 * API v1 Root - Returns API information
 * 
 * This is the entry point for the v1 API.
 * All new API endpoints should be created under /api/v1/
 */
export async function GET() {
  return NextResponse.json({
    api: 'EONMeds Intake API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      health: '/api/v1/health',
      intake: '/api/v1/intake',
      webhooks: '/api/v1/webhooks/*',
    },
    deprecation: {
      notice: 'Legacy endpoints at /api/* will be deprecated in v2',
      migrationGuide: '/docs/api-migration.md',
    },
  });
}
