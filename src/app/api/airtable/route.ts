import { NextRequest, NextResponse } from 'next/server';

// Airtable API configuration - uses Personal Access Token (PAT)
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Intake Submissions';

// Known safe field names that exist in Airtable
// Add fields here as you create them in Airtable
const KNOWN_AIRTABLE_FIELDS = new Set([
  'Session ID',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Date of Birth',
  'Sex',
  'Blood Pressure',
  'Pregnancy/Breastfeeding',
  'State',
  'Address',
  'Current Weight (lbs)',
  'Ideal Weight (lbs)',
  'Height',
  'BMI',
  'Goals',
  'Activity Level',
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
  'Personal Diabetes T2',
  'Personal Gastroparesis',
  'Personal Pancreatitis',
  'Personal Thyroid Cancer',
  'Personal MEN',
  'Has Mental Health',
  'Has Chronic Conditions',
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
  'Alcohol Consumption',
  'Recreational Drugs',
  'Weight Loss History',
  'Weight Loss Support',
  'Health Improvements',
  'Referral Sources',
  'Referrer Name',
  'Referrer Type',
  'Qualified',
  'Taking Medications',
  'Personalized Treatment Interest',
  'Submitted At',
  'Language',
  'Privacy Policy Accepted',
  'Privacy Policy Accepted At',
  'Terms of Use Accepted',
  'Terms of Use Accepted At',
  'Telehealth Consent Accepted',
  'Telehealth Consent Accepted At',
  'Cancellation Policy Accepted',
  'Cancellation Policy Accepted At',
  'Florida Bill of Rights Accepted',
  'Florida Bill of Rights Accepted At',
  'Florida Consent Accepted',
  'Florida Consent Accepted At',
]);

interface IntakeRecord {
  sessionId: string;
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
  // Weight & BMI
  currentWeight?: number;
  idealWeight?: number;
  height?: string;
  bmi?: number;
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
  // Consent tracking
  privacyPolicyAccepted?: boolean;
  privacyPolicyAcceptedAt?: string;
  termsOfUseAccepted?: boolean;
  termsOfUseAcceptedAt?: string;
  telehealthConsentAccepted?: boolean;
  telehealthConsentAcceptedAt?: string;
  cancellationPolicyAccepted?: boolean;
  cancellationPolicyAcceptedAt?: string;
  floridaBillOfRightsAccepted?: boolean;
  floridaBillOfRightsAcceptedAt?: string;
  floridaConsentAccepted?: boolean;
  floridaConsentAcceptedAt?: string;
}

// CORS headers for checkout domain (allow both production and dev URLs)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: NextRequest) {
  try {
    const data: IntakeRecord = await request.json();
    
    console.log('Received intake submission:', { sessionId: data.sessionId, firstName: data.firstName });
    // Check for required environment variables
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      console.error('Airtable not configured! AIRTABLE_PAT:', !!AIRTABLE_PAT, 'AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
      return NextResponse.json({
        success: false,
        error: 'Airtable not configured',
        message: 'Add AIRTABLE_PAT and AIRTABLE_BASE_ID to environment variables',
        recordId: `LOCAL-${Date.now()}`
      }, { headers: corsHeaders });
    }

    // Build fields object - only include non-empty values
    // This prevents 422 errors when Airtable table doesn't have all columns
    const allFields: Record<string, unknown> = {
      'Session ID': data.sessionId,
      'First Name': data.firstName,
      'Last Name': data.lastName,
      'Email': data.email,
      'Phone': data.phone,
      'Date of Birth': data.dob,
      'Sex': data.sex,
      'Blood Pressure': data.bloodPressure,
      'Pregnancy/Breastfeeding': data.pregnancyBreastfeeding,
      'State': data.state,
      'Address': data.address,
      'Current Weight (lbs)': data.currentWeight,
      'Ideal Weight (lbs)': data.idealWeight,
      'Height': data.height,
      'BMI': data.bmi,
      'Goals': data.goals,
      'Activity Level': data.activityLevel,
      'Chronic Conditions': data.chronicConditions,
      'Digestive Conditions': data.digestiveConditions,
      'Medications': data.medications,
      'Allergies': data.allergies,
      'Mental Health Conditions': data.mentalHealthConditions,
      'Surgery History': data.surgeryHistory,
      'Surgery Details': data.surgeryDetails,
      'Family Conditions': data.familyConditions,
      'Kidney Conditions': data.kidneyConditions,
      'Medical Conditions': data.medicalConditions,
      'Personal Diabetes T2': data.personalDiabetes,
      'Personal Gastroparesis': data.personalGastroparesis,
      'Personal Pancreatitis': data.personalPancreatitis,
      'Personal Thyroid Cancer': data.personalThyroidCancer,
      'Personal MEN': data.personalMen,
      'Has Mental Health': data.hasMentalHealth,
      'Has Chronic Conditions': data.hasChronicConditions,
      'GLP-1 History': data.glp1History,
      'GLP-1 Type': data.glp1Type,
      'Side Effects': data.sideEffects,
      'Medication Preference': data.medicationPreference,
      'Semaglutide Dosage': data.semaglutideDosage,
      'Semaglutide Side Effects': data.semaglutideSideEffects,
      'Semaglutide Success': data.semaglutideSuccess,
      'Tirzepatide Dosage': data.tirzepatideDosage,
      'Tirzepatide Side Effects': data.tirzepatideSideEffects,
      'Tirzepatide Success': data.tirzepatideSuccess,
      'Dosage Satisfaction': data.dosageSatisfaction,
      'Dosage Interest': data.dosageInterest,
      'Alcohol Consumption': data.alcoholConsumption,
      'Recreational Drugs': data.recreationalDrugs,
      'Weight Loss History': data.weightLossHistory,
      'Weight Loss Support': data.weightLossSupport,
      'Health Improvements': data.healthImprovements,
      'Referral Sources': data.referralSources,
      'Referrer Name': data.referrerName,
      'Referrer Type': data.referrerType,
      'Qualified': data.qualified,
      'Taking Medications': data.takingMedications,
      'Personalized Treatment Interest': data.personalizedTreatmentInterest,
      'Submitted At': data.submittedAt || new Date().toISOString(),
      'Language': data.flowLanguage,
      'Privacy Policy Accepted': data.privacyPolicyAccepted,
      'Privacy Policy Accepted At': data.privacyPolicyAcceptedAt,
      'Terms of Use Accepted': data.termsOfUseAccepted,
      'Terms of Use Accepted At': data.termsOfUseAcceptedAt,
      'Telehealth Consent Accepted': data.telehealthConsentAccepted,
      'Telehealth Consent Accepted At': data.telehealthConsentAcceptedAt,
      'Cancellation Policy Accepted': data.cancellationPolicyAccepted,
      'Cancellation Policy Accepted At': data.cancellationPolicyAcceptedAt,
      'Florida Bill of Rights Accepted': data.floridaBillOfRightsAccepted,
      'Florida Bill of Rights Accepted At': data.floridaBillOfRightsAcceptedAt,
      'Florida Consent Accepted': data.floridaConsentAccepted,
      'Florida Consent Accepted At': data.floridaConsentAcceptedAt,
    };

    // Filter out undefined/null/empty values AND unknown field names to prevent Airtable 422 errors
    const fields: Record<string, unknown> = {};
    const skippedFields: string[] = [];
    
    for (const [key, value] of Object.entries(allFields)) {
      // Skip empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Only include fields that are known to exist in Airtable
      // This prevents 422 errors for missing columns
      if (KNOWN_AIRTABLE_FIELDS.has(key)) {
        fields[key] = value;
      } else {
        skippedFields.push(key);
      }
    }

    console.log('Sending fields to Airtable:', Object.keys(fields));
    if (skippedFields.length > 0) {
      console.log('Skipped unknown fields:', skippedFields);
    }

    // Send to Airtable using Personal Access Token with retry logic
    let lastError: unknown = null;
    let response: Response | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_PAT}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fields }),
          }
        );
        
        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        // If it's a 422 (validation error), don't retry - it will fail again
        if (response.status === 422) {
          break;
        }
        
        console.log(`Airtable attempt ${attempt} failed with status ${response.status}, retrying...`);
        lastError = `HTTP ${response.status}`;
        
      } catch (fetchError) {
        console.log(`Airtable attempt ${attempt} network error:`, fetchError);
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
      
      console.error('Airtable error after retries:', JSON.stringify(errorData, null, 2));
      console.error('Fields sent:', Object.keys(fields));

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

    console.log('Successfully saved to Airtable with ID:', result.id);
    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Successfully saved to Airtable',
      fieldsSaved: Object.keys(fields).length
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error saving to Airtable:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save data'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
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

    // HIPAA Compliant: Only return data needed for checkout pre-fill
    // Do NOT return sensitive medical information
    const checkoutData = {
      success: true,
      data: {
        firstName: record.fields['First Name'] || '',
        lastName: record.fields['Last Name'] || '',
        email: record.fields['Email'] || '',
        phone: record.fields['Phone'] || '',
        state: record.fields['State'] || '',
        address: record.fields['Address'] || '',
        medicationPreference: record.fields['Medication Preference'] || '',
        qualified: record.fields['Qualified'] ?? false,
      }
    };

    return NextResponse.json(checkoutData, { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
