# EMR Integration Guide

## Overview

This platform supports integration with Electronic Medical Record (EMR) systems to streamline patient data flow from intake forms directly into clinical systems.

## Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Webhook Integration | ✅ Ready | Via EONPRO_WEBHOOK_URL |
| EMR API Client | ✅ Ready | `src/lib/emr-client.ts` |
| Patient Creation | ✅ Ready | Automated on intake completion |
| Health Check Endpoint | ✅ Ready | `/api/emr/health` |
| Direct EMR Submit | ✅ Ready | `/api/emr/submit` |
| Patient Portal | 🔲 Planned | Patient login/status viewing |
| Provider Dashboard | 🔲 Planned | Provider authentication |

---

## Architecture

```
┌─────────────────────┐
│  Patient Browser    │
│  (Intake Form)      │
└─────────┬───────────┘
          │ Submit
          ▼
┌─────────────────────┐
│  /api/airtable      │ ◄── Primary submission endpoint
│  (with EONPRO hook) │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌──────────┐
│Airtable│  │ EONPRO   │ ◄── Webhook notification
│(backup)│  │ EMR API  │
└────────┘  └──────────┘
```

---

## Configuration

### Environment Variables

```bash
# Primary EMR Configuration
EMR_API_URL=https://your-emr-api.com
EMR_API_KEY=your-api-key-here
EMR_API_SECRET=your-api-secret  # For webhook signing

# Legacy EONPRO Webhook (backwards compatible)
EONPRO_WEBHOOK_URL=https://api.eonpro.com/webhook
EONPRO_WEBHOOK_SECRET=your-webhook-secret
```

### Vercel Configuration

Add these in Vercel Dashboard → Project Settings → Environment Variables:

1. **EMR_API_URL**: Your EMR's base API URL
2. **EMR_API_KEY**: API authentication key
3. **EMR_API_SECRET**: Webhook secret for request signing

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/emr/health`

Tests EMR connectivity and configuration status.

**Response (Not Configured):**
```json
{
  "status": "not_configured",
  "configured": false,
  "hasUrl": false,
  "hasAuth": false,
  "message": "EMR integration is not configured...",
  "envVarsNeeded": [
    "EMR_API_URL or EONPRO_WEBHOOK_URL",
    "EMR_API_KEY or EONPRO_WEBHOOK_SECRET"
  ]
}
```

**Response (Healthy):**
```json
{
  "status": "healthy",
  "configured": true,
  "emrStatus": "ok",
  "emrVersion": "1.0.0",
  "timestamp": "2026-01-17T12:00:00.000Z"
}
```

### 2. Direct EMR Submit

**Endpoint:** `POST /api/emr/submit`

Submit intake data directly to EMR (bypasses Airtable as primary).

**Request Body:**
```json
{
  "sessionId": "abc123",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "dob": "1990-01-15",
    "sex": "male"
  },
  "address": {
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701"
  },
  "medicalHistory": {
    "conditions": ["diabetes", "hypertension"],
    "medications": ["Metformin"],
    "allergies": ["Penicillin"],
    "surgeries": ["Appendectomy 2015"]
  },
  "intakeData": {
    "weight": 185,
    "height": "5'10\"",
    "bmi": 26.5,
    "glp1History": "no",
    "goals": "weight loss, better energy"
  },
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "patientId": 12345,
  "submissionId": "eonmeds-abc123-1705499200000",
  "message": "Intake submitted to EMR successfully"
}
```

---

## EMR Client Library

### Location
`src/lib/emr-client.ts`

### Usage

```typescript
import { emrClient, processIntakeSubmission } from '@/lib/emr-client';

// Check if configured
if (emrClient.isConfigured()) {
  // Create a patient
  const patient = await emrClient.createPatient({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  });

  // Submit intake data
  const result = await emrClient.submitIntake({
    patientId: patient.data?.id,
    sessionId: 'abc123',
    data: { /* intake data */ },
  });
}

// Or use the full flow helper
const result = await processIntakeSubmission(
  patientData,
  intakeData,
  sessionId,
  language
);
```

### Available Methods

| Method | Description |
|--------|-------------|
| `isConfigured()` | Check if EMR is properly configured |
| `healthCheck()` | Test EMR API connectivity |
| `createPatient(data)` | Create a new patient |
| `getPatient(id)` | Get patient by ID |
| `findPatientByEmail(email)` | Search patient by email |
| `updatePatient(id, data)` | Update patient record |
| `submitIntake(data)` | Submit intake form data |
| `getIntakeStatus(id)` | Get intake submission status |
| `getProvidersByState(state)` | Get available providers |

---

## Data Flow Details

### 1. Current Flow (Airtable + EONPRO Webhook)

When a patient completes intake:

1. **Contact Info Page** (`/intake/contact-info`)
   - Submits midpoint data to `/api/airtable`
   - Triggers EONPRO webhook if configured

2. **Finding Provider Page** (`/intake/finding-provider`)
   - Submits final data to `/api/airtable`
   - Updates existing Airtable record
   - Triggers EONPRO webhook with full data

### 2. Alternative Flow (Direct EMR)

For EMR-first integration:

```typescript
// In your submission handler
import { processIntakeSubmission } from '@/lib/emr-client';

const result = await processIntakeSubmission(
  {
    firstName, lastName, email, phone,
    dateOfBirth: dob,
    gender: sex,
    address: { street, city, state, zipCode },
    medicalHistory: { conditions, medications, allergies },
  },
  allIntakeData,
  sessionId,
  language
);

if (result.success) {
  // Store EMR patient ID for future reference
  sessionStorage.setItem('emr_patient_id', result.patientId);
}
```

---

## EONPRO Webhook Payload

When the webhook is triggered, it sends this payload:

```json
{
  "submissionId": "eonmeds-{sessionId}-{airtableRecordId}",
  "submittedAt": "2026-01-17T12:00:00.000Z",
  "data": {
    // Patient identifiers
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    
    // Address
    "streetAddress": "123 Main St",
    "apartment": "Apt 4B",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    
    // Physical measurements
    "weight": "185",
    "idealWeight": "165",
    "height": "5'10\"",
    "bmi": "26.5",
    "bloodPressure": "120-129",
    
    // Medical history
    "currentMedications": "Metformin",
    "allergies": "Penicillin",
    "medicalConditions": "Type 2 Diabetes",
    "mentalHealthHistory": "None",
    "familyHistory": "Heart disease",
    "surgicalHistory": "Appendectomy 2015",
    
    // GLP-1 specific
    "glp1History": "no",
    "glp1Type": "",
    "medicationPreference": "semaglutide",
    "semaglutideDosage": "0.25mg",
    "previousSideEffects": "None",
    
    // Lifestyle
    "activityLevel": "moderate",
    "alcoholUse": "occasional",
    "recreationalDrugs": "no",
    "weightLossHistory": "diet",
    
    // Visit reason
    "reasonForVisit": "GLP-1 Weight Loss Treatment Consultation",
    "chiefComplaint": "Weight management",
    "healthGoals": "Lose weight, improve energy",
    
    // Metadata
    "qualified": "Yes",
    "language": "en",
    "intakeSource": "eonmeds-intake",
    "airtableRecordId": "rec123ABC"
  }
}
```

---

## Expected EMR API Endpoints

If your EMR supports REST APIs, implement these endpoints:

### Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/patients` | Create patient |
| GET | `/api/v1/patients/{id}` | Get patient |
| GET | `/api/v1/patients/search?email={email}` | Find by email |
| PATCH | `/api/v1/patients/{id}` | Update patient |
| POST | `/api/v1/intakes` | Submit intake |
| GET | `/api/v1/health` | Health check |

### Optional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/intakes/{id}` | Get intake status |
| GET | `/api/v1/providers?state={state}` | Get providers |
| POST | `/webhook` | Webhook receiver |

---

## Security Considerations

### PHI Protection

All data transmitted contains Protected Health Information (PHI). Ensure:

1. **TLS Encryption**: All API calls use HTTPS
2. **API Authentication**: Use API keys or OAuth
3. **Webhook Signing**: Include `X-Webhook-Secret` header
4. **Audit Logging**: Log all API calls (without PHI)
5. **Access Control**: Restrict EMR credentials to production

### Environment Variable Security

```bash
# .env.local (NEVER commit to git)
EMR_API_URL=https://api.eonpro.com
EMR_API_KEY=ek_live_xxxxxxxxxxxxx
EMR_API_SECRET=ws_xxxxxxxxxxxxxx
```

---

## Testing

### Local Testing

1. **Mock EMR Server:**

```bash
# Simple mock server with Node.js
npx json-server --port 4000 mock-emr-db.json
```

2. **Configure Local Environment:**

```bash
# .env.local
EMR_API_URL=http://localhost:4000
EMR_API_KEY=test-key
```

3. **Test Health Check:**

```bash
curl http://localhost:3000/api/emr/health
```

4. **Test Submission:**

```bash
curl -X POST http://localhost:3000/api/emr/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test123",
    "personalInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com"
    }
  }'
```

### Production Testing

```bash
# Check EMR connectivity
curl https://intake.eonmeds.com/api/emr/health

# Expected output if configured:
# {"status":"healthy","configured":true,...}
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `not_configured` | Missing env vars | Add `EMR_API_URL` and `EMR_API_KEY` |
| `unhealthy` | EMR unreachable | Check EMR server status, network |
| `401 Unauthorized` | Invalid API key | Verify `EMR_API_KEY` |
| `timeout` | Slow EMR response | Increase timeout or check EMR load |

### Debug Logging

Enable verbose logging in development:

```typescript
// src/lib/logger.ts logs all EMR calls when NODE_ENV=development
```

---

## Integration Roadmap

### Phase 1: Webhook Integration ✅
- [x] Basic webhook to EONPRO
- [x] EMR client library
- [x] Health check endpoint
- [x] Direct submit endpoint

### Phase 2: Bi-directional Sync
- [ ] Poll EMR for patient status updates
- [ ] Display provider assignment in patient portal
- [ ] Sync prescription status

### Phase 3: Patient Portal
- [ ] Patient login (email + OTP)
- [ ] View intake status
- [ ] Secure messaging with provider
- [ ] Prescription history

### Phase 4: Provider Dashboard
- [ ] Provider authentication
- [ ] Review intake submissions
- [ ] Approve/reject patients
- [ ] E-prescribe integration

---

## API Versioning

Current: `v1`

All endpoints use `/api/v1/` prefix. Breaking changes will increment version.

---

## Support

For EMR integration questions:
- **Technical:** Review `src/lib/emr-client.ts`
- **Configuration:** Check environment variables
- **Security:** See HIPAA compliance documentation

---

*Last Updated: January 2026*
