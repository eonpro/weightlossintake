/**
 * Client Info API
 * 
 * Returns the client's IP address and geolocation data.
 * Used for consent e-signature tracking.
 * 
 * This endpoint is called by the frontend when user accepts consents
 * to capture their IP and location for legal record-keeping.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGeoLocationFromIP, GeoLocation } from '@/lib/consent-signature';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  // Vercel/Cloudflare headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Cloudflare specific
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

/**
 * GET /api/client-info
 * Returns client IP and geolocation
 */
export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Fetch geolocation data
  let geoLocation: GeoLocation | null = null;
  
  try {
    geoLocation = await getGeoLocationFromIP(ip);
  } catch (error) {
    console.error('[ClientInfo] GeoIP error:', error);
  }

  return NextResponse.json({
    ip,
    userAgent,
    geoLocation,
    timestamp: new Date().toISOString(),
  }, { headers: corsHeaders });
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
