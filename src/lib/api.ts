// API functions for submitting intake data at checkpoints
import { translations } from '@/translations';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eonpro.io';

// Mapping for common stored values to English
const valueToEnglish: Record<string, string> = {
  // Sex
  'man': 'Man',
  'woman': 'Woman',
  'hombre': 'Man',
  'mujer': 'Woman',
  
  // Yes/No
  'yes': 'Yes',
  'no': 'No',
  'sí': 'Yes',
  'si': 'Yes',
  
  // GLP-1 History
  'currently_taking': 'Currently taking GLP-1',
  'previously_taken': 'Previously taken GLP-1',
  'never_taken': 'Never taken GLP-1',
  
  // GLP-1 Types
  'semaglutide': 'Semaglutide',
  'tirzepatide': 'Tirzepatide',
  
  // Medication preference
  'recommendation': 'Looking for a recommendation',
  'have_in_mind': 'Already have something in mind',
  
  // Activity levels
  '1': 'Not very active (1)',
  '2': 'Low activity (2)',
  '3': 'Moderately active (3)',
  '4': 'Active (4)',
  '5': 'Very active (5)',
  
  // Blood pressure
  'normal': 'Normal',
  'high': 'High',
  'low': 'Low',
  'dont_know': "Don't know",
  'no_se': "Don't know",
  
  // Satisfaction levels
  'satisfied': 'Satisfied',
  'not_satisfied': 'Not satisfied',
  'somewhat': 'Somewhat satisfied',
  
  // Success levels
  'successful': 'Successful',
  'not_successful': 'Not successful',
  'partial': 'Partial success',
};

// Helper function to convert translation keys to English text
function toEnglish(value: string | undefined | null): string {
  if (!value) return '';
  
  // Check if it's a known value mapping
  const lowerValue = value.toLowerCase();
  if (valueToEnglish[lowerValue]) {
    return valueToEnglish[lowerValue];
  }
  if (valueToEnglish[value]) {
    return valueToEnglish[value];
  }
  
  // If it's a translation key (contains a dot and exists in translations)
  const enTranslations = translations.en as Record<string, string>;
  if (value.includes('.') && enTranslations[value]) {
    return enTranslations[value];
  }
  
  // Check if value is a Spanish translation and find the English equivalent
  const esTranslations = translations.es as Record<string, string>;
  for (const [key, esValue] of Object.entries(esTranslations)) {
    if (esValue === value && enTranslations[key]) {
      return enTranslations[key];
    }
  }
  
  // Return original value if not a translation key (already in English or raw data)
  return value;
}

// Helper function to convert an array of values to English
function arrayToEnglish(arr: string[] | undefined | null): string[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(item => toEnglish(item));
}

export interface CheckpointData {
  checkpointName: string;
  timestamp: string;
  data: Record<string, unknown>;
  sessionId: string;
  status: 'partial' | 'complete' | 'qualified';
}

export interface IntakeSubmission {
  sessionId: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dob?: any;
  };
  address?: any;
  medicalProfile?: {
    weight?: any;
    bmi?: number;
    goals?: string[];
    activityLevel?: string;
  };
  medicalHistory?: {
    chronicConditions?: string[];
    digestiveConditions?: string[];
    medications?: string[];
    allergies?: string[];
    mentalHealthConditions?: string[];
  };
  glp1Profile?: {
    history?: string;
    type?: string;
    sideEffects?: string[];
    medicationPreference?: string;
  };
  qualificationStatus?: {
    qualified?: boolean;
    completedAt?: string;
    checkpoints?: string[];
  };
}

// Generate or get session ID
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('intake_session_id');
  if (!sessionId) {
    sessionId = `EON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('intake_session_id', sessionId);
  }
  return sessionId;
}

// Submit checkpoint data
export async function submitCheckpoint(
  checkpointName: string,
  data: any,
  status: 'partial' | 'complete' | 'qualified' = 'partial'
): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    
    const checkpointData: CheckpointData = {
      checkpointName,
      timestamp: new Date().toISOString(),
      data,
      sessionId,
      status
    };

    // Store locally first (backup)
    const existingCheckpoints = JSON.parse(
      sessionStorage.getItem('intake_checkpoints') || '[]'
    );
    existingCheckpoints.push(checkpointData);
    sessionStorage.setItem('intake_checkpoints', JSON.stringify(existingCheckpoints));

    // Send to API (commented out until backend is ready)
    // const response = await fetch(`${API_BASE_URL}/intake/checkpoint`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(checkpointData)
    // });

    // return response.ok;
    return true; // Return true for now since data is saved locally
  } catch (error) {
    console.error('Checkpoint submission failed:', error);
    // Data is still saved locally
    return false;
  }
}

// Submit complete intake data to Airtable
export async function submitIntake(intakeData: IntakeSubmission): Promise<{
  success: boolean;
  intakeId?: string;
  error?: string;
}> {
  try {
    // Prepare data for Airtable - ALL RESPONSES IN ENGLISH regardless of flow language
    const airtableData = {
      sessionId: intakeData.sessionId,
      firstName: intakeData.personalInfo?.firstName,
      lastName: intakeData.personalInfo?.lastName,
      email: intakeData.personalInfo?.email,
      phone: intakeData.personalInfo?.phone,
      dob: typeof intakeData.personalInfo?.dob === 'object' 
        ? JSON.stringify(intakeData.personalInfo.dob)
        : intakeData.personalInfo?.dob,
      state: intakeData.address?.state,
      address: typeof intakeData.address === 'object'
        ? JSON.stringify(intakeData.address)
        : intakeData.address,
      currentWeight: intakeData.medicalProfile?.weight?.currentWeight,
      idealWeight: intakeData.medicalProfile?.weight?.idealWeight,
      heightFeet: intakeData.medicalProfile?.weight?.heightFeet,
      heightInches: intakeData.medicalProfile?.weight?.heightInches,
      bmi: intakeData.medicalProfile?.bmi,
      // Convert goals to English
      goals: Array.isArray(intakeData.medicalProfile?.goals) 
        ? arrayToEnglish(intakeData.medicalProfile.goals).join(', ')
        : toEnglish(intakeData.medicalProfile?.goals as string | undefined),
      // Convert activity level to English
      activityLevel: toEnglish(intakeData.medicalProfile?.activityLevel),
      // Convert medical conditions to English
      chronicConditions: Array.isArray(intakeData.medicalHistory?.chronicConditions)
        ? arrayToEnglish(intakeData.medicalHistory.chronicConditions).join(', ')
        : toEnglish(intakeData.medicalHistory?.chronicConditions as string | undefined),
      digestiveConditions: Array.isArray(intakeData.medicalHistory?.digestiveConditions)
        ? arrayToEnglish(intakeData.medicalHistory.digestiveConditions).join(', ')
        : toEnglish(intakeData.medicalHistory?.digestiveConditions as string | undefined),
      medications: Array.isArray(intakeData.medicalHistory?.medications)
        ? arrayToEnglish(intakeData.medicalHistory.medications).join(', ')
        : toEnglish(intakeData.medicalHistory?.medications as string | undefined),
      allergies: Array.isArray(intakeData.medicalHistory?.allergies)
        ? arrayToEnglish(intakeData.medicalHistory.allergies).join(', ')
        : toEnglish(intakeData.medicalHistory?.allergies as string | undefined),
      mentalHealthConditions: Array.isArray(intakeData.medicalHistory?.mentalHealthConditions)
        ? arrayToEnglish(intakeData.medicalHistory.mentalHealthConditions).join(', ')
        : toEnglish(intakeData.medicalHistory?.mentalHealthConditions as string | undefined),
      // Convert GLP-1 related fields to English
      glp1History: toEnglish(intakeData.glp1Profile?.history),
      glp1Type: toEnglish(intakeData.glp1Profile?.type),
      sideEffects: Array.isArray(intakeData.glp1Profile?.sideEffects)
        ? arrayToEnglish(intakeData.glp1Profile.sideEffects).join(', ')
        : toEnglish(intakeData.glp1Profile?.sideEffects as string | undefined),
      medicationPreference: toEnglish(intakeData.glp1Profile?.medicationPreference),
      qualified: intakeData.qualificationStatus?.qualified,
      submittedAt: intakeData.qualificationStatus?.completedAt || new Date().toISOString(),
      // Keep track of original flow language for reference
      flowLanguage: sessionStorage.getItem('preferredLanguage') || 'en',
    };

    // Send to Airtable API route
    const response = await fetch('/api/airtable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData)
    });

    const result = await response.json();
    
    // Save submission status locally
    if (result.success) {
      sessionStorage.setItem('intake_submitted', 'true');
      sessionStorage.setItem('intake_id', result.recordId || `INTAKE-${Date.now()}`);
    }

    return {
      success: result.success,
      intakeId: result.recordId || `INTAKE-${Date.now()}`,
      error: result.error
    };
  } catch (error) {
    console.error('Intake submission failed:', error);
    
    // Fallback: save locally even if API fails - but report as failure
    const fallbackId = `LOCAL-${Date.now()}`;
    sessionStorage.setItem('intake_pending_sync', 'true');
    sessionStorage.setItem('intake_id', fallbackId);
    
    return {
      success: false,
      intakeId: fallbackId,
      error: error instanceof Error ? error.message : 'API unavailable - data saved locally for retry'
    };
  }
}

// Collect all session data for submission
export function collectIntakeData(): IntakeSubmission {
  const sessionId = getSessionId();
  
  // Parse stored data
  const nameData = sessionStorage.getItem('intake_name');
  const contactData = sessionStorage.getItem('intake_contact');
  const dobData = sessionStorage.getItem('intake_dob');
  const addressData = sessionStorage.getItem('intake_address');
  const weightData = sessionStorage.getItem('intake_weight');
  const goalsData = sessionStorage.getItem('goals');
  const activityData = sessionStorage.getItem('activity_level');
  
  // Medical history
  const chronicConditions = sessionStorage.getItem('chronic_conditions');
  const digestiveConditions = sessionStorage.getItem('digestive_conditions');
  const medications = sessionStorage.getItem('medications_list');
  const allergies = sessionStorage.getItem('allergies');
  const mentalHealth = sessionStorage.getItem('mental_health_conditions');
  
  // GLP-1 data
  const glp1History = sessionStorage.getItem('glp1_history');
  const glp1Type = sessionStorage.getItem('glp1_type');
  const sideEffects = sessionStorage.getItem('common_side_effects');
  const medicationPref = sessionStorage.getItem('medication_preference');
  
  const intakeData: IntakeSubmission = {
    sessionId,
    personalInfo: {
      ...(nameData ? JSON.parse(nameData) : {}),
      ...(contactData ? JSON.parse(contactData) : {}),
      dob: dobData ? JSON.parse(dobData) : null
    },
    address: addressData ? JSON.parse(addressData) : null,
    medicalProfile: {
      weight: weightData ? JSON.parse(weightData) : null,
      bmi: calculateBMI(weightData) || undefined,
      goals: goalsData ? JSON.parse(goalsData) : [],
      activityLevel: activityData || ''
    },
    medicalHistory: {
      chronicConditions: chronicConditions ? JSON.parse(chronicConditions) : [],
      digestiveConditions: digestiveConditions ? JSON.parse(digestiveConditions) : [],
      medications: medications ? JSON.parse(medications) : [],
      allergies: allergies ? JSON.parse(allergies) : [],
      mentalHealthConditions: mentalHealth ? JSON.parse(mentalHealth) : []
    },
    glp1Profile: {
      history: glp1History || '',
      type: glp1Type || '',
      sideEffects: sideEffects ? JSON.parse(sideEffects) : [],
      medicationPreference: medicationPref || ''
    },
    qualificationStatus: {
      qualified: true,
      completedAt: new Date().toISOString(),
      checkpoints: JSON.parse(sessionStorage.getItem('completed_checkpoints') || '[]')
    }
  };
  
  return intakeData;
}

// Helper function to calculate BMI
function calculateBMI(weightDataStr: string | null): number | null {
  if (!weightDataStr) return null;
  
  try {
    const weightData = JSON.parse(weightDataStr);
    const weight = weightData.currentWeight;
    const heightInches = (weightData.heightFeet || 0) * 12 + (weightData.heightInches || 0);
    
    if (weight && heightInches) {
      const bmi = (weight / (heightInches * heightInches)) * 703;
      return Math.round(bmi * 10) / 10;
    }
  } catch (e) {
    console.error('BMI calculation error:', e);
  }
  
  return null;
}

// Mark checkpoint as completed
export function markCheckpointCompleted(checkpointName: string): void {
  const completed = JSON.parse(
    sessionStorage.getItem('completed_checkpoints') || '[]'
  );
  if (!completed.includes(checkpointName)) {
    completed.push(checkpointName);
    sessionStorage.setItem('completed_checkpoints', JSON.stringify(completed));
  }
}
