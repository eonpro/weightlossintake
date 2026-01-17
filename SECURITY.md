# Security Configuration Guide

This document describes the security controls available in the EONMeds Intake Platform.

## Environment Variables for Security

### Optional Security Controls

| Variable | Default | Description |
|----------|---------|-------------|
| `API_SECRET_KEY` | (not set) | When set, requires `X-API-Key` header on all POST requests |
| `ENABLE_RATE_LIMIT` | `false` | Set to `true` to enable in-memory rate limiting |
| `DEBUG_API_KEY` | (not set) | Required to access `/api/airtable/test` in production |
| `ENABLE_AUDIT_LOG` | (auto) | Set to `true` to enable structured audit logging (auto-enabled in dev) |

### Required Service Keys

| Variable | Description | PHI Access |
|----------|-------------|------------|
| `AIRTABLE_PAT` | Airtable Personal Access Token | ✅ Full PHI |
| `AIRTABLE_BASE_ID` | Airtable Base ID | ✅ Full PHI |
| `INTAKEQ_API_KEY` | IntakeQ API Key | ✅ Full PHI |
| `PDFCO_API_KEY` | PDF.co API Key | ✅ PHI in PDFs |

### EONPRO Integration (Optional)

| Variable | Description | PHI Access |
|----------|-------------|------------|
| `EONPRO_WEBHOOK_URL` | EONPRO webhook endpoint URL | ✅ Full PHI |
| `EONPRO_WEBHOOK_SECRET` | Webhook authentication secret | N/A |

**Note:** EONPRO integration is optional. When configured, qualified intakes are automatically sent to EONPRO to create patient profiles.

### Rate Limit Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `AIRTABLE_RATE_LIMIT_MAX` | `30` | Max requests per window for Airtable API |
| `AIRTABLE_RATE_LIMIT_WINDOW_MS` | `60000` | Window size in milliseconds |
| `INTAKEQ_RATE_LIMIT_MAX` | `10` | Max requests per window for IntakeQ API |
| `INTAKEQ_RATE_LIMIT_WINDOW_MS` | `60000` | Window size in milliseconds |

### Client-Side Keys (Public)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API for address autocomplete |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta/Facebook Pixel ID for analytics |

---

## Security Features

### 1. API Key Authentication (Optional)

To require API key authentication on all POST endpoints:

```bash
# In Vercel Environment Variables
API_SECRET_KEY=your-secure-random-key-here
```

Clients must then include the header:
```
X-API-Key: your-secure-random-key-here
```

**Note:** If `API_SECRET_KEY` is not set, all requests are allowed (backwards compatible).

---

### 2. Rate Limiting (Optional)

To enable rate limiting:

```bash
ENABLE_RATE_LIMIT=true
```

**Configurable limits:**

| Endpoint | Variable | Default |
|----------|----------|---------|
| `/api/airtable` | `AIRTABLE_RATE_LIMIT_MAX` | 30 requests |
| `/api/airtable` | `AIRTABLE_RATE_LIMIT_WINDOW_MS` | 60000 (1 min) |
| `/api/intakeq` | `INTAKEQ_RATE_LIMIT_MAX` | 10 requests |
| `/api/intakeq` | `INTAKEQ_RATE_LIMIT_WINDOW_MS` | 60000 (1 min) |

**Example custom configuration:**
```bash
ENABLE_RATE_LIMIT=true
AIRTABLE_RATE_LIMIT_MAX=50
INTAKEQ_RATE_LIMIT_MAX=20
```

For production-grade distributed rate limiting, consider Upstash Redis:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Then add to Vercel:
```
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

---

### 3. Security Headers (Always Active)

The following headers are automatically applied via `vercel.json`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Strict-Transport-Security` | `max-age=31536000` | Enforces HTTPS |
| `Referrer-Policy` | Varies by route | Prevents referrer leakage |
| `Content-Security-Policy` | Allowlist-based | Restricts script sources |
| `Permissions-Policy` | Restrictive | Disables camera/mic/etc |

---

### 4. CORS Configuration (Always Active)

Only the following origins are allowed:
- `https://intake.eonmeds.com`
- `https://checkout.eonmeds.com`
- `https://weightlossintake.vercel.app`
- `https://eonmeds.com`
- `http://localhost:3000` (development only)
- `http://localhost:3001` (development only)

---

### 5. Input Validation (Always Active)

All API inputs are validated using Zod schemas:
- Maximum field lengths enforced
- Email format validation
- Unknown fields are stripped
- XSS patterns are sanitized

---

### 6. Request Size Limits (Always Active)

Maximum request body size: **100KB**

Requests exceeding this limit receive HTTP 413.

---

### 7. Audit Logging (Configurable)

Security events are logged in structured JSON format for easy integration with log aggregators (CloudWatch, Datadog, Splunk, etc.).

**Enable in production:**
```bash
ENABLE_AUDIT_LOG=true
```

**Events logged:**
| Event | Description |
|-------|-------------|
| `AUTH_FAILURE` | Invalid or missing API key |
| `RATE_LIMITED` | Request blocked by rate limiter |
| `VALIDATION_ERROR` | Schema validation failed |
| `REQUEST_TOO_LARGE` | Payload exceeds 100KB limit |
| `SUBMISSION_SUCCESS` | Data successfully saved |
| `SUBMISSION_FAILURE` | External API error |
| `API_ERROR` | Unexpected server error |

**Example log entry:**
```json
{
  "timestamp": "2026-01-08T14:30:00.000Z",
  "event": "SUBMISSION_SUCCESS",
  "endpoint": "/api/airtable",
  "ip": "203.0.113.45",
  "sessionId": "abc123-xyz789",
  "statusCode": 200,
  "details": "RecordId: recXXXXXXXXXXXXXX, Fields: 42",
  "service": "eonmeds-intake",
  "environment": "production"
}
```

**PHI Safety:** Audit logs NEVER contain PHI. Only metadata is logged:
- ✅ Session IDs, record IDs, client IDs
- ✅ IP addresses, timestamps
- ✅ Status codes, field names, field counts
- ❌ Names, emails, phones, DOB, addresses
- ❌ Medical data, health conditions, medications

---

## Monitoring & Debug Endpoints

### `/api/health` — Health Check

Standard health check endpoint for monitoring, load balancers, and uptime services.

| Method | URL | Response |
|--------|-----|----------|
| `GET` | `/api/health` | Basic status |
| `GET` | `/api/health?verbose` | Detailed status with service checks |
| `HEAD` | `/api/health` | Lightweight check (status code only) |

**Response example:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-08T15:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "airtable": true,
    "intakeq": true,
    "pdfco": true
  },
  "uptime": 3600
}
```

**Status codes:**
- `200` — Healthy or degraded (partial services)
- `503` — Unhealthy (critical services missing)

### `/api/airtable/test` — Debug Endpoint

- **Development:** Always accessible
- **Production:** Requires `?key=<DEBUG_API_KEY>` query parameter

### `/intake/debug` — Debug Page

- **Development:** Accessible
- **Production:** Redirects to homepage (blocked)

---

## PHI Handling Notes

### PHI Fields Processed
The following data is classified as PHI/PII:
- **Identifiers:** firstName, lastName, email, phone
- **Demographics:** dob, sex, address fields
- **Medical:** weight, height, BMI, blood pressure, conditions, medications, allergies

### Data Flow
```
Browser → /api/airtable → Airtable (storage)
                        → EONPRO (patient profile, if qualified & configured)
       → /api/intakeq  → IntakeQ (client profile)
                       → PDF.co (PDF generation)
                       → IntakeQ (PDF upload)
```

### EONPRO Integration Flow
When a qualified patient submits their intake:
1. Data is saved to Airtable (primary storage)
2. If `EONPRO_WEBHOOK_URL` and `EONPRO_WEBHOOK_SECRET` are configured
3. AND the patient is qualified (`qualified: true`)
4. The intake data is sent to EONPRO webhook asynchronously
5. EONPRO creates a patient profile and returns the patient ID
6. The webhook call is "fire and forget" - it doesn't block the client response

### Data in URLs (Updated January 2026)

**Secure Flow (Preferred):**
- Checkout redirect now passes only `ref` parameter (Airtable record ID)
- Checkout fetches PHI server-side via `GET /api/airtable?ref=xxx`
- PHI is NOT exposed in browser history, logs, or referrer headers

**Fallback Flow (If submission fails):**
- If Airtable submission fails, PHI is passed in URL for backwards compatibility
- This is mitigated by `Referrer-Policy: same-origin` on intake routes
- Mitigated by `Referrer-Policy: no-referrer` on API routes

**Checkout Integration:**
- Checkout at `checkout.eonmeds.com` should call the intake API to fetch user data:
  ```
  GET https://intake.eonmeds.com/api/airtable?ref=recXXXXXXXXXXXXXX
  ```
- Response includes: firstName, lastName, email, phone, dob, state, address, medicationPreference
- CORS is configured to allow checkout.eonmeds.com

### Data in Browser Storage
- Session data stored in `sessionStorage` (cleared on tab close)
- Persistent data stored in `localStorage` (intake progress)
- No encryption at rest in browser (standard for web apps)

### Data in Transit
- All traffic over HTTPS (enforced by HSTS)
- API calls to Airtable/IntakeQ use TLS

### Third-Party Data Sharing
| Service | PHI Shared | BAA Status |
|---------|------------|------------|
| Airtable | Full PHI | **Required** |
| IntakeQ | Full PHI | **Required** |
| EONPRO | Full PHI (qualified intakes only) | **Required** |
| PDF.co | Formatted PHI | Review DPA |
| Meta Pixel | None | N/A |
| Google Maps | Address autocomplete | N/A |

---

## Error Handling

The application includes error boundaries for graceful failure recovery:

| Location | File | Purpose |
|----------|------|---------|
| Global | `src/app/error.tsx` | Catches app-wide errors |
| Intake Flow | `src/app/intake/error.tsx` | Catches intake-specific errors |

**Features:**
- User-friendly error messages (no technical details exposed)
- "Try Again" and "Start Over" recovery options
- Error digest/ID for debugging (no PHI logged)
- Console logging for developers

---

## Recommended Production Hardening

### Phase 1 (Immediate) ✅
- [x] Security headers (HSTS, CSP, X-Frame-Options, etc.)
- [x] CORS whitelist (origin-based allowlist)
- [x] Input validation (Zod schemas)
- [x] Request size limits (100KB)
- [x] Debug endpoint protection

### Phase 2 (Lightweight Access Control) ✅
- [x] Optional API key verification (`API_SECRET_KEY`)
- [x] Rate limiting scaffolding (`ENABLE_RATE_LIMIT`)
- [x] Structured audit logging (`ENABLE_AUDIT_LOG`)
- [x] PHI handling documentation in code

### Phase 3 (Production Readiness) ✅
- [x] Health check endpoint (`/api/health`)
- [x] Configurable rate limits per endpoint
- [x] Error boundaries for graceful failures
- [x] Complete environment variable documentation

### Phase 4 (Recommended for Production)

**Add these to Vercel Environment Variables:**

```bash
# Required: Protect API endpoints
API_SECRET_KEY=generate-a-secure-random-key-here

# Recommended: Enable rate limiting
ENABLE_RATE_LIMIT=true

# Recommended: Enable audit logging for compliance
ENABLE_AUDIT_LOG=true

# Optional: EONPRO patient profile integration
EONPRO_WEBHOOK_URL=https://your-eonpro-domain.com/api/webhooks/eonpro-intake
EONPRO_WEBHOOK_SECRET=your-eonpro-webhook-secret
```

**Checklist:**
- [ ] Set `API_SECRET_KEY` - protects against unauthorized API access
- [ ] Set `ENABLE_RATE_LIMIT=true` - prevents abuse and DoS
- [ ] Set `ENABLE_AUDIT_LOG=true` - compliance and monitoring
- [ ] Connect audit logs to aggregator (CloudWatch, Datadog, etc.)
- [ ] Consider Upstash for distributed rate limiting

### Phase 5 (Enterprise)
- [ ] Implement user authentication (Auth0/Clerk)
- [ ] SOC 2 / HIPAA compliance documentation
- [ ] Third-party penetration test
- [ ] Data encryption at rest
- [ ] Remove or further restrict `/api/airtable/test` endpoint

---

## Incident Response

If you suspect a security incident:

1. Check Vercel logs for unusual patterns
2. Review Airtable audit log for unauthorized access
3. Rotate all API keys immediately
4. Contact security@eonmeds.com

---

*Last updated: January 2026*
