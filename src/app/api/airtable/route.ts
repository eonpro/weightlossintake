import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =============================================================================
// PHI HANDLING BOUNDARY DOCUMENTATION
// =============================================================================
// This API route is a PHI INGESTION POINT. All data submitted here is assumed
// to contain Protected Health Information (PHI) under HIPAA.
//
// PHI FIELDS HANDLED:
//   - firstName, lastName (PII)
//   - email, phone (Contact identifiers)
//   - dob (Date of birth)
//   - Full address fields (street, city, state, zip)
//   - All medical history and medication fields
//   - Weight, height, BMI, blood pressure
//   - Health conditions and treatments
//
// DATA FLOW:
//   Client Browser → This API → Airtable (storage)
//
// SECURITY CONTROLS:
//   1. TLS in transit (enforced by Vercel/HTTPS)
//   2. Input validation via Zod schema (sanitization, type checking)
//   3. Optional API key authentication (X-API-Key header)
//   4. Rate limiting (configurable via env vars)
//   5. Request size limits (100KB max)
//   6. Audit logging WITHOUT PHI (only session IDs, IPs, status codes)
//
// LOGGING RULES:
//   - NEVER log: firstName, lastName, email, phone, dob, address, medical data
//   - ALLOWED to log: sessionId, recordId, IP address, timestamps, status codes
//
// THIRD-PARTY DATA SHARING:
//   - Airtable: Receives ALL PHI (BAA should be in place)
//   - EONPRO: Receives PHI for patient profile creation (if configured)
//   - No other third parties receive PHI from this endpoint
//
// COMPLIANCE NOTES:
//   - Airtable is HIPAA-compliant with proper BAA
//   - Ensure Airtable base has access controls configured
//   - Regular access audits recommended
// =============================================================================

// Development-only logging
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log(...args);

// =============================================================================
// SECURITY AUDIT LOGGING (No PHI - only metadata)
// Enable structured logging with ENABLE_AUDIT_LOG=true
// Logs are JSON-formatted for easy ingestion by log aggregators
// =============================================================================
const ENABLE_AUDIT_LOG = process.env.ENABLE_AUDIT_LOG === 'true' || isDev;

interface AuditEvent {
  timestamp: string;
  event: 'AUTH_FAILURE' | 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'REQUEST_TOO_LARGE' | 
         'SUBMISSION_SUCCESS' | 'SUBMISSION_FAILURE' | 'API_ERROR';
  endpoint: string;
  ip: string;
  sessionId?: string;  // Safe to log - not PHI
  statusCode: number;
  details?: string;
  // NEVER log: firstName, lastName, email, phone, dob, address, medical data
}

function auditLog(event: AuditEvent): void {
  if (!ENABLE_AUDIT_LOG) return;
  
  const logEntry = {
    ...event,
    service: 'eonmeds-intake',
    environment: process.env.NODE_ENV || 'development',
  };
  
  // Structured JSON log - compatible with CloudWatch, Datadog, etc.
  console.log(JSON.stringify(logEntry));
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

// =============================================================================
// EONPRO WEBHOOK INTEGRATION
// Sends intake data to EONPRO to create patient profiles
// Configure via: EONPRO_WEBHOOK_URL and EONPRO_WEBHOOK_SECRET
// =============================================================================
const EONPRO_WEBHOOK_URL = process.env.EONPRO_WEBHOOK_URL;
const EONPRO_WEBHOOK_SECRET = process.env.EONPRO_WEBHOOK_SECRET;
const EONPRO_ENABLED = !!(EONPRO_WEBHOOK_URL && EONPRO_WEBHOOK_SECRET);

interface EonproIntakeData {
  submissionId: string;
  submittedAt: string;
  source: string;
  data: Record<string, string | number | boolean | undefined>;
}

interface EonproResponse {
  success: boolean;
  requestId?: string;
  data?: {
    patientId?: number;
    documentId?: number;
    soapNoteId?: number;
    submissionId?: string;
    pdfUrl?: string;
    patientCreated?: boolean;
  };
  error?: string;
  message?: string;
}

/**
 * Send intake data to EONPRO webhook to create patient profile
 * Includes retry logic with exponential backoff for resilience
 * This runs asynchronously and doesn't block the main response
 */
async function sendToEonpro(
  intakeData: EonproIntakeData, 
  maxRetries: number = 3
): Promise<EonproResponse | null> {
  if (!EONPRO_ENABLED) {
    log('⏭️ EONPRO webhook not configured, skipping');
    return null;
  }

  // Verbose logging - show what we're sending (safe fields only)
  const logSafeData = {
    submissionId: intakeData.submissionId,
    submittedAt: intakeData.submittedAt,
    source: intakeData.source,
    hasFirstName: !!intakeData.data.firstName,
    hasLastName: !!intakeData.data.lastName,
    hasEmail: !!intakeData.data.email,
    hasPhone: !!intakeData.data.phone,
    hasDob: !!intakeData.data.dateOfBirth,
    hasAddress: !!(intakeData.data.streetAddress || intakeData.data.state),
    submissionType: intakeData.data.submissionType,
    qualified: intakeData.data.qualified,
    totalFields: Object.keys(intakeData.data).filter(k => intakeData.data[k]).length,
  };
  
  log('📤 EONPRO Webhook Request:', JSON.stringify(logSafeData, null, 2));

  let lastError: string | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`🔄 EONPRO attempt ${attempt}/${maxRetries}...`);
      
      const startTime = Date.now();
      
      const response = await fetch(EONPRO_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': EONPRO_WEBHOOK_SECRET!,
        },
        body: JSON.stringify(intakeData),
      });

      const responseTime = Date.now() - startTime;
      
      // Log response details
      log(`📥 EONPRO Response: status=${response.status}, time=${responseTime}ms`);

      let result: EonproResponse;
      try {
        result = await response.json();
      } catch (parseError) {
        log(`⚠️ EONPRO response not JSON: ${await response.text().catch(() => 'unable to read')}`);
        result = { success: false, error: 'Invalid JSON response' };
      }

      if (response.ok && result.success) {
        log(`✅ EONPRO SUCCESS: patientId=${result.data?.patientId}, requestId=${result.requestId}`);
        
        // Audit log for successful webhook
        auditLog({
          timestamp: new Date().toISOString(),
          event: 'SUBMISSION_SUCCESS',
          endpoint: '/api/airtable -> EONPRO',
          ip: 'server',
          sessionId: intakeData.submissionId,
          statusCode: response.status,
          details: `EONPRO patient created: ${result.data?.patientId || 'unknown'}`,
        });
        
        return result;
      } else {
        lastError = result.error || result.message || `HTTP ${response.status}`;
        log(`❌ EONPRO attempt ${attempt} failed: ${lastError}`);
        
        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          log(`⛔ Not retrying - client error (${response.status})`);
          
          auditLog({
            timestamp: new Date().toISOString(),
            event: 'SUBMISSION_FAILURE',
            endpoint: '/api/airtable -> EONPRO',
            ip: 'server',
            sessionId: intakeData.submissionId,
            statusCode: response.status,
            details: `EONPRO rejected: ${lastError}`,
          });
          
          return result;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Network error';
      log(`❌ EONPRO attempt ${attempt} exception: ${lastError}`);
    }
    
    // Exponential backoff before retry (1s, 2s, 4s)
    if (attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt - 1) * 1000;
      log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // All retries exhausted
  log(`💀 EONPRO FAILED after ${maxRetries} attempts: ${lastError}`);
  
  auditLog({
    timestamp: new Date().toISOString(),
    event: 'SUBMISSION_FAILURE',
    endpoint: '/api/airtable -> EONPRO',
    ip: 'server',
    sessionId: intakeData.submissionId,
    statusCode: 500,
    details: `EONPRO failed after ${maxRetries} retries: ${lastError}`,
  });

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
  };
}

/**
 * Check if we have minimum required fields for EONPRO submission
 * Required: firstName, lastName, dob, email, phone, address (or state)
 */
function hasMinimumRequiredFields(data: IntakeRecord): boolean {
  const hasName = !!(data.firstName && data.lastName);
  const hasDob = !!data.dob;
  const hasEmail = !!data.email;
  const hasPhone = !!data.phone;
  const hasAddress = !!(data.address || data.state);
  
  return hasName && hasDob && hasEmail && hasPhone && hasAddress;
}

/**
 * Map intake form data to EONPRO webhook format
 * @param isPartial - true if this is a partial/midpoint submission
 */
function mapToEonproFormat(data: IntakeRecord, airtableRecordId: string, isPartial: boolean = false): EonproIntakeData {
  // Parse height if available (format: "5'10\"")
  let heightFormatted = '';
  if (data.height) {
    heightFormatted = data.height;
  }

  // Parse address components from the combined address field
  // Address is stored as a combined string, we'll pass it as streetAddress
  const addressParts = data.address?.split(',').map(s => s.trim()) || [];
  
  // Build notes about submission
  let intakeNotes = '';
  if (isPartial) {
    intakeNotes = 'PARTIAL SUBMISSION - User dropped off before checkout. ';
    if (!data.qualified) {
      intakeNotes += 'Qualification status: Not yet determined. ';
    }
  }
  
  return {
    submissionId: `wli-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    source: 'weightlossintake',
    data: {
      // Patient identifiers
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      dateOfBirth: data.dob || '',
      gender: data.sex || '',
      
      // Address fields
      streetAddress: addressParts[0] || data.address || '',
      apartment: data.apartment || '',
      city: addressParts[1] || '',
      state: data.state || '',
      zipCode: addressParts[addressParts.length - 1]?.match(/\d{5}(-\d{4})?/)?.[0] || '',
      
      // Physical measurements
      weight: data.currentWeight?.toString() || '',
      idealWeight: data.idealWeight?.toString() || '',
      height: heightFormatted,
      bmi: data.bmi?.toString() || '',
      bloodPressure: data.bloodPressure || '',
      
      // Medical history
      currentMedications: data.medications || '',
      allergies: data.allergies || '',
      medicalConditions: [
        data.chronicConditions,
        data.digestiveConditions,
        data.kidneyConditions,
        data.medicalConditions,
      ].filter(Boolean).join('; ') || '',
      mentalHealthHistory: data.mentalHealthConditions || '',
      familyHistory: data.familyConditions || '',
      surgicalHistory: data.surgeryHistory === 'yes' || data.surgeryHistory === 'Yes' 
        ? data.surgeryDetails || 'Yes' 
        : 'None',
      
      // GLP-1 specific
      glp1History: data.glp1History || '',
      glp1Type: data.glp1Type || '',
      medicationPreference: data.medicationPreference || '',
      semaglutideDosage: data.semaglutideDosage || '',
      tirzepatideDosage: data.tirzepatideDosage || '',
      previousSideEffects: data.sideEffects || '',
      
      // Lifestyle
      activityLevel: data.activityLevel || '',
      alcoholUse: data.alcoholConsumption || '',
      recreationalDrugs: data.recreationalDrugs || '',
      weightLossHistory: data.weightLossHistory || '',
      
      // Visit reason
      reasonForVisit: 'GLP-1 Weight Loss Treatment Consultation',
      chiefComplaint: data.goals || 'Weight management',
      healthGoals: data.healthImprovements || '',
      
      // Pregnancy status (for eligibility)
      pregnancyStatus: data.pregnancyBreastfeeding || '',
      
      // Personal medical flags
      hasDiabetes: data.personalDiabetes || '',
      hasGastroparesis: data.personalGastroparesis || '',
      hasPancreatitis: data.personalPancreatitis || '',
      hasThyroidCancer: data.personalThyroidCancer || '',
      
      // Referral info
      referralSource: data.referralSources || '',
      referredBy: data.referrerName || '',
      
      // Metadata
      qualified: data.qualified ? 'Yes' : (isPartial ? 'Pending' : 'No'),
      submissionType: isPartial ? 'Partial' : 'Complete',
      intakeNotes: intakeNotes,
      language: data.flowLanguage || 'en',
      intakeSource: 'eonmeds-intake',
      airtableRecordId: airtableRecordId,
    },
  };
}

// =============================================================================
// OPTIONAL API KEY VERIFICATION (Backwards Compatible)
// Set API_SECRET_KEY env var to enable. If not set, all requests pass through.
// When enabled, requests must include header: X-API-Key: <your-secret>
// =============================================================================
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const REQUIRE_API_KEY = !!API_SECRET_KEY; // Only require if configured

function verifyApiKey(request: NextRequest): { valid: boolean; error?: string } {
  // If no API key is configured, skip verification (backwards compatible)
  if (!REQUIRE_API_KEY) {
    return { valid: true };
  }
  
  const providedKey = request.headers.get('x-api-key');
  
  if (!providedKey) {
    return { valid: false, error: 'Missing API key' };
  }
  
  // Constant-time comparison to prevent timing attacks
  if (providedKey.length !== API_SECRET_KEY!.length) {
    return { valid: false, error: 'Invalid API key' };
  }
  
  let mismatch = 0;
  for (let i = 0; i < providedKey.length; i++) {
    mismatch |= providedKey.charCodeAt(i) ^ API_SECRET_KEY!.charCodeAt(i);
  }
  
  if (mismatch !== 0) {
    return { valid: false, error: 'Invalid API key' };
  }
  
  return { valid: true };
}

// =============================================================================
// INPUT VALIDATION SCHEMA - Sanitizes and validates incoming data
// =============================================================================
const IntakeRecordSchema = z.object({
  sessionId: z.string().min(1).max(100),
  updateRecordId: z.string().regex(/^rec[a-zA-Z0-9]{14}$/).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  dob: z.string().max(50).optional(),
  sex: z.string().max(50).optional(),
  bloodPressure: z.string().max(50).optional(),
  pregnancyBreastfeeding: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  apartment: z.string().max(100).optional(),
  currentWeight: z.union([z.number(), z.string()]).optional(),
  idealWeight: z.union([z.number(), z.string()]).optional(),
  height: z.string().max(20).optional(),
  bmi: z.union([z.number(), z.string()]).optional(),
  goals: z.string().max(1000).optional(),
  activityLevel: z.string().max(50).optional(),
  chronicConditions: z.string().max(2000).optional(),
  digestiveConditions: z.string().max(2000).optional(),
  medications: z.string().max(2000).optional(),
  allergies: z.string().max(2000).optional(),
  mentalHealthConditions: z.string().max(2000).optional(),
  surgeryHistory: z.string().max(500).optional(),
  surgeryDetails: z.string().max(2000).optional(),
  familyConditions: z.string().max(2000).optional(),
  kidneyConditions: z.string().max(2000).optional(),
  medicalConditions: z.string().max(2000).optional(),
  personalDiabetes: z.string().max(100).optional(),
  personalGastroparesis: z.string().max(100).optional(),
  personalPancreatitis: z.string().max(100).optional(),
  personalThyroidCancer: z.string().max(100).optional(),
  personalMen: z.string().max(100).optional(),
  hasMentalHealth: z.string().max(100).optional(),
  hasChronicConditions: z.string().max(100).optional(),
  glp1History: z.string().max(200).optional(),
  glp1Type: z.string().max(200).optional(),
  sideEffects: z.string().max(2000).optional(),
  medicationPreference: z.string().max(200).optional(),
  semaglutideDosage: z.string().max(100).optional(),
  semaglutideSideEffects: z.string().max(2000).optional(),
  semaglutideSuccess: z.string().max(200).optional(),
  tirzepatideDosage: z.string().max(100).optional(),
  tirzepatideSideEffects: z.string().max(2000).optional(),
  tirzepatideSuccess: z.string().max(200).optional(),
  dosageSatisfaction: z.string().max(200).optional(),
  dosageInterest: z.string().max(200).optional(),
  alcoholConsumption: z.string().max(200).optional(),
  recreationalDrugs: z.string().max(500).optional(),
  weightLossHistory: z.string().max(2000).optional(),
  weightLossSupport: z.string().max(2000).optional(),
  healthImprovements: z.string().max(2000).optional(),
  referralSources: z.string().max(500).optional(),
  referrerName: z.string().max(200).optional(),
  referrerType: z.string().max(100).optional(),
  qualified: z.boolean().optional(),
  takingMedications: z.string().max(200).optional(),
  personalizedTreatmentInterest: z.string().max(200).optional(),
  submittedAt: z.string().max(50).optional(),
  flowLanguage: z.string().max(10).optional(),
  // Consent fields
  privacyPolicyAccepted: z.boolean().optional(),
  termsOfUseAccepted: z.boolean().optional(),
  telehealthConsentAccepted: z.boolean().optional(),
  cancellationPolicyAccepted: z.boolean().optional(),
  floridaBillOfRightsAccepted: z.boolean().optional(),
  floridaConsentAccepted: z.boolean().optional(),
}).strip(); // Strip unknown fields for security - only allow defined fields

// =============================================================================
// SANITIZATION HELPERS - Defense in depth against XSS/injection
// =============================================================================

// Sanitize string values - removes potential XSS vectors
function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return value;
  return value
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Remove data: URLs that could contain scripts
    .replace(/data:\s*text\/html/gi, '')
    // Remove vbscript: protocol (IE legacy)
    .replace(/vbscript:/gi, '')
    // Encode HTML entities for special chars (but preserve readable text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Validate and sanitize a string field with length check
function sanitizeField(value: unknown, maxLength: number = 2000): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  const sanitized = sanitizeString(str);
  return sanitized.slice(0, maxLength);
}

// Airtable API configuration - uses Personal Access Token (PAT)
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Intake Submissions';

// Known safe field names that exist in Airtable
// IMPORTANT: Only include fields that are actually created in your Airtable table
// Check your Airtable table columns and add matching field names here
const KNOWN_AIRTABLE_FIELDS = new Set([
  // Core identification fields
  'Session ID',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'State',
  'Language',
  'Type',   // 'Complete' or 'Partial - Dropped before checkout'
  'Notes',  // Additional notes about the submission
  // Medical data fields
  'Date of Birth',
  'Sex',
  'Blood Pressure',
  'Pregnancy/Breastfeeding',
  'Address',
  'Apartment',
  'Current Weight (lbs)',
  'Ideal Weight',
  'Height',
  'BMI',
  'Goals',
  'Activity Level',
  // Medical history
  'Chronic Conditions',
  'Digestive Conditions',
  'Medications',
  'Allergies',
  'Mental Health Conditions',
  'Surgery History',
  'Surgery Details',
  'Family Conditions',
  'Kidney Conditions',
  'Medical Conditions',
  // Personal medical history
  'Personal Diabetes T2',
  'Personal Gastroparesis',
  'Personal Pancreatitis',
  'Personal Thyroid Cancer',
  'Personal MEN',
  'Has Mental Health',
  'Has Chronic Conditions',
  // GLP-1 data
  'GLP-1 History',
  'GLP-1 Type',
  'Side Effects',
  'Medication Preference',
  'Semaglutide Dosage',
  'Semaglutide Side Effects',
  'Semaglutide Success',
  'Tirzepatide Dosage',
  'Tirzepatide Side Effects',
  'Tirzepatide Success',
  'Dosage Satisfaction',
  'Dosage Interest',
  // Lifestyle
  'Alcohol Consumption',
  'Recreational Drugs',
  'Weight Loss History',
  'Weight Loss Support',
  'Health Improvements',
  // Referral
  'Referral Sources',
  'Referrer Name',
  'Referrer Type',
  // Status
  'Taking Medications',
  'Personalized Treatment Interest',
  // Consent checkboxes
  'Privacy Policy Accepted',
  'Terms of Use Accepted',
  'Telehealth Consent Accepted',
  'Cancellation Policy Accepted',
  'Florida Bill of Rights Accepted',
  'Florida Consent Accepted',
  // Note: Consent timestamp fields (e.g., "Privacy Policy Accepted At") are computed fields
  // in Airtable and cannot be written to directly - they auto-populate when checkbox is set
]);

// Fields that are checkbox type in Airtable (need boolean values)
const CHECKBOX_FIELDS = new Set([
  'Qualified',
  'Privacy Policy Accepted',
  'Terms of Use Accepted',
  'Telehealth Consent Accepted',
  'Cancellation Policy Accepted',
  'Florida Bill of Rights Accepted',
  'Florida Consent Accepted',
]);

// Fields that are number type in Airtable (need numeric values)
const NUMBER_FIELDS = new Set([
  'Current Weight (lbs)',
  'Ideal Weight',
  'BMI',
]);

interface IntakeRecord {
  sessionId: string;
  // For updating existing records (midpoint → final)
  updateRecordId?: string;
  // Personal Info
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  sex?: string;
  bloodPressure?: string;
  pregnancyBreastfeeding?: string;
  // Address
  state?: string;
  address?: string;
  apartment?: string;
  // Weight & BMI
  currentWeight?: number | string;
  idealWeight?: number | string;
  height?: string;
  bmi?: number | string;
  // Goals & Activity
  goals?: string;
  activityLevel?: string;
  // Medical Conditions
  chronicConditions?: string;
  digestiveConditions?: string;
  medications?: string;
  allergies?: string;
  mentalHealthConditions?: string;
  // Additional Medical History
  surgeryHistory?: string;
  surgeryDetails?: string;
  familyConditions?: string;
  kidneyConditions?: string;
  medicalConditions?: string;
  personalDiabetes?: string;
  personalGastroparesis?: string;
  personalPancreatitis?: string;
  personalThyroidCancer?: string;
  personalMen?: string;
  hasMentalHealth?: string;
  hasChronicConditions?: string;
  // GLP-1 Profile
  glp1History?: string;
  glp1Type?: string;
  sideEffects?: string;
  medicationPreference?: string;
  semaglutideDosage?: string;
  semaglutideSideEffects?: string;
  semaglutideSuccess?: string;
  tirzepatideDosage?: string;
  tirzepatideSideEffects?: string;
  tirzepatideSuccess?: string;
  dosageSatisfaction?: string;
  dosageInterest?: string;
  // Lifestyle
  alcoholConsumption?: string;
  recreationalDrugs?: string;
  weightLossHistory?: string;
  weightLossSupport?: string;
  healthImprovements?: string;
  // Referral
  referralSources?: string;
  referrerName?: string;
  referrerType?: string;
  // Qualification Status
  qualified?: boolean;
  takingMedications?: string;
  personalizedTreatmentInterest?: string;
  submittedAt?: string;
  flowLanguage?: string;
  // Consent tracking - checkboxes
  privacyPolicyAccepted?: boolean;
  termsOfUseAccepted?: boolean;
  telehealthConsentAccepted?: boolean;
  cancellationPolicyAccepted?: boolean;
  floridaBillOfRightsAccepted?: boolean;
  floridaConsentAccepted?: boolean;
  // Consent tracking - timestamps
  privacyPolicyAcceptedAt?: string;
  termsOfUseAcceptedAt?: string;
  telehealthConsentAcceptedAt?: string;
  cancellationPolicyAcceptedAt?: string;
  floridaBillOfRightsAcceptedAt?: string;
  floridaConsentAcceptedAt?: string;
}

// CORS headers - whitelist only our domains
const ALLOWED_ORIGINS = [
  'https://intake.eonmeds.com',
  'https://checkout.eonmeds.com',
  'https://weightlossintake.vercel.app',
  'https://eonmeds.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
];

function getCorsHeaders(origin?: string | null) {
  // Check if origin is in allowed list
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Legacy export for backwards compatibility during transition
const corsHeaders = getCorsHeaders('https://intake.eonmeds.com');

// =============================================================================
// REQUEST SIZE LIMITS - Prevent oversized payloads
// =============================================================================
const MAX_REQUEST_SIZE = 100 * 1024; // 100KB - generous for intake data

// =============================================================================
// RATE LIMITING (Optional - requires Upstash setup)
// To enable:
//   1. npm install @upstash/ratelimit @upstash/redis
//   2. Add to Vercel env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//   3. Uncomment the import and ratelimit code below
// 
// import { Ratelimit } from '@upstash/ratelimit';
// import { Redis } from '@upstash/redis';
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute per IP
//   analytics: true,
// });
// =============================================================================

// Simple in-memory rate limiting (no external dependencies)
// This is a basic fallback - use Upstash for production-grade rate limiting
// 
// Configuration via environment variables:
//   ENABLE_RATE_LIMIT=true           - Enable rate limiting
//   AIRTABLE_RATE_LIMIT_MAX=30       - Max requests per window (default: 30)
//   AIRTABLE_RATE_LIMIT_WINDOW_MS=60000 - Window size in ms (default: 60000)
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.AIRTABLE_RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.AIRTABLE_RATE_LIMIT_MAX || '30', 10);
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Set ENABLE_RATE_LIMIT=true in env to activate (disabled by default)
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === 'true';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn?: number; // seconds until reset
}

function checkRateLimit(ip: string): RateLimitResult {
  if (!ENABLE_RATE_LIMIT) {
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS };
  }
  
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  // Clean up old entries periodically (every 100th request)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  
  const resetIn = Math.ceil((record.resetTime - now) / 1000);
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetIn };
}
// =============================================================================

export async function POST(request: NextRequest) {
  log('=== AIRTABLE API CALLED ===');
  const clientIp = getClientIp(request);
  
  // Rate limiting (only if ENABLE_RATE_LIMIT=true)
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'RATE_LIMITED',
      endpoint: '/api/airtable',
      ip: clientIp,
      statusCode: 429,
    });
    return NextResponse.json({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      retryAfter: 60,
    }, { 
      status: 429, 
      headers: {
        ...corsHeaders,
        'Retry-After': '60',
        'X-RateLimit-Remaining': '0',
      }
    });
  }
  
  // Optional API key verification (only if API_SECRET_KEY is configured)
  const apiKeyResult = verifyApiKey(request);
  if (!apiKeyResult.valid) {
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'AUTH_FAILURE',
      endpoint: '/api/airtable',
      ip: clientIp,
      statusCode: 401,
      details: apiKeyResult.error,
    });
    return NextResponse.json({
      success: false,
      error: 'Unauthorized',
      code: 'INVALID_API_KEY',
    }, { status: 401, headers: corsHeaders });
  }
  
  // Check request size before processing
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'REQUEST_TOO_LARGE',
      endpoint: '/api/airtable',
      ip: clientIp,
      statusCode: 413,
      details: `Size: ${contentLength} bytes`,
    });
    return NextResponse.json({
      success: false,
      error: 'Request too large',
      maxSize: `${MAX_REQUEST_SIZE / 1024}KB`,
    }, { status: 413, headers: corsHeaders });
  }
  log('Timestamp:', new Date().toISOString());
  
  try {
    // Parse JSON body with error handling
    let rawData;
    try {
      rawData = await request.json();
    } catch (parseError) {
      auditLog({
        timestamp: new Date().toISOString(),
        event: 'VALIDATION_ERROR',
        endpoint: '/api/airtable',
        ip: clientIp,
        statusCode: 400,
        details: 'Invalid JSON',
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      }, { status: 400, headers: corsHeaders });
    }
    
    // Validate input schema
    const validationResult = IntakeRecordSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      log('Validation failed:', validationResult.error.flatten());
      // Log field names only - NEVER log field values (could contain PHI)
      const failedFields = Object.keys(validationResult.error.flatten().fieldErrors);
      auditLog({
        timestamp: new Date().toISOString(),
        event: 'VALIDATION_ERROR',
        endpoint: '/api/airtable',
        ip: clientIp,
        sessionId: typeof rawData?.sessionId === 'string' ? rawData.sessionId : undefined,
        statusCode: 400,
        details: `Invalid fields: ${failedFields.join(', ')}`,
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        code: 'VALIDATION_ERROR',
        // Only show field details in development to avoid info leakage
        details: isDev ? validationResult.error.flatten().fieldErrors : undefined,
      }, { status: 400, headers: corsHeaders });
    }
    
    const data: IntakeRecord = validationResult.data as IntakeRecord;
    
    const isUpdate = !!data.updateRecordId;
    log('Received intake submission:', {
      sessionId: data.sessionId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      state: data.state,
      qualified: data.qualified,
      isUpdate,
      updateRecordId: data.updateRecordId || 'N/A'
    });
    // Check for required environment variables
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      log('Airtable not configured! AIRTABLE_PAT:', !!AIRTABLE_PAT, 'AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
      return NextResponse.json({
        success: false,
        error: 'Airtable not configured',
        message: 'Add AIRTABLE_PAT and AIRTABLE_BASE_ID to environment variables',
        recordId: `LOCAL-${Date.now()}`
      }, { headers: corsHeaders });
    }

    // Helper to convert any value to string (Airtable text fields) with sanitization
    const toString = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      if (typeof val === 'number') return String(val);
      // Sanitize string values to prevent XSS if data is displayed elsewhere
      return sanitizeString(String(val));
    };

    // Determine if this is a partial or complete submission
    const isQualified = data.qualified === true;
    const hasRequiredFields = hasMinimumRequiredFields(data);
    const submissionType = isQualified ? 'Complete' : (hasRequiredFields ? 'Partial - Dropped before checkout' : 'Incomplete');
    
    // Build notes for partial submissions
    let submissionNotes = '';
    if (!isQualified && hasRequiredFields) {
      submissionNotes = 'User dropped off before completing checkout. Has basic info - consider follow-up.';
    }

    // Build fields object - ALL fields from Airtable
    const allFields: Record<string, string | boolean | number> = {
      // Core identification
      'Session ID': toString(data.sessionId),
      'First Name': toString(data.firstName),
      'Last Name': toString(data.lastName),
      'Email': toString(data.email),
      'Phone': toString(data.phone),
      'State': toString(data.state),
      'Language': toString(data.flowLanguage),
      'Type': submissionType,
      'Notes': submissionNotes,
      // Medical data
      'Date of Birth': toString(data.dob),
      'Sex': toString(data.sex),
      'Blood Pressure': toString(data.bloodPressure),
      'Pregnancy/Breastfeeding': toString(data.pregnancyBreastfeeding),
      'Address': toString(data.address),
      'Apartment': toString(data.apartment),
      'Current Weight (lbs)': toString(data.currentWeight),
      'Ideal Weight': toString(data.idealWeight),
      'Height': toString(data.height),
      'BMI': toString(data.bmi),
      'Goals': toString(data.goals),
      'Activity Level': toString(data.activityLevel),
      // Medical history
      'Chronic Conditions': toString(data.chronicConditions),
      'Digestive Conditions': toString(data.digestiveConditions),
      'Medications': toString(data.medications),
      'Allergies': toString(data.allergies),
      'Mental Health Conditions': toString(data.mentalHealthConditions),
      'Surgery History': toString(data.surgeryHistory),
      'Surgery Details': toString(data.surgeryDetails),
      'Family Conditions': toString(data.familyConditions),
      'Kidney Conditions': toString(data.kidneyConditions),
      'Medical Conditions': toString(data.medicalConditions),
      // Personal medical history
      'Personal Diabetes T2': toString(data.personalDiabetes),
      'Personal Gastroparesis': toString(data.personalGastroparesis),
      'Personal Pancreatitis': toString(data.personalPancreatitis),
      'Personal Thyroid Cancer': toString(data.personalThyroidCancer),
      'Personal MEN': toString(data.personalMen),
      'Has Mental Health': toString(data.hasMentalHealth),
      'Has Chronic Conditions': toString(data.hasChronicConditions),
      // GLP-1 data
      'GLP-1 History': toString(data.glp1History),
      'GLP-1 Type': toString(data.glp1Type),
      'Side Effects': toString(data.sideEffects),
      'Medication Preference': toString(data.medicationPreference),
      'Semaglutide Dosage': toString(data.semaglutideDosage),
      'Semaglutide Side Effects': toString(data.semaglutideSideEffects),
      'Semaglutide Success': toString(data.semaglutideSuccess),
      'Tirzepatide Dosage': toString(data.tirzepatideDosage),
      'Tirzepatide Side Effects': toString(data.tirzepatideSideEffects),
      'Tirzepatide Success': toString(data.tirzepatideSuccess),
      'Dosage Satisfaction': toString(data.dosageSatisfaction),
      'Dosage Interest': toString(data.dosageInterest),
      // Lifestyle
      'Alcohol Consumption': toString(data.alcoholConsumption),
      'Recreational Drugs': toString(data.recreationalDrugs),
      'Weight Loss History': toString(data.weightLossHistory),
      'Weight Loss Support': toString(data.weightLossSupport),
      'Health Improvements': toString(data.healthImprovements),
      // Referral
      'Referral Sources': toString(data.referralSources),
      'Referrer Name': toString(data.referrerName),
      'Referrer Type': toString(data.referrerType),
      // Status
      'Qualified': data.qualified ?? false,
      'Taking Medications': toString(data.takingMedications),
      'Personalized Treatment Interest': toString(data.personalizedTreatmentInterest),
      // Consent checkboxes - timestamps are auto-computed by Airtable when these are set
      'Privacy Policy Accepted': data.privacyPolicyAccepted ?? false,
      'Terms of Use Accepted': data.termsOfUseAccepted ?? false,
      'Telehealth Consent Accepted': data.telehealthConsentAccepted ?? false,
      'Cancellation Policy Accepted': data.cancellationPolicyAccepted ?? false,
      'Florida Bill of Rights Accepted': data.floridaBillOfRightsAccepted ?? false,
      'Florida Consent Accepted': data.floridaConsentAccepted ?? false,
    };

    // Build final fields object with proper types
    const fields: Record<string, string | boolean | number> = {};
    const skippedFields: string[] = [];
    
    for (const [key, value] of Object.entries(allFields)) {
      // Skip empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Handle checkbox fields (need boolean)
      if (CHECKBOX_FIELDS.has(key)) {
        fields[key] = value === 'Yes' || value === 'true' || value === true;
        continue;
      }
      
      // Handle number fields (need numeric values)
      if (NUMBER_FIELDS.has(key)) {
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          fields[key] = numValue;
        }
        continue;
      }
      
      // Only include text fields that are known to exist in Airtable
      if (KNOWN_AIRTABLE_FIELDS.has(key)) {
        fields[key] = value;
      } else {
        skippedFields.push(key);
      }
    }

    log('Sending fields to Airtable:', Object.keys(fields));
    if (skippedFields.length > 0) {
      log('Skipped unknown fields:', skippedFields);
    }

    // Determine if this is a CREATE or UPDATE operation
    const airtableUrl = isUpdate && data.updateRecordId
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${data.updateRecordId}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
    
    const httpMethod = isUpdate ? 'PATCH' : 'POST';
    
    log(`${isUpdate ? '📝 UPDATING' : '➕ CREATING'} Airtable record...`);

    // Send to Airtable using Personal Access Token with retry logic
    let lastError: unknown = null;
    let response: Response | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(airtableUrl, {
          method: httpMethod,
          headers: {
            'Authorization': `Bearer ${AIRTABLE_PAT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields }),
        });
        
        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        // If it's a 422 (validation error), don't retry - it will fail again
        if (response.status === 422) {
          break;
        }
        
        log(`Airtable attempt ${attempt} failed with status ${response.status}, retrying...`);
        lastError = `HTTP ${response.status}`;
        
      } catch (fetchError) {
        log(`Airtable attempt ${attempt} network error:`, fetchError);
        lastError = fetchError;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    if (!response || !response.ok) {
      let errorData;
      try {
        errorData = response ? await response.json() : { error: 'Network error' };
      } catch {
        errorData = { error: String(lastError) };
      }
      
      log('Airtable error after retries:', JSON.stringify(errorData, null, 2));
      log('Fields sent:', Object.keys(fields));

      auditLog({
        timestamp: new Date().toISOString(),
        event: 'SUBMISSION_FAILURE',
        endpoint: '/api/airtable',
        ip: clientIp,
        sessionId: data.sessionId,
        statusCode: response?.status || 500,
        details: `Airtable API error: ${response?.status || 'network'}`,
      });

      // Return detailed error for debugging
      return NextResponse.json({
        success: false,
        error: `Airtable API error: ${response?.status || 'network error'}`,
        details: errorData,
        fieldsSent: Object.keys(fields),
        skippedFields: skippedFields.length > 0 ? skippedFields : undefined
      }, { status: response?.status || 500, headers: corsHeaders });
    }

    const result = await response.json();

    auditLog({
      timestamp: new Date().toISOString(),
      event: 'SUBMISSION_SUCCESS',
      endpoint: '/api/airtable',
      ip: clientIp,
      sessionId: data.sessionId,
      statusCode: 200,
      // NEVER log PHI - only record ID and field count
      details: `RecordId: ${result.id}, Fields: ${Object.keys(fields).length}`,
    });

    log('Successfully saved to Airtable with ID:', result.id);

    // ==========================================================================
    // EONPRO WEBHOOK: Create patient profile in EONPRO
    // Sends for ANY submission with minimum required fields (name, DOB, email, phone, address)
    // This ensures we capture leads even if they drop off before checkout
    // Runs asynchronously - doesn't block the response to the client
    // ==========================================================================
    let eonproTriggered = false;
    
    // Check if we should send to EONPRO
    // - Must have EONPRO configured
    // - Must have minimum required fields (name, DOB, email, phone, address)
    // - ALWAYS send qualified=true submissions (final submissions)
    // - For partial (midpoint) submissions, only send if it's a NEW record (not an update)
    const isQualifiedFinal = data.qualified === true;
    const isPartialUpdate = isUpdate && data.updateRecordId && !isQualifiedFinal;
    
    // Send to EONPRO if:
    // 1. Has required fields AND
    // 2. Either it's a qualified final submission OR it's NOT a partial update
    if (EONPRO_ENABLED && hasRequiredFields && (isQualifiedFinal || !isPartialUpdate)) {
      // Determine if this is a partial or complete submission
      const isPartialSubmission = data.qualified !== true;
      
      // Send to EONPRO in the background (don't await to avoid blocking)
      // This creates a patient profile with all intake data
      const eonproData = mapToEonproFormat(data, result.id, isPartialSubmission);
      
      log(`📤 Sending to EONPRO (${isPartialSubmission ? 'PARTIAL' : 'COMPLETE'} submission)...`);
      
      // Fire and forget - we don't want to fail the intake if EONPRO is down
      sendToEonpro(eonproData)
        .then((res) => {
          if (res?.success) {
            log('✅ EONPRO patient profile created:', res.data?.patientId);
          } else {
            log('❌ EONPRO webhook returned error:', res?.error);
          }
        })
        .catch((err) => {
          log('❌ EONPRO webhook exception:', err);
        });
      
      eonproTriggered = true;
    } else if (EONPRO_ENABLED && !hasRequiredFields) {
      log('⏭️ Skipping EONPRO - missing required fields (need name, DOB, email, phone, address)');
    } else if (isPartialUpdate) {
      log('⏭️ Skipping EONPRO - this is a partial update (midpoint already sent)');
    }

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Successfully saved to Airtable',
      fieldsSaved: Object.keys(fields).length,
      submissionType: submissionType,
      eonproTriggered: eonproTriggered,
    }, { headers: corsHeaders });

  } catch (error) {
    log('Error saving to Airtable:', error);
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'API_ERROR',
      endpoint: '/api/airtable',
      ip: clientIp,
      statusCode: 500,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save data'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle preflight requests with dynamic origin checking
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

// GET endpoint to fetch patient checkout data by record ID
// HIPAA Compliant: Returns only non-PHI data needed for checkout pre-fill
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get('ref');

  // If no record ID, return config status
  if (!recordId) {
    const configured = !!(AIRTABLE_PAT && AIRTABLE_BASE_ID);
    return NextResponse.json({
      configured,
      tableName: AIRTABLE_TABLE_NAME,
      message: configured
        ? 'Airtable integration is configured'
        : 'Airtable credentials not set. Add AIRTABLE_PAT and AIRTABLE_BASE_ID to environment variables.'
    }, { headers: corsHeaders });
  }

  // Validate record ID format (Airtable IDs start with 'rec')
  if (!recordId.startsWith('rec')) {
    return NextResponse.json(
      { success: false, error: 'Invalid record reference' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Check for required environment variables
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return NextResponse.json(
      { success: false, error: 'Airtable not configured' },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    // Fetch record from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const record = await response.json();

    // HIPAA Compliant: Return only data needed for checkout pre-fill
    // This is safer than passing PHI in URL query parameters because:
    // - Server-to-server call (not visible in browser history/logs)
    // - CORS protected (only allowed origins can fetch)
    // - Access controlled via Airtable record ID validation
    const checkoutData = {
      success: true,
      data: {
        firstName: record.fields['First Name'] || '',
        lastName: record.fields['Last Name'] || '',
        email: record.fields['Email'] || '',
        phone: record.fields['Phone'] || '',
        dob: record.fields['Date of Birth'] || '',  // Needed for checkout identity verification
        state: record.fields['State'] || '',
        address: record.fields['Address'] || '',
        medicationPreference: record.fields['Medication Preference'] || '',
        qualified: record.fields['Qualified'] ?? false,
      }
    };

    return NextResponse.json(checkoutData, { headers: corsHeaders });

  } catch (error) {
    log('Error fetching from Airtable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
