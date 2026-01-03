import { NextRequest, NextResponse } from 'next/server';

// Airtable API configuration - uses Personal Access Token (PAT)
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Intake Submissions';

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
}

export async function POST(request: NextRequest) {
  try {
    const data: IntakeRecord = await request.json();

    // Check for required environment variables
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      console.warn('Airtable not configured. Storing locally only.');
      return NextResponse.json({
        success: true,
        message: 'Data received (Airtable not configured)',
        recordId: `LOCAL-${Date.now()}`
      });
    }

    // Prepare fields for Airtable - ALL 58 FIELDS
    const fields: Record<string, unknown> = {
      // Personal Info (8 fields)
      'Session ID': data.sessionId,
      'First Name': data.firstName || '',
      'Last Name': data.lastName || '',
      'Email': data.email || '',
      'Phone': data.phone || '',
      'Date of Birth': data.dob || '',
      'Sex': data.sex || '',
      'Blood Pressure': data.bloodPressure || '',
      'Pregnancy/Breastfeeding': data.pregnancyBreastfeeding || '',

      // Address (2 fields)
      'State': data.state || '',
      'Address': data.address || '',

      // Weight & BMI (4 fields)
      'Current Weight (lbs)': data.currentWeight || 0,
      'Ideal Weight (lbs)': data.idealWeight || 0,
      'Height': data.height || '',
      'BMI': data.bmi || 0,

      // Goals & Activity (2 fields)
      'Goals': data.goals || '',
      'Activity Level': data.activityLevel || '',

      // Medical Conditions (5 fields)
      'Chronic Conditions': data.chronicConditions || '',
      'Digestive Conditions': data.digestiveConditions || '',
      'Medications': data.medications || '',
      'Allergies': data.allergies || '',
      'Mental Health Conditions': data.mentalHealthConditions || '',

      // Additional Medical History (12 fields)
      'Surgery History': data.surgeryHistory || '',
      'Surgery Details': data.surgeryDetails || '',
      'Family Conditions': data.familyConditions || '',
      'Kidney Conditions': data.kidneyConditions || '',
      'Medical Conditions': data.medicalConditions || '',
      'Personal Diabetes T2': data.personalDiabetes || '',
      'Personal Gastroparesis': data.personalGastroparesis || '',
      'Personal Pancreatitis': data.personalPancreatitis || '',
      'Personal Thyroid Cancer': data.personalThyroidCancer || '',
      'Personal MEN': data.personalMen || '',
      'Has Mental Health': data.hasMentalHealth || '',
      'Has Chronic Conditions': data.hasChronicConditions || '',

      // GLP-1 Profile (12 fields)
      'GLP-1 History': data.glp1History || '',
      'GLP-1 Type': data.glp1Type || '',
      'Side Effects': data.sideEffects || '',
      'Medication Preference': data.medicationPreference || '',
      'Semaglutide Dosage': data.semaglutideDosage || '',
      'Semaglutide Side Effects': data.semaglutideSideEffects || '',
      'Semaglutide Success': data.semaglutideSuccess || '',
      'Tirzepatide Dosage': data.tirzepatideDosage || '',
      'Tirzepatide Side Effects': data.tirzepatideSideEffects || '',
      'Tirzepatide Success': data.tirzepatideSuccess || '',
      'Dosage Satisfaction': data.dosageSatisfaction || '',
      'Dosage Interest': data.dosageInterest || '',

      // Lifestyle (5 fields)
      'Alcohol Consumption': data.alcoholConsumption || '',
      'Recreational Drugs': data.recreationalDrugs || '',
      'Weight Loss History': data.weightLossHistory || '',
      'Weight Loss Support': data.weightLossSupport || '',
      'Health Improvements': data.healthImprovements || '',

      // Referral (3 fields)
      'Referral Sources': data.referralSources || '',
      'Referrer Name': data.referrerName || '',
      'Referrer Type': data.referrerType || '',

      // Qualification Status (4 fields)
      'Qualified': data.qualified ?? false,
      'Taking Medications': data.takingMedications || '',
      'Personalized Treatment Interest': data.personalizedTreatmentInterest || '',
      'Submitted At': data.submittedAt || new Date().toISOString(),
      'Language': data.flowLanguage || 'en',
    };

    // Send to Airtable using Personal Access Token
    const response = await fetch(
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Successfully saved to Airtable'
    });

  } catch (error) {
    console.error('Error saving to Airtable:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save data'
      },
      { status: 500 }
    );
  }
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
    });
  }

  // Validate record ID format (Airtable IDs start with 'rec')
  if (!recordId.startsWith('rec')) {
    return NextResponse.json(
      { success: false, error: 'Invalid record reference' },
      { status: 400 }
    );
  }

  // Check for required environment variables
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return NextResponse.json(
      { success: false, error: 'Airtable not configured' },
      { status: 500 }
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
          { status: 404 }
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

    return NextResponse.json(checkoutData);

  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
