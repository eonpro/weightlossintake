/**
 * EMR API Client
 * 
 * Centralized client for interacting with the EONPRO EMR system.
 * Configure via environment variables:
 *   - EMR_API_URL: Base URL for the EMR API
 *   - EMR_API_KEY: API key for authentication
 *   - EMR_API_SECRET: Secret for signing requests (if needed)
 */

import { logger } from './logger';

// =============================================================================
// CONFIGURATION
// =============================================================================

const EMR_API_URL = process.env.EMR_API_URL || process.env.EONPRO_WEBHOOK_URL?.replace('/webhook', '');
const EMR_API_KEY = process.env.EMR_API_KEY;
const EMR_API_SECRET = process.env.EMR_API_SECRET || process.env.EONPRO_WEBHOOK_SECRET;
const EMR_TIMEOUT_MS = 30000; // 30 second timeout

// Check if EMR is configured
export const isEMRConfigured = (): boolean => {
  return !!(EMR_API_URL && (EMR_API_KEY || EMR_API_SECRET));
};

// =============================================================================
// TYPES
// =============================================================================

export interface EMRPatient {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EMRIntakeSubmission {
  submissionId: string;
  patientId?: string | number;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  data: Record<string, unknown>;
}

export interface EMRProviderInfo {
  id: string | number;
  name: string;
  credentials?: string;
  specialty?: string;
  npi?: string;
}

export interface EMRApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requestId?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  medicalHistory?: {
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    surgeries?: string[];
  };
  intakeData?: Record<string, unknown>;
}

export interface SubmitIntakeRequest {
  patientId?: string | number;
  sessionId: string;
  data: Record<string, unknown>;
  source?: string;
  language?: string;
}

// =============================================================================
// API CLIENT CLASS
// =============================================================================

class EMRClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private apiSecret: string | undefined;

  constructor() {
    this.baseUrl = EMR_API_URL || '';
    this.apiKey = EMR_API_KEY;
    this.apiSecret = EMR_API_SECRET;
  }

  /**
   * Check if the EMR client is properly configured
   */
  isConfigured(): boolean {
    return isEMRConfigured();
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): { configured: boolean; hasUrl: boolean; hasAuth: boolean } {
    return {
      configured: this.isConfigured(),
      hasUrl: !!this.baseUrl,
      hasAuth: !!(this.apiKey || this.apiSecret),
    };
  }

  /**
   * Make an authenticated request to the EMR API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<EMRApiResponse<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'EMR API not configured',
      };
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...(this.apiSecret && { 'X-API-Secret': this.apiSecret }),
      ...(this.apiSecret && { 'X-Webhook-Secret': this.apiSecret }), // Backwards compatible
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EMR_TIMEOUT_MS);

    try {
      logger.log(`[EMR] ${options.method || 'GET'} ${endpoint}`);

      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string>) },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        logger.error(`[EMR] Error ${response.status}:`, data);
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
          requestId: data.requestId,
        };
      }

      return {
        success: true,
        data: data.data || data,
        requestId: data.requestId,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('[EMR] Request timeout');
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      logger.error('[EMR] Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ===========================================================================
  // PATIENT OPERATIONS
  // ===========================================================================

  /**
   * Create a new patient in the EMR
   */
  async createPatient(patient: CreatePatientRequest): Promise<EMRApiResponse<EMRPatient>> {
    return this.request<EMRPatient>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  /**
   * Get a patient by ID
   */
  async getPatient(patientId: string | number): Promise<EMRApiResponse<EMRPatient>> {
    return this.request<EMRPatient>(`/api/v1/patients/${patientId}`);
  }

  /**
   * Search for a patient by email
   */
  async findPatientByEmail(email: string): Promise<EMRApiResponse<EMRPatient | null>> {
    return this.request<EMRPatient | null>(`/api/v1/patients/search?email=${encodeURIComponent(email)}`);
  }

  /**
   * Update a patient record
   */
  async updatePatient(
    patientId: string | number,
    updates: Partial<CreatePatientRequest>
  ): Promise<EMRApiResponse<EMRPatient>> {
    return this.request<EMRPatient>(`/api/v1/patients/${patientId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ===========================================================================
  // INTAKE OPERATIONS
  // ===========================================================================

  /**
   * Submit intake data to the EMR
   * This is the primary method for sending completed intake forms
   */
  async submitIntake(intake: SubmitIntakeRequest): Promise<EMRApiResponse<EMRIntakeSubmission>> {
    // Try the new API endpoint first, fall back to webhook
    const response = await this.request<EMRIntakeSubmission>('/api/v1/intakes', {
      method: 'POST',
      body: JSON.stringify({
        submissionId: `eonmeds-${intake.sessionId}-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        patientId: intake.patientId,
        data: {
          ...intake.data,
          intakeSource: intake.source || 'eonmeds-intake',
          language: intake.language || 'en',
        },
      }),
    });

    // If API endpoint doesn't exist, try webhook endpoint
    if (!response.success && response.error?.includes('404')) {
      return this.submitIntakeViaWebhook(intake);
    }

    return response;
  }

  /**
   * Submit intake via webhook (legacy method)
   */
  private async submitIntakeViaWebhook(intake: SubmitIntakeRequest): Promise<EMRApiResponse<EMRIntakeSubmission>> {
    return this.request<EMRIntakeSubmission>('/webhook', {
      method: 'POST',
      body: JSON.stringify({
        submissionId: `eonmeds-${intake.sessionId}-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        data: {
          ...intake.data,
          intakeSource: intake.source || 'eonmeds-intake',
          language: intake.language || 'en',
        },
      }),
    });
  }

  /**
   * Get intake submission status
   */
  async getIntakeStatus(submissionId: string): Promise<EMRApiResponse<EMRIntakeSubmission>> {
    return this.request<EMRIntakeSubmission>(`/api/v1/intakes/${submissionId}`);
  }

  // ===========================================================================
  // PROVIDER OPERATIONS
  // ===========================================================================

  /**
   * Get available providers for a state
   */
  async getProvidersByState(state: string): Promise<EMRApiResponse<EMRProviderInfo[]>> {
    return this.request<EMRProviderInfo[]>(`/api/v1/providers?state=${encodeURIComponent(state)}`);
  }

  /**
   * Get provider by ID
   */
  async getProvider(providerId: string | number): Promise<EMRApiResponse<EMRProviderInfo>> {
    return this.request<EMRProviderInfo>(`/api/v1/providers/${providerId}`);
  }

  // ===========================================================================
  // HEALTH CHECK
  // ===========================================================================

  /**
   * Check EMR API health/connectivity
   */
  async healthCheck(): Promise<EMRApiResponse<{ status: string; version?: string }>> {
    return this.request<{ status: string; version?: string }>('/api/v1/health');
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const emrClient = new EMRClient();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create or update a patient from intake data
 * Handles the logic of finding existing patient vs creating new
 */
export async function upsertPatientFromIntake(
  intakeData: CreatePatientRequest & { email: string }
): Promise<EMRApiResponse<EMRPatient>> {
  // First, try to find existing patient by email
  const existingPatient = await emrClient.findPatientByEmail(intakeData.email);

  if (existingPatient.success && existingPatient.data) {
    // Update existing patient
    logger.log('[EMR] Found existing patient, updating...');
    return emrClient.updatePatient(existingPatient.data.id, intakeData);
  }

  // Create new patient
  logger.log('[EMR] Creating new patient...');
  return emrClient.createPatient(intakeData);
}

/**
 * Full intake submission flow:
 * 1. Create/update patient in EMR
 * 2. Submit intake data
 * 3. Return combined result
 */
export async function processIntakeSubmission(
  patientData: CreatePatientRequest & { email: string },
  intakeData: Record<string, unknown>,
  sessionId: string,
  language: string = 'en'
): Promise<{
  success: boolean;
  patientId?: string | number;
  submissionId?: string;
  error?: string;
}> {
  if (!emrClient.isConfigured()) {
    return {
      success: false,
      error: 'EMR not configured',
    };
  }

  try {
    // Step 1: Create/update patient
    const patientResult = await upsertPatientFromIntake(patientData);

    if (!patientResult.success) {
      logger.error('[EMR] Failed to create/update patient:', patientResult.error);
      // Continue anyway - we'll submit without patient ID
    }

    const patientId = patientResult.data?.id;

    // Step 2: Submit intake data
    const intakeResult = await emrClient.submitIntake({
      patientId,
      sessionId,
      data: {
        ...intakeData,
        patientId,
      },
      source: 'eonmeds-intake',
      language,
    });

    if (!intakeResult.success) {
      return {
        success: false,
        patientId,
        error: intakeResult.error,
      };
    }

    return {
      success: true,
      patientId,
      submissionId: intakeResult.data?.submissionId,
    };
  } catch (error) {
    logger.error('[EMR] Intake submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default emrClient;
