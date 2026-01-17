/**
 * EMR Intake Submission Endpoint
 * 
 * POST /api/emr/submit
 * 
 * Direct submission to EMR (bypasses Airtable as primary).
 * Use this when you want EMR to be the primary data store.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processIntakeSubmission, isEMRConfigured } from '@/lib/emr-client';
import { logger } from '@/lib/logger';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://intake.eonmeds.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Input validation schema
const SubmitIntakeSchema = z.object({
  sessionId: z.string().min(1),
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    sex: z.string().optional(),
  }),
  address: z.object({
    street: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  medicalHistory: z.object({
    conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    surgeries: z.array(z.string()).optional(),
  }).optional(),
  intakeData: z.record(z.string(), z.unknown()).optional(),
  language: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Check if EMR is configured
  if (!isEMRConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'EMR integration not configured',
      message: 'Set EMR_API_URL and EMR_API_KEY environment variables.',
    }, { 
      status: 503,
      headers: corsHeaders 
    });
  }

  try {
    // Parse and validate input
    const body = await request.json();
    const validationResult = SubmitIntakeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: validationResult.error.flatten().fieldErrors,
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const data = validationResult.data;

    // Process the submission
    const result = await processIntakeSubmission(
      {
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        dateOfBirth: data.personalInfo.dob,
        gender: data.personalInfo.sex,
        address: data.address,
        medicalHistory: data.medicalHistory,
        intakeData: data.intakeData,
      },
      data.intakeData || {},
      data.sessionId,
      data.language || 'en'
    );

    if (!result.success) {
      logger.error('[EMR Submit] Failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    logger.log('[EMR Submit] Success:', {
      patientId: result.patientId,
      submissionId: result.submissionId,
    });

    return NextResponse.json({
      success: true,
      patientId: result.patientId,
      submissionId: result.submissionId,
      message: 'Intake submitted to EMR successfully',
    }, { headers: corsHeaders });

  } catch (error) {
    logger.error('[EMR Submit] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
