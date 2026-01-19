# EONMeds Intake Platform - Comprehensive Analysis & Status

## Background and Motivation
Enterprise-grade medical intake platform for GLP-1 weight loss treatment. The platform must maintain HIPAA compliance, provide excellent UX, and integrate with Airtable for patient data storage and EONPRO for patient profile creation.

---

# 🔌 SEAMLESS EONPRO INTEGRATION PLAN
## Goal: "Wired" Data Transfer That Never Fails

### Executive Summary
Transform the intake→EONPRO pipeline from a "webhook-based integration" into a "native extension" that feels like a single unified system. Zero data loss, real-time sync, and automatic recovery.

---

## Current State Analysis

### How It Works Today
```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│   Patient   │───▶│ /api/airtable│───▶│   Airtable   │    │  EONPRO  │
│   Browser   │    │              │    │   (Storage)  │    │   EMR    │
└─────────────┘    └──────┬───────┘    └──────────────┘    └────▲─────┘
                          │                                     │
                          └─────── Webhook (async) ─────────────┘
```

### Current Strengths ✅
- Zod validation with 50+ field types
- XSS sanitization
- Retry logic with exponential backoff (3 attempts)
- Audit logging (without PHI)
- EONPRO debug logging (`EONPRO_DEBUG=true`)

### Current Weaknesses ⚠️
1. **Single Point of Failure**: One webhook call per submission
2. **No Dead Letter Queue**: Failed submissions aren't queued for retry
3. **No Health Monitoring**: Can't detect EONPRO downtime proactively
4. **Schema Drift Risk**: Manual mapping could diverge from EONPRO expectations
5. **No Bi-directional Sync**: Can't verify EONPRO actually created the patient
6. **No Real-time Alerts**: Failures only visible in logs

---

## Proposed Architecture: "Wired" Integration

### Target Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTAKE FORM                                     │
│  ┌─────────────┐                                                        │
│  │   Patient   │                                                        │
│  │   Browser   │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     GATEWAY API                                    │  │
│  │  /api/intake-gateway                                              │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │  1. Validate (Zod + EONPRO Schema)                         │  │  │
│  │  │  2. Enrich (defaults, computed fields)                     │  │  │
│  │  │  3. Parallel Write (Airtable + EONPRO)                     │  │  │
│  │  │  4. Confirm Both Succeeded                                  │  │  │
│  │  │  5. If EONPRO fails → Queue for Retry                      │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └───────┬──────────────────────────────┬────────────────────────────┘  │
│          │                              │                               │
│          ▼                              ▼                               │
│  ┌──────────────┐              ┌──────────────┐                        │
│  │   Airtable   │              │    EONPRO    │                        │
│  │   (Backup)   │◀────────────▶│   (Primary)  │                        │
│  │              │   Sync ID    │              │                        │
│  └──────────────┘              └──────────────┘                        │
│          │                              │                               │
│          └──────────┬───────────────────┘                               │
│                     ▼                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     RECOVERY LAYER                                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │  │
│  │  │Dead Letter │  │  Health    │  │   Alert    │                  │  │
│  │  │   Queue    │  │  Monitor   │  │  Webhook   │                  │  │
│  │  │(Upstash KV)│  │(Heartbeat) │  │(Slack/SMS) │                  │  │
│  │  └────────────┘  └────────────┘  └────────────┘                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Schema Contract (CRITICAL - Week 1)
**Goal**: Establish a single source of truth for data format

#### 1.1 Create Shared Schema Definition
```typescript
// src/lib/eonpro-schema.ts
export const EonproPatientSchema = z.object({
  // Required fields (EONPRO minimum)
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$|^[A-Z][a-z]+ \d{1,2}, \d{4}$/),
  
  // Address (required for prescriptions)
  streetAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2), // US state code
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  
  // Medical data (structured)
  weight: z.number().positive().optional(),
  height: z.string().optional(),
  bmi: z.number().positive().optional(),
  
  // ... all EONPRO-expected fields
});
```

#### 1.2 Schema Validation at Gateway
- Validate BEFORE sending to EONPRO
- Clear error messages for missing/invalid fields
- Type-safe transformation

#### 1.3 Version the Schema
- Add `schemaVersion: "1.0"` to every payload
- EONPRO can handle multiple schema versions
- Graceful migration path

---

### Phase 2: Reliable Delivery (Week 2)

#### 2.1 Dual-Write Pattern
Write to BOTH systems in parallel, confirm both succeed:

```typescript
async function submitIntake(data: ValidatedIntake) {
  const [airtableResult, eonproResult] = await Promise.allSettled([
    saveToAirtable(data),
    sendToEonpro(data),
  ]);
  
  // Both must succeed for "success" response
  const airtableOk = airtableResult.status === 'fulfilled';
  const eonproOk = eonproResult.status === 'fulfilled';
  
  if (airtableOk && eonproOk) {
    return { success: true, airtableId, eonproPatientId };
  }
  
  // If EONPRO failed, queue for retry
  if (airtableOk && !eonproOk) {
    await queueForRetry(airtableResult.value.id, data);
    return { 
      success: true,  // Still success from user's perspective
      airtableId,
      eonproQueued: true,
      message: 'Saved! Processing complete shortly.'
    };
  }
}
```

#### 2.2 Dead Letter Queue (DLQ)
Use Upstash Redis/KV for failed submissions:

```typescript
// Queue failed EONPRO submissions
async function queueForRetry(airtableId: string, data: IntakeData) {
  await upstash.lpush('eonpro:dlq', JSON.stringify({
    airtableId,
    data,
    attempts: 0,
    firstFailedAt: Date.now(),
    lastError: 'Initial queue'
  }));
}

// Cron job processes queue every 5 minutes
// /api/cron/process-eonpro-queue
async function processQueue() {
  const items = await upstash.lrange('eonpro:dlq', 0, 10);
  for (const item of items) {
    const { airtableId, data, attempts } = JSON.parse(item);
    if (attempts >= 10) {
      // Move to permanent failure, alert humans
      await alertFailure(airtableId);
      continue;
    }
    
    const result = await sendToEonpro(data);
    if (result.success) {
      await upstash.lrem('eonpro:dlq', 1, item);
      await updateAirtableWithEonproId(airtableId, result.patientId);
    } else {
      // Update attempt count, will retry next cycle
      await updateQueueItem(item, attempts + 1, result.error);
    }
  }
}
```

---

### Phase 3: Monitoring & Alerting (Week 3)

#### 3.1 EONPRO Health Monitor
```typescript
// Proactive health check every 5 minutes
// /api/cron/eonpro-health
async function checkEonproHealth() {
  const start = Date.now();
  try {
    const response = await fetch(EONPRO_HEALTH_URL, {
      timeout: 5000,
      headers: { 'x-webhook-secret': EONPRO_SECRET }
    });
    
    const latency = Date.now() - start;
    
    if (!response.ok || latency > 3000) {
      await alertSlowOrUnhealthy(response.status, latency);
    }
    
    // Log metrics
    await logMetric('eonpro.health', {
      status: response.ok ? 'healthy' : 'unhealthy',
      latency,
      statusCode: response.status
    });
    
  } catch (error) {
    await alertEonproDown(error);
  }
}
```

#### 3.2 Real-time Alerts
```typescript
// Slack/Email alerts for critical failures
async function alertFailure(context: AlertContext) {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 EONPRO Sync Failure`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Patient Submission Failed*\n` +
                  `Airtable ID: ${context.airtableId}\n` +
                  `Error: ${context.error}\n` +
                  `Attempts: ${context.attempts}/10`
          }
        }
      ]
    })
  });
}
```

#### 3.3 Dashboard Metrics
Track in real-time:
- EONPRO success rate (target: 99.9%)
- Average sync latency (target: <2s)
- Queue depth (target: 0)
- Failed submissions in last 24h

---

### Phase 4: Bi-directional Sync (Week 4)

#### 4.1 Store EONPRO Patient ID in Airtable
Add field: `EONPRO Patient ID`

```typescript
// After successful EONPRO creation
if (eonproResult.success && eonproResult.data?.patientId) {
  await updateAirtableRecord(airtableId, {
    'EONPRO Patient ID': eonproResult.data.patientId,
    'EONPRO Sync Status': 'Synced',
    'EONPRO Synced At': new Date().toISOString()
  });
}
```

#### 4.2 Verification Endpoint
```typescript
// /api/verify-eonpro-sync?airtableId=rec123
async function verifySync(airtableId: string) {
  const airtable = await getAirtableRecord(airtableId);
  const eonproId = airtable.fields['EONPRO Patient ID'];
  
  if (!eonproId) {
    return { synced: false, reason: 'No EONPRO ID stored' };
  }
  
  // Verify patient exists in EONPRO
  const eonproPatient = await eonproClient.getPatient(eonproId);
  
  return {
    synced: true,
    eonproId,
    eonproStatus: eonproPatient?.status || 'unknown'
  };
}
```

---

### Phase 5: Schema Evolution (Ongoing)

#### 5.1 Add New Fields Safely
```typescript
// Schema versioning
const SCHEMA_VERSION = '1.1';

// New field additions are always optional
const EonproPatientSchemaV1_1 = EonproPatientSchemaV1.extend({
  insuranceProvider: z.string().optional(),  // New in v1.1
  preferredPharmacy: z.string().optional(),  // New in v1.1
});
```

#### 5.2 Deprecation Path
```typescript
// Old fields remain but are marked deprecated
const EonproPatientSchema = z.object({
  // ... current fields
  
  // @deprecated Use streetAddress instead
  address: z.string().optional(),
});
```

---

## Data Field Mapping (EONPRO Contract)

### Required Fields (Must Send)
| Intake Field | EONPRO Field | Validation |
|--------------|--------------|------------|
| `firstName` | `firstName` | string, max 100 |
| `lastName` | `lastName` | string, max 100 |
| `email` | `email` | valid email |
| `phone` | `phone` | E.164 format |
| `dob` | `dateOfBirth` | ISO date or "Month DD, YYYY" |
| `address` | `streetAddress` | string |
| `state` | `state` | 2-letter code |
| `currentWeight` | `weight` | number (lbs) |

### Medical Fields (Send If Available)
| Intake Field | EONPRO Field | Notes |
|--------------|--------------|-------|
| `bloodPressure` | `bloodPressure` | Range string |
| `bmi` | `bmi` | Calculated number |
| `medications` | `currentMedications` | Comma-separated |
| `allergies` | `allergies` | Comma-separated |
| `chronicConditions` | `medicalConditions` | Semicolon-separated |
| `glp1History` | `glp1History` | "yes"/"no"/specific |
| `medicationPreference` | `medicationPreference` | "semaglutide"/"tirzepatide" |

### Metadata (Auto-generated)
| Field | Value | Purpose |
|-------|-------|---------|
| `submissionId` | `wli-{timestamp}` | Unique ID |
| `submittedAt` | ISO timestamp | Audit trail |
| `source` | `weightlossintake` | Source system |
| `schemaVersion` | `1.0` | For compatibility |
| `intakeSource` | `eonmeds-intake` | App identifier |
| `airtableRecordId` | `rec...` | Cross-reference |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Sync Success Rate | ~95% | 99.9% |
| Sync Latency | ~3s | <1s |
| Data Loss | Possible | Zero |
| Recovery Time | Manual | <5min auto |
| Schema Alignment | Manual | Automated |

---

## Implementation Priority

### Immediate (This Week)
1. ✅ Fix serverless await issue (DONE)
2. ⬜ Create Upstash KV account for DLQ
3. ⬜ Add `EONPRO Patient ID` field to Airtable
4. ⬜ Create `/api/cron/process-eonpro-queue` endpoint

### Short Term (2 Weeks)
5. ⬜ Implement health monitor cron
6. ⬜ Add Slack alerting
7. ⬜ Create verification endpoint
8. ⬜ Build admin dashboard for sync status

### Medium Term (1 Month)
9. ⬜ Schema versioning system
10. ⬜ Bi-directional patient status sync
11. ⬜ Automated reconciliation report

---

## Environment Variables Needed

```env
# Existing
EONPRO_WEBHOOK_URL=https://...
EONPRO_WEBHOOK_SECRET=...
EONPRO_DEBUG=true

# New for DLQ
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# New for Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
ALERT_EMAIL=admin@eonmeds.com

# New for Cron (Vercel)
CRON_SECRET=... (for secured cron endpoints)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| EONPRO downtime | DLQ + auto-retry + alerts |
| Schema mismatch | Versioned schema + validation |
| Data corruption | Zod validation + sanitization |
| Network failure | Exponential backoff + DLQ |
| Lost submissions | Airtable as backup + reconciliation |

---

## Questions for EONPRO Team

1. **API Idempotency**: Does EONPRO support idempotency keys? (prevent duplicate patients)
2. **Webhook Health**: Is there a `/health` endpoint we can poll?
3. **Patient Lookup**: Can we query by email to verify patient exists?
4. **Schema Docs**: Is there official API documentation we should follow?
5. **Rate Limits**: What are the webhook rate limits?

---

*Plan Created: January 19, 2026*
*Next Review: January 26, 2026*

---

## Key Challenges and Analysis

### 1. Global UI Settings Analysis (`globals.css`)

#### Design System Overview
The platform uses a modern, sophisticated design system with:

**Color Palette:**
- Primary: `#10b981` (emerald green) with light/dark variants
- Accent: `#f0feab` (lime yellow) and `#d4f084` (darker lime)
- Neutrals: Warm grays from `#1f2937` to `#9ca3af`
- Semantic: Success (`#10b981`), Warning (`#f59e0b`), Error (`#ef4444`)

**Typography:**
- Font: Sofia Pro (Adobe Typekit)
- Base: 16px, line-height 1.6
- Titles: `clamp(1.75rem, 5vw, 2.5rem)`, font-weight 600, line-height 1.15
- Subtitles: `clamp(0.9375rem, 2vw, 1.0625rem)`, font-weight 400, line-height 1.25
- Input text: font-weight 550, font-size 18px
- Placeholder: font-weight 400, opacity 0.5

**Component Patterns:**
- Border radius: 7px for buttons/inputs (standardized)
- Shadows: Subtle layered shadows for depth
- Transitions: Smooth 150-300ms cubic-bezier transitions
- Buttons: Gradient backgrounds with hover lift effects

**Standardized Option Buttons:**
- Unselected: White background, gray border (`#e5e7eb`)
- Hover: Green border (`#4fa87f`), light background (`#fafafa`)
- Selected: Green border (`#4fa87f`), lime background (`#f0feab`)
- Font-weight: 550 (standardized across platform)

**Checkboxes:**
- Unselected: White background, gray border (`#d1d5db`)
- Selected: Dark background (`#413d3d`), white checkmark

---

### 2. API Capabilities Analysis

#### `/api/airtable` (Primary Intake API)
**Purpose:** PHI ingestion point for patient intake data

**Security Features:**
- ✅ Input validation via Zod schema (50+ field types)
- ✅ XSS sanitization for string values
- ✅ Request size limits (100KB max)
- ✅ Optional API key verification
- ✅ Rate limiting (configurable, 30 req/min default)
- ✅ CORS whitelisting for allowed origins
- ✅ Constant-time API key comparison (prevents timing attacks)
- ✅ Audit logging without PHI

**EONPRO Integration:**
- ✅ Webhook with retry logic (3 attempts, exponential backoff)
- ✅ Awaited in serverless (critical fix applied)
- ✅ Verbose logging for debugging

---

## Project Status Board

| Component | Status | Notes |
|-----------|--------|-------|
| UI/UX Design System | ✅ Complete | 7px radius standardized |
| Intake Flow V1 | ✅ Complete | SessionStorage-based |
| Checkout Flow | ✅ Complete | Stripe integration |
| Airtable Integration | ✅ Complete | Full PHI handling |
| EONPRO Webhook | ✅ Working | Fixed await issue |
| E2E Tests | ✅ Complete | Playwright setup |
| DLQ System | ⬜ Planned | See integration plan |
| Health Monitor | ⬜ Planned | See integration plan |

---

## Lessons Learned

1. **Serverless Async**: ALWAYS `await` external API calls in Vercel serverless. "Fire and forget" doesn't work - function terminates before promise resolves.

2. **Font Weight Standardization**: Option buttons use `font-weight: 550` consistently.

3. **Border Radius**: Standardized to 7px for all interactive elements.

4. **Checkbox Visibility**: Dark background (`#413d3d`) with white checkmark for selected state.

5. **API Validation**: Zod schemas don't accept `null` for optional string fields. Use empty string `''` as fallback.

6. **EONPRO Integration**: Current implementation is working but needs DLQ for true reliability.

---

*Last Updated: January 19, 2026*
