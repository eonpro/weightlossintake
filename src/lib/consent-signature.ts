/**
 * E-Signature Consent Tracking System
 * 
 * Captures legally-binding consent signatures including:
 * - IP address
 * - Timestamp
 * - User agent (browser/device)
 * - Geolocation (from IP)
 * 
 * Used for: Terms & Conditions, Privacy Policy, Telehealth Consent,
 * SMS/Email Consent, Cancellation Policy, Weight Loss Treatment Consent
 */

// Consent types we track
export type ConsentType = 
  | 'privacy_policy'
  | 'terms_of_service'
  | 'telehealth_consent'
  | 'sms_consent'
  | 'email_consent'
  | 'cancellation_policy'
  | 'weight_loss_treatment_consent'
  | 'florida_bill_of_rights'
  | 'hipaa_authorization';

export interface GeoLocation {
  ip: string;
  city: string;
  region: string;        // State/Province
  regionCode: string;    // e.g., "FL"
  country: string;
  countryCode: string;   // e.g., "US"
  timezone: string;
  isp: string;
  org: string;
}

export interface ConsentSignature {
  consentType: ConsentType;
  accepted: boolean;
  timestamp: string;      // ISO 8601 format
  ip: string;
  userAgent: string;
  geoLocation?: GeoLocation;
  signatureHash: string;  // Unique hash for verification
}

export interface AllConsents {
  signatures: ConsentSignature[];
  summary: {
    totalAccepted: number;
    ip: string;
    firstConsentAt: string;
    lastConsentAt: string;
    geoLocation?: GeoLocation;
  };
}

/**
 * Generate a unique signature hash for verification
 * Combines: consentType + timestamp + ip + userAgent
 */
export function generateSignatureHash(
  consentType: string,
  timestamp: string,
  ip: string,
  userAgent: string
): string {
  const data = `${consentType}|${timestamp}|${ip}|${userAgent}`;
  // Simple hash - in production you might want crypto.subtle
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `sig_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

/**
 * Fetch geolocation data from IP address
 * Uses ip-api.com (free, no API key needed, 45 req/min limit)
 */
export async function getGeoLocationFromIP(ip: string): Promise<GeoLocation | null> {
  // Don't lookup localhost/private IPs
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,timezone,isp,org,query`);
    
    if (!response.ok) {
      console.warn('[GeoIP] Failed to fetch:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      console.warn('[GeoIP] API error:', data.message);
      return null;
    }

    return {
      ip: data.query || ip,
      city: data.city || '',
      region: data.regionName || '',
      regionCode: data.region || '',
      country: data.country || '',
      countryCode: data.countryCode || '',
      timezone: data.timezone || '',
      isp: data.isp || '',
      org: data.org || '',
    };
  } catch (error) {
    console.error('[GeoIP] Exception:', error);
    return null;
  }
}

/**
 * Create a consent signature record
 */
export function createConsentSignature(
  consentType: ConsentType,
  ip: string,
  userAgent: string,
  geoLocation?: GeoLocation | null
): ConsentSignature {
  const timestamp = new Date().toISOString();
  
  return {
    consentType,
    accepted: true,
    timestamp,
    ip,
    userAgent,
    geoLocation: geoLocation || undefined,
    signatureHash: generateSignatureHash(consentType, timestamp, ip, userAgent),
  };
}

/**
 * Format consent signatures for Airtable storage
 * Returns a formatted string with all consent details
 */
export function formatConsentsForAirtable(consents: ConsentSignature[]): string {
  if (consents.length === 0) return '';

  const lines = consents.map(c => {
    const geo = c.geoLocation 
      ? `${c.geoLocation.city}, ${c.geoLocation.regionCode}, ${c.geoLocation.countryCode}`
      : 'Unknown location';
    return `[${c.consentType}] Accepted: ${c.timestamp} | IP: ${c.ip} | Location: ${geo} | Sig: ${c.signatureHash}`;
  });

  return lines.join('\n');
}

/**
 * Format consent signatures for EONPRO
 * Returns structured data for API
 */
export function formatConsentsForEonpro(consents: ConsentSignature[]): Record<string, unknown> {
  const consentData: Record<string, unknown> = {};

  for (const consent of consents) {
    const key = consent.consentType.replace(/_/g, '');
    consentData[`${key}Accepted`] = consent.accepted;
    consentData[`${key}Timestamp`] = consent.timestamp;
    consentData[`${key}IP`] = consent.ip;
    consentData[`${key}Signature`] = consent.signatureHash;
  }

  // Add summary info
  if (consents.length > 0) {
    const first = consents[0];
    consentData['consentIP'] = first.ip;
    consentData['consentUserAgent'] = first.userAgent;
    
    if (first.geoLocation) {
      consentData['consentCity'] = first.geoLocation.city;
      consentData['consentRegion'] = first.geoLocation.region;
      consentData['consentRegionCode'] = first.geoLocation.regionCode;
      consentData['consentCountry'] = first.geoLocation.country;
      consentData['consentCountryCode'] = first.geoLocation.countryCode;
      consentData['consentTimezone'] = first.geoLocation.timezone;
      consentData['consentISP'] = first.geoLocation.isp;
    }
  }

  return consentData;
}

/**
 * Consent type labels for display
 */
export const CONSENT_LABELS: Record<ConsentType, string> = {
  privacy_policy: 'Privacy Policy',
  terms_of_service: 'Terms of Service',
  telehealth_consent: 'Telehealth Consent',
  sms_consent: 'SMS Communications Consent',
  email_consent: 'Email Communications Consent',
  cancellation_policy: 'Cancellation Policy',
  weight_loss_treatment_consent: 'Weight Loss Treatment Consent',
  florida_bill_of_rights: 'Florida Patient Bill of Rights',
  hipaa_authorization: 'HIPAA Authorization',
};
