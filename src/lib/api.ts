// API functions for submitting intake data at checkpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eonpro.io';

export interface CheckpointData {
  checkpointName: string;
  timestamp: string;
  data: any;
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

    // Send to API
    const response = await fetch(`${API_BASE_URL}/intake/checkpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkpointData)
    });

    return response.ok;
  } catch (error) {
    console.error('Checkpoint submission failed:', error);
    // Data is still saved locally
    return false;
  }
}

// Submit complete intake data
export async function submitIntake(intakeData: IntakeSubmission): Promise<{
  success: boolean;
  intakeId?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/intake/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...intakeData,
        submittedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Submission failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Clear local storage after successful submission
    if (result.success) {
      sessionStorage.setItem('intake_submitted', 'true');
      sessionStorage.setItem('intake_id', result.intakeId);
    }

    return result;
  } catch (error) {
    console.error('Intake submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Submission failed'
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
