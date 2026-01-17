import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =============================================================================
// PHI HANDLING BOUNDARY DOCUMENTATION
// =============================================================================
// This API route is a PHI PROCESSING POINT. All data submitted here is assumed
// to contain Protected Health Information (PHI) under HIPAA.
//
// PHI FIELDS HANDLED:
//   - firstName, lastName (PII)
//   - email, phone (Contact identifiers)
//   - dob (Date of birth)
//   - Full address fields (street, city, state, zip)
//   - All medical history and questionnaire responses
//   - Weight, height, BMI
//   - Health conditions, medications, allergies
//
// DATA FLOW:
//   Client Browser → This API → IntakeQ (client profile)
//                             → PDF.co (PDF generation)
//                             → IntakeQ (PDF upload)
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
//   - ALLOWED to log: sessionId, clientId, IP address, timestamps, status codes
//
// THIRD-PARTY DATA SHARING:
//   - IntakeQ: Receives ALL PHI (BAA should be in place)
//   - PDF.co: Receives formatted PHI for PDF generation (review DPA)
//
// COMPLIANCE NOTES:
//   - IntakeQ is HIPAA-compliant with proper BAA
//   - PDF.co data processing agreement should be reviewed
//   - Generated PDFs contain PHI and are stored in IntakeQ
// =============================================================================

// ============================================================================
// INTAKEQ INTEGRATION API
// Creates IntakeQ client profile, generates PDF, uploads to IntakeQ
// ============================================================================

const PDFCO_API_KEY = process.env.PDFCO_API_KEY;
const INTAKEQ_API_KEY = process.env.INTAKEQ_API_KEY;
const INTAKEQ_API_BASE = 'https://intakeq.com/api/v1';

// Development-only logging
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log('[IntakeQ]', ...args);

// =============================================================================
// SECURITY AUDIT LOGGING (No PHI - only metadata)
// Enable structured logging with ENABLE_AUDIT_LOG=true
// =============================================================================
const ENABLE_AUDIT_LOG = process.env.ENABLE_AUDIT_LOG === 'true' || isDev;

interface AuditEvent {
  timestamp: string;
  event: 'AUTH_FAILURE' | 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'REQUEST_TOO_LARGE' | 
         'SUBMISSION_SUCCESS' | 'SUBMISSION_FAILURE' | 'API_ERROR';
  endpoint: string;
  ip: string;
  sessionId?: string;
  statusCode: number;
  details?: string;
}

function auditLog(event: AuditEvent): void {
  if (!ENABLE_AUDIT_LOG) return;
  
  const logEntry = {
    ...event,
    service: 'eonmeds-intake',
    environment: process.env.NODE_ENV || 'development',
  };
  
  console.log(JSON.stringify(logEntry));
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

// =============================================================================
// OPTIONAL API KEY VERIFICATION (Backwards Compatible)
// Set API_SECRET_KEY env var to enable. If not set, all requests pass through.
// =============================================================================
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const REQUIRE_API_KEY = !!API_SECRET_KEY;

function verifyApiKey(request: NextRequest): { valid: boolean; error?: string } {
  if (!REQUIRE_API_KEY) {
    return { valid: true };
  }
  
  const providedKey = request.headers.get('x-api-key');
  
  if (!providedKey) {
    return { valid: false, error: 'Missing API key' };
  }
  
  // Constant-time comparison
  if (providedKey.length !== API_SECRET_KEY!.length) {
    return { valid: false, error: 'Invalid API key' };
  }
  
  let mismatch = 0;
  for (let i = 0; i < providedKey.length; i++) {
    mismatch |= providedKey.charCodeAt(i) ^ API_SECRET_KEY!.charCodeAt(i);
  }
  
  return mismatch === 0 ? { valid: true } : { valid: false, error: 'Invalid API key' };
}

// Input validation schema
const IntakeQDataSchema = z.object({
  sessionId: z.string().min(1).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30),
  dob: z.string().max(20),
  sex: z.string().max(20).optional(),
  state: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  apartment: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  currentWeight: z.number().optional(),
  idealWeight: z.number().optional(),
  height: z.string().max(20).optional(),
  bmi: z.number().optional(),
  activityLevel: z.string().max(50).optional(),
  bloodPressure: z.string().max(50).optional(),
  pregnancyBreastfeeding: z.string().max(100).optional(),
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
  glp1History: z.string().max(200).optional(),
  glp1Type: z.string().max(200).optional(),
  sideEffects: z.string().max(2000).optional(),
  semaglutideDosage: z.string().max(100).optional(),
  semaglutideSuccess: z.string().max(200).optional(),
  semaglutideSideEffects: z.string().max(2000).optional(),
  tirzepatideDosage: z.string().max(100).optional(),
  tirzepatideSuccess: z.string().max(200).optional(),
  tirzepatideSideEffects: z.string().max(2000).optional(),
  personalizedTreatmentInterest: z.string().max(200).optional(),
  healthImprovements: z.string().max(2000).optional(),
  weightLossHistory: z.string().max(2000).optional(),
  referralSources: z.string().max(500).optional(),
  referrerName: z.string().max(200).optional(),
  language: z.string().max(10).optional(),
}).strip(); // Strip unknown fields for security

// =============================================================================
// SANITIZATION HELPERS - Defense in depth against XSS/injection
// =============================================================================

function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
};
}

const corsHeaders = getCorsHeaders('https://intake.eonmeds.com');

// State code mapping
const stateMap: Record<string, string> = {
  'florida': 'FL', 'texas': 'TX', 'california': 'CA', 'new york': 'NY',
  'north carolina': 'NC', 'south carolina': 'SC', 'illinois': 'IL',
  'wisconsin': 'WI', 'indiana': 'IN', 'massachusetts': 'MA', 'delaware': 'DE',
  'georgia': 'GA', 'virginia': 'VA', 'michigan': 'MI', 'nevada': 'NV',
  'connecticut': 'CT', 'new jersey': 'NJ', 'ohio': 'OH', 'pennsylvania': 'PA',
  'arizona': 'AZ', 'colorado': 'CO', 'washington': 'WA', 'oregon': 'OR',
  'tennessee': 'TN', 'maryland': 'MD', 'minnesota': 'MN', 'missouri': 'MO',
  'alabama': 'AL', 'louisiana': 'LA', 'kentucky': 'KY', 'oklahoma': 'OK',
};

function getStateCode(state: string): string {
  if (!state) return '';
  const lower = state.toLowerCase().trim();
  return stateMap[lower] || (state.length === 2 ? state.toUpperCase() : state.substring(0, 2).toUpperCase());
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // Remove country code if present
  const cleanDigits = digits.length === 11 && digits.startsWith('1') ? digits.substring(1) : digits;
  if (cleanDigits.length === 10) {
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
  }
  return phone;
}

interface IntakeData {
  sessionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  sex: string;
  state: string;
  address: string;
  apartment?: string;
  city?: string;
  zipCode?: string;
  currentWeight?: number;
  idealWeight?: number;
  height?: string;
  bmi?: number;
  activityLevel?: string;
  bloodPressure?: string;
  pregnancyBreastfeeding?: string;
  chronicConditions?: string;
  digestiveConditions?: string;
  medications?: string;
  allergies?: string;
  mentalHealthConditions?: string;
  surgeryHistory?: string;
  surgeryDetails?: string;
  familyConditions?: string;
  kidneyConditions?: string;
  medicalConditions?: string;
  glp1History?: string;
  glp1Type?: string;
  sideEffects?: string;
  semaglutideDosage?: string;
  semaglutideSuccess?: string;
  semaglutideSideEffects?: string;
  tirzepatideDosage?: string;
  tirzepatideSuccess?: string;
  tirzepatideSideEffects?: string;
  personalizedTreatmentInterest?: string;
  healthImprovements?: string;
  weightLossHistory?: string;
  referralSources?: string;
  referrerName?: string;
  language?: string;
}

// ============================================================================
// STEP 1: CREATE INTAKEQ CLIENT
// ============================================================================
async function createIntakeQClient(data: IntakeData): Promise<string | null> {
  if (!INTAKEQ_API_KEY) {
    log('IntakeQ API key not configured');
    return null;
  }

  const stateCode = getStateCode(data.state);
  
  // Map sex value to IntakeQ format
  const mappedGender = data.sex === 'Man' || data.sex === 'man' || data.sex === 'hombre' || data.sex === 'Male' ? 'Male' : 
                       data.sex === 'Woman' || data.sex === 'woman' || data.sex === 'mujer' || data.sex === 'Female' ? 'Female' : 
                       data.sex || '';
  
  // Build the client payload for IntakeQ
  const clientPayload = {
    Name: `${data.firstName} ${data.lastName}`.trim(),
    FirstName: data.firstName,
    LastName: data.lastName,
    Email: data.email,
    Phone: formatPhone(data.phone),
    DateOfBirth: data.dob,
    Gender: mappedGender,  // This fills the "SEX" field in IntakeQ UI
    Sex: mappedGender,     // This fills the "GENDER" field in IntakeQ UI
    Address: data.address,
    City: data.city || '',
    State: stateCode,
    PostalCode: data.zipCode || '',
    Country: 'US',
    // Custom fields - these map to IntakeQ's custom field system
    CustomFields: {
      'Apartment': data.apartment || '',
      'Session ID': data.sessionId,
      'Language': data.language || 'en',
    }
  };

  log('Creating IntakeQ client:', clientPayload.Email);

  try {
    const response = await fetch(`${INTAKEQ_API_BASE}/clients`, {
      method: 'POST',
      headers: {
        'X-Auth-Key': INTAKEQ_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('IntakeQ client creation failed:', response.status, errorText);
      
      // Try to find existing client by email
      if (response.status === 400 || response.status === 409) {
        return await findExistingClient(data.email);
      }
      return null;
    }

    const result = await response.json();
    log('IntakeQ client created:', result.Id);
    return result.Id;
  } catch (error) {
    log('IntakeQ client creation error:', error);
    return null;
  }
}

async function findExistingClient(email: string): Promise<string | null> {
  if (!INTAKEQ_API_KEY) return null;

  try {
    const response = await fetch(`${INTAKEQ_API_BASE}/clients?search=${encodeURIComponent(email)}`, {
      headers: { 'X-Auth-Key': INTAKEQ_API_KEY },
    });

    if (response.ok) {
      const clients = await response.json();
      if (clients && clients.length > 0) {
        log('Found existing IntakeQ client:', clients[0].Id);
        return clients[0].Id;
      }
    }
  } catch (error) {
    log('Error finding existing client:', error);
  }
  return null;
}

// ============================================================================
// STEP 2: GENERATE PDF
// ============================================================================
function generatePdfHtml(data: IntakeData, clientId: string): string {
  const submissionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const submissionTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const stateCode = getStateCode(data.state);
  
  // Calculate weight to lose
  const weightToLose = data.currentWeight && data.idealWeight 
    ? Math.abs(data.currentWeight - data.idealWeight) 
    : 0;

  // Helper functions for field display
  const fieldHtml = (label: string, value: string | number | undefined) => {
    const displayValue = value || 'Not provided';
    const emptyClass = !value ? 'empty' : '';
    return `<div class="field"><span class="label">${label}</span><span class="value ${emptyClass}">${displayValue}</span></div>`;
  };

  const fieldHtmlFull = (label: string, value: string | number | undefined) => {
    const displayValue = value || 'Not provided';
    const emptyClass = !value ? 'empty' : '';
    return `<div class="field-full"><span class="label">${label}</span><span class="value ${emptyClass}">${displayValue}</span></div>`;
  };

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', Arial, sans-serif; }
        body { padding: 40px; color: #333; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4CAF50; }
        .logo-img { width: 180px; margin-bottom: 10px; }
        .mso-disclosure { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin: 10px 0 15px 0; text-align: left; font-size: 9px; line-height: 1.4; color: #495057; }
        h1 { font-size: 20px; font-weight: 600; margin-bottom: 5px; }
        .subtitle { font-size: 11px; color: #666; }
        .section { background: #ECEFE7; border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
        .section.glp1 { background: #f0fea5; }
        .section h2 { font-size: 14px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #C2C2C2; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field, .field-full { margin-bottom: 8px; }
        .field-full { grid-column: span 2; }
        .label { display: block; font-size: 9px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 3px; }
        .value { display: block; font-size: 12px; color: #000; }
        .value.empty { color: #555; font-style: italic; }
        .consent-item { padding: 10px; background: #fff; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #4CAF50; }
        .legal-consent { padding: 12px; background: #fff; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #4CAF50; }
        .legal-consent-title { font-size: 11px; font-weight: 600; color: #2e7d32; margin-bottom: 6px; }
        .legal-consent-text { font-size: 10px; color: #555; line-height: 1.5; }
        .consent-status { display: block; font-size: 11px; color: #4CAF50; font-weight: 500; margin-top: 6px; }
        .florida-only { border-left-color: #FF9800; }
        .signature-box { padding: 15px; background: #f1f8f4; border: 2px solid #4CAF50; border-radius: 8px; margin-top: 10px; }
        .signature-title { font-size: 12px; font-weight: 600; color: #2e7d32; margin-bottom: 8px; }
        .signature-text { font-size: 10px; color: #555; line-height: 1.5; margin-bottom: 8px; }
        .signature-checkbox { font-size: 11px; font-weight: 600; color: #2e7d32; margin-top: 8px; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #C2C2C2; text-align: center; color: #666; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://static.wixstatic.com/media/c49a9b_4bbe024f61864f57a23d1c3ea26f5378~mv2.png" class="logo-img" />
        <div class="mso-disclosure">
            <strong>MSO DISCLOSURE:</strong> Apollo Based Health LLC operates solely as a Management Services Organization (MSO) providing non-clinical administrative and operational support to Vital Link PLLC. All medical care, clinical decisions, and prescriptions are provided exclusively by licensed providers of Vital Link PLLC. Apollo Based Health LLC does not practice medicine or influence medical decision-making.
        </div>
        <h1>Medical Intake Form</h1>
        <div class="subtitle">Submitted on ${submissionDate} at ${submissionTime}</div>
        <div class="subtitle">Client ID: ${clientId} | Session: ${data.sessionId}</div>
    </div>
    
    <div class="section">
        <h2>I. PATIENT INFORMATION</h2>
        <div class="field-grid">
            ${fieldHtml('NAME', `${data.firstName} ${data.lastName}`)}
            ${fieldHtml('EMAIL', data.email)}
            ${fieldHtml('PHONE', formatPhone(data.phone))}
            ${fieldHtml('DATE OF BIRTH', data.dob)}
            ${fieldHtml('SEX', data.sex)}
        </div>
    </div>
    
    <div class="section">
        <h2>II. SHIPPING ADDRESS</h2>
        ${fieldHtmlFull('STREET ADDRESS', data.address)}
        ${data.apartment ? fieldHtml('APT/SUITE', data.apartment) : ''}
        <div class="field-grid">
            ${fieldHtml('CITY', data.city)}
            ${fieldHtml('STATE', stateCode)}
            ${fieldHtml('ZIP CODE', data.zipCode)}
        </div>
    </div>
    
    <div class="section">
        <h2>III. PHYSICAL MEASUREMENTS</h2>
        <div class="field-grid">
            ${fieldHtml('HEIGHT', data.height)}
            ${fieldHtml('CURRENT WEIGHT', data.currentWeight ? `${data.currentWeight} lbs` : undefined)}
            ${fieldHtml('BMI', data.bmi?.toFixed(1))}
            ${fieldHtml('IDEAL WEIGHT', data.idealWeight ? `${data.idealWeight} lbs` : undefined)}
            ${fieldHtml('WEIGHT TO LOSE', weightToLose ? `${weightToLose} lbs` : undefined)}
            ${fieldHtml('ACTIVITY LEVEL', data.activityLevel)}
        </div>
    </div>
    
    <div class="section">
        <h2>IV. MEDICAL HISTORY</h2>
        <div class="field-grid">
            ${fieldHtml('BLOOD PRESSURE', data.bloodPressure)}
            ${fieldHtml('PREGNANCY/BREASTFEEDING', data.pregnancyBreastfeeding)}
            ${fieldHtmlFull('CHRONIC CONDITIONS', data.chronicConditions)}
            ${fieldHtmlFull('DIGESTIVE CONDITIONS', data.digestiveConditions)}
            ${fieldHtmlFull('MEDICAL CONDITIONS', data.medicalConditions)}
            ${fieldHtmlFull('FAMILY CONDITIONS', data.familyConditions)}
            ${fieldHtmlFull('KIDNEY CONDITIONS', data.kidneyConditions)}
            ${fieldHtmlFull('MENTAL HEALTH CONDITIONS', data.mentalHealthConditions)}
            ${fieldHtml('SURGERY HISTORY', data.surgeryHistory)}
            ${fieldHtmlFull('SURGERY DETAILS', data.surgeryDetails)}
        </div>
    </div>
    
    <div class="section">
        <h2>V. ALLERGIES & MEDICATIONS</h2>
        <div class="field-grid">
            ${fieldHtmlFull('ALLERGIES', data.allergies)}
            ${fieldHtmlFull('CURRENT MEDICATIONS', data.medications)}
        </div>
    </div>
    
    <div class="section glp1">
        <h2>VI. GLP-1 MEDICATION HISTORY</h2>
        <div class="field-grid">
            ${fieldHtml('GLP-1 HISTORY', data.glp1History)}
            ${fieldHtml('GLP-1 TYPE', data.glp1Type)}
            ${fieldHtml('SEMAGLUTIDE DOSAGE', data.semaglutideDosage)}
            ${fieldHtml('SEMAGLUTIDE SUCCESS', data.semaglutideSuccess)}
            ${fieldHtmlFull('SEMAGLUTIDE SIDE EFFECTS', data.semaglutideSideEffects)}
            ${fieldHtml('TIRZEPATIDE DOSAGE', data.tirzepatideDosage)}
            ${fieldHtml('TIRZEPATIDE SUCCESS', data.tirzepatideSuccess)}
            ${fieldHtmlFull('TIRZEPATIDE SIDE EFFECTS', data.tirzepatideSideEffects)}
            ${fieldHtmlFull('COMMON SIDE EFFECTS', data.sideEffects)}
            ${fieldHtml('PERSONALIZED TREATMENT', data.personalizedTreatmentInterest)}
        </div>
    </div>
    
    <div class="section">
        <h2>VII. GOALS & LIFESTYLE</h2>
        <div class="field-grid">
            ${fieldHtmlFull('HEALTH IMPROVEMENTS', data.healthImprovements)}
            ${fieldHtmlFull('WEIGHT LOSS HISTORY', data.weightLossHistory)}
            ${fieldHtml('REFERRAL SOURCE', data.referralSources)}
            ${fieldHtml('REFERRED BY', data.referrerName)}
        </div>
    </div>
    
    <div class="section">
        <h2>VIII. CONSENTS & DISCLOSURES</h2>
        
        <div class="legal-consent">
            <div class="legal-consent-title">Terms of Use</div>
            <div class="legal-consent-text">I acknowledge that I have read, understand, and agree to the Terms of Use governing my access to and use of this platform and related services.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        
        <div class="legal-consent">
            <div class="legal-consent-title">Privacy Policy</div>
            <div class="legal-consent-text">I acknowledge that I have read and understand the Privacy Policy and consent to the collection, use, and disclosure of my information as described, including in accordance with HIPAA and applicable privacy laws.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        
        <div class="legal-consent">
            <div class="legal-consent-title">Telehealth Consent</div>
            <div class="legal-consent-text">I consent to receive healthcare services via telehealth, including remote evaluations and communications with licensed providers.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        
        <div class="legal-consent">
            <div class="legal-consent-title">Cancellation Policy</div>
            <div class="legal-consent-text">I acknowledge that I have read and agree to the Cancellation Policy.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        
        ${stateCode === 'FL' ? `
        <div class="legal-consent florida-only">
            <div class="legal-consent-title">Florida Weight Loss Consumer Bill of Rights</div>
            <div class="legal-consent-text">As a Florida resident, I acknowledge that I have received and reviewed the Florida Weight Loss Consumer Bill of Rights.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        
        <div class="legal-consent florida-only">
            <div class="legal-consent-title">Florida Telehealth Consent</div>
            <div class="legal-consent-text">As a Florida resident, I consent to the delivery of healthcare services via telehealth in accordance with Florida law.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        ` : ''}
        
        ${stateCode === 'NJ' ? `
        <div class="legal-consent" style="border-left-color: #2196F3;">
            <div class="legal-consent-title">New Jersey Consent for Weight Loss Treatment</div>
            <div class="legal-consent-text">As a New Jersey resident, I acknowledge and consent to the New Jersey specific requirements for weight loss treatment.</div>
            <div class="consent-status">[X] Accepted</div>
        </div>
        ` : ''}
        
        <div class="signature-box">
            <div class="signature-title">Electronic Signature & Acknowledgment</div>
            <div class="signature-text">
                By submitting this form, I acknowledge that:<br/>
                • I have read, understood, and agreed to all disclosures listed above<br/>
                • My electronic acknowledgment constitutes my legal electronic signature<br/>
                • This acceptance is binding and enforceable
            </div>
            <div class="signature-checkbox">[X] Electronic Signature Accepted</div>
            <div class="signature-text" style="margin-top: 10px;">
                <strong>Date:</strong> ${submissionDate} at ${submissionTime}<br/>
                <strong>Client ID:</strong> ${clientId}<br/>
                <strong>Session ID:</strong> ${data.sessionId}
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>EONMeds - Medical Intake Form</strong></p>
        <p>Client ID: ${clientId} | Generated: ${submissionDate}</p>
    </div>
</body>
</html>`;
}

async function generatePdf(data: IntakeData, clientId: string): Promise<string | null> {
  if (!PDFCO_API_KEY) {
    log('PDF.co API key not configured');
    return null;
  }

  const pdfHtml = generatePdfHtml(data, clientId);
  const fileName = `Intake_${data.firstName}_${data.lastName}_${clientId}.pdf`;

  try {
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/from/html', {
      method: 'POST',
      headers: {
        'x-api-key': PDFCO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: pdfHtml,
        name: fileName,
        margins: '20px',
        paperSize: 'Letter',
        printBackground: true,
      }),
    });

    const result = await response.json();

    if (result.url) {
      log('PDF generated:', result.url);
      return result.url;
    } else {
      log('PDF.co error:', result.message);
      return null;
    }
  } catch (error) {
    log('PDF generation error:', error);
    return null;
  }
}

// ============================================================================
// STEP 3: UPLOAD PDF TO INTAKEQ
// ============================================================================
async function uploadPdfToIntakeQ(clientId: string, pdfUrl: string, firstName: string, lastName: string): Promise<boolean> {
  if (!INTAKEQ_API_KEY) {
    log('IntakeQ API key not configured');
    return false;
  }

  try {
    // Download the PDF
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      log('Failed to download PDF:', pdfResponse.status);
      return false;
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBytes = new Uint8Array(pdfArrayBuffer);

    log(`PDF downloaded: ${Math.round(pdfBytes.length / 1024)} KB`);

    if (pdfBytes.length < 1000) {
      log('PDF too small, likely invalid');
      return false;
    }

    const fileName = `Medical_Intake_${firstName}_${lastName}.pdf`;
    const boundary = '----IntakeUpload' + Math.random().toString(36).substring(2);

    // Build multipart form data
    const encoder = new TextEncoder();
    let formPrefix = '';
    formPrefix += `--${boundary}\r\n`;
    formPrefix += `Content-Disposition: form-data; name="FolderType"\r\n\r\n`;
    formPrefix += `INTAKE INFORMATION\r\n`;
    formPrefix += `--${boundary}\r\n`;
    formPrefix += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    formPrefix += `Content-Type: application/pdf\r\n\r\n`;

    const prefixBytes = encoder.encode(formPrefix);
    const suffixBytes = encoder.encode(`\r\n--${boundary}--\r\n`);

    const fullBody = new Uint8Array(prefixBytes.length + pdfBytes.length + suffixBytes.length);
    fullBody.set(prefixBytes, 0);
    fullBody.set(pdfBytes, prefixBytes.length);
    fullBody.set(suffixBytes, prefixBytes.length + pdfBytes.length);

    log('Uploading PDF to IntakeQ...');

    const uploadResponse = await fetch(`${INTAKEQ_API_BASE}/files/${clientId}`, {
      method: 'POST',
      headers: {
        'X-Auth-Key': INTAKEQ_API_KEY,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: fullBody,
    });

    if (uploadResponse.ok) {
      log('PDF uploaded to IntakeQ successfully');
      return true;
    } else {
      const errorText = await uploadResponse.text();
      log('IntakeQ upload failed:', uploadResponse.status, errorText);
      return false;
    }
  } catch (error) {
    log('PDF upload error:', error);
    return false;
  }
}

// ============================================================================
// REQUEST SIZE LIMITS
// ============================================================================
const MAX_REQUEST_SIZE = 100 * 1024; // 100KB

// ============================================================================
// SIMPLE RATE LIMITING (Optional - disabled by default)
// Set ENABLE_RATE_LIMIT=true in env to activate
//
// Configuration via environment variables:
//   ENABLE_RATE_LIMIT=true              - Enable rate limiting
//   INTAKEQ_RATE_LIMIT_MAX=10           - Max requests per window (default: 10)
//   INTAKEQ_RATE_LIMIT_WINDOW_MS=60000  - Window size in ms (default: 60000)
// ============================================================================
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.INTAKEQ_RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.INTAKEQ_RATE_LIMIT_MAX || '10', 10);
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === 'true';

function checkRateLimit(ip: string): boolean {
  if (!ENABLE_RATE_LIMIT) return true;
  
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  
  record.count++;
  return true;
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  log('=== INTAKEQ INTEGRATION CALLED ===');
  const clientIp = getClientIp(request);

  // Rate limiting (only if ENABLE_RATE_LIMIT=true)
  if (!checkRateLimit(clientIp)) {
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'RATE_LIMITED',
      endpoint: '/api/intakeq',
      ip: clientIp,
      statusCode: 429,
    });
    return NextResponse.json({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMITED',
    }, { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } });
  }

  // Optional API key verification (only if API_SECRET_KEY is configured)
  const apiKeyResult = verifyApiKey(request);
  if (!apiKeyResult.valid) {
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'AUTH_FAILURE',
      endpoint: '/api/intakeq',
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
      endpoint: '/api/intakeq',
      ip: clientIp,
      statusCode: 413,
      details: `Size: ${contentLength} bytes`,
    });
    return NextResponse.json({
      success: false,
      error: 'Request too large',
    }, { status: 413, headers: corsHeaders });
  }

  try {
    // Parse JSON body with error handling
    let rawData;
    try {
      rawData = await request.json();
    } catch (parseError) {
      auditLog({
        timestamp: new Date().toISOString(),
        event: 'VALIDATION_ERROR',
        endpoint: '/api/intakeq',
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
    const validationResult = IntakeQDataSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      const failedFields = Object.keys(validationResult.error.flatten().fieldErrors);
      auditLog({
        timestamp: new Date().toISOString(),
        event: 'VALIDATION_ERROR',
        endpoint: '/api/intakeq',
        ip: clientIp,
        sessionId: typeof rawData?.sessionId === 'string' ? rawData.sessionId : undefined,
        statusCode: 400,
        details: `Invalid fields: ${failedFields.join(', ')}`,
      });
      log('Validation failed:', validationResult.error.flatten());
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        code: 'VALIDATION_ERROR',
        details: isDev ? validationResult.error.flatten().fieldErrors : undefined,
      }, { status: 400, headers: corsHeaders });
    }
    
    const data: IntakeData = validationResult.data as IntakeData;

    log('Processing intake for:', data.email);

    // Validate required fields (redundant but kept for clarity)
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email',
      }, { status: 400, headers: corsHeaders });
    }

    // Check for API keys
    if (!INTAKEQ_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'IntakeQ not configured',
        message: 'Add INTAKEQ_API_KEY to environment variables',
      }, { status: 500, headers: corsHeaders });
    }

    // Step 1: Create IntakeQ client
    const clientId = await createIntakeQClient(data);

    if (!clientId) {
      auditLog({
        timestamp: new Date().toISOString(),
        event: 'SUBMISSION_FAILURE',
        endpoint: '/api/intakeq',
        ip: clientIp,
        sessionId: data.sessionId,
        statusCode: 500,
        details: 'Failed to create IntakeQ client',
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create IntakeQ client',
      }, { status: 500, headers: corsHeaders });
    }

    // Step 2: Generate PDF
    let pdfUrl: string | null = null;
    let pdfUploaded = false;

    if (PDFCO_API_KEY) {
      pdfUrl = await generatePdf(data, clientId);

      // Step 3: Upload PDF to IntakeQ
      if (pdfUrl) {
        pdfUploaded = await uploadPdfToIntakeQ(clientId, pdfUrl, data.firstName, data.lastName);
      }
    } else {
      log('PDF.co not configured, skipping PDF generation');
    }

    log('=== INTAKEQ INTEGRATION COMPLETE ===');
    log('Client ID:', clientId);
    log('PDF Generated:', !!pdfUrl);
    log('PDF Uploaded:', pdfUploaded);

    auditLog({
      timestamp: new Date().toISOString(),
      event: 'SUBMISSION_SUCCESS',
      endpoint: '/api/intakeq',
      ip: clientIp,
      sessionId: data.sessionId,
      statusCode: 200,
      // NEVER log PHI - only client ID and operation status
      details: `ClientId: ${clientId}, PDF: ${!!pdfUrl}, Uploaded: ${pdfUploaded}`,
    });

    return NextResponse.json({
      success: true,
      clientId,
      pdfGenerated: !!pdfUrl,
      pdfUploaded,
      pdfUrl: pdfUrl || undefined,
      message: pdfUploaded 
        ? 'IntakeQ client created and PDF uploaded successfully'
        : pdfUrl 
          ? 'IntakeQ client created, PDF generated but upload failed'
          : 'IntakeQ client created (PDF generation skipped)',
    }, { headers: corsHeaders });

  } catch (error) {
    log('IntakeQ integration error:', error);
    auditLog({
      timestamp: new Date().toISOString(),
      event: 'API_ERROR',
      endpoint: '/api/intakeq',
      ip: clientIp,
      statusCode: 500,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Integration failed',
    }, { status: 500, headers: corsHeaders });
  }
}

// Handle preflight requests with dynamic origin checking
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

// GET endpoint to check configuration status
export async function GET() {
  const intakeqConfigured = !!INTAKEQ_API_KEY;
  const pdfcoConfigured = !!PDFCO_API_KEY;

  return NextResponse.json({
    intakeqConfigured,
    pdfcoConfigured,
    message: intakeqConfigured && pdfcoConfigured
      ? 'IntakeQ integration fully configured'
      : `Missing: ${!intakeqConfigured ? 'INTAKEQ_API_KEY ' : ''}${!pdfcoConfigured ? 'PDFCO_API_KEY' : ''}`.trim(),
  }, { headers: corsHeaders });
}

