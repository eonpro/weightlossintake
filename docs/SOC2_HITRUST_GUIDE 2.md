# 🔐 SOC 2 & HITRUST Certification Guide

## Overview

This guide explains how to achieve SOC 2 Type II and HITRUST certification for your telehealth platform.

---

## 📊 Certification Comparison

| Certification | Cost | Timeline | Focus | Required For |
|--------------|------|----------|-------|--------------|
| **SOC 2 Type I** | $20-50K | 2-3 months | Point-in-time controls | Enterprise clients |
| **SOC 2 Type II** | $30-75K | 6-12 months | Controls over time | Most B2B healthcare |
| **HITRUST CSF** | $50-150K | 9-18 months | Healthcare-specific | Large health systems |
| **HIPAA Compliance** | $5-20K | 1-3 months | PHI protection | All healthcare |

---

## 🎯 SOC 2 Certification

### What is SOC 2?

SOC 2 (Service Organization Control 2) is an auditing standard that evaluates how well a company protects customer data based on five Trust Service Criteria:

1. **Security** - Protection against unauthorized access
2. **Availability** - System uptime and reliability
3. **Processing Integrity** - Accurate data processing
4. **Confidentiality** - Protection of confidential information
5. **Privacy** - Personal information handling

### SOC 2 Type I vs Type II

| Type I | Type II |
|--------|---------|
| Point-in-time assessment | Assessment over 6-12 months |
| "Controls are designed properly" | "Controls work effectively over time" |
| Faster to obtain | More credible |
| Good starting point | Required by most enterprises |

### Steps to SOC 2 Certification

#### Phase 1: Readiness Assessment (1-2 months)

1. **Gap Analysis**
   - Review current security controls
   - Identify missing policies
   - Document existing procedures

2. **Scope Definition**
   - Define systems in scope (intake platform, APIs, databases)
   - Identify third-party services (Vercel, Airtable, Stripe)
   - Document data flows

3. **Policy Development**
   - Information Security Policy
   - Access Control Policy
   - Incident Response Plan
   - Business Continuity Plan
   - Change Management Policy
   - Vendor Management Policy

#### Phase 2: Control Implementation (2-4 months)

**Security Controls:**
```
✅ Already Have:
- TLS encryption in transit
- Input validation (Zod schemas)
- Rate limiting
- CORS configuration
- Security headers (CSP, HSTS)
- Audit logging

❌ Need to Add:
- Multi-factor authentication
- Role-based access control (RBAC)
- Encryption at rest (database)
- Vulnerability scanning
- Penetration testing
- Security awareness training
- Background checks for employees
```

**Technical Controls Checklist:**

| Control | Status | Action Needed |
|---------|--------|---------------|
| Firewall/WAF | ⚠️ Partial | Vercel provides basic, consider Cloudflare |
| Intrusion Detection | ❌ Missing | Add monitoring service |
| Vulnerability Scanning | ❌ Missing | Add Snyk or similar |
| Penetration Testing | ❌ Missing | Annual third-party test |
| Encryption at Rest | ⚠️ Depends | Verify EMR database encryption |
| Encryption in Transit | ✅ Done | TLS 1.3 via Vercel |
| Access Logging | ✅ Done | Audit logging implemented |
| MFA | ❌ Missing | Add for admin access |
| Password Policy | ❌ Missing | Implement strong password requirements |
| Session Management | ⚠️ Partial | Add session timeout |

#### Phase 3: Evidence Collection (Ongoing)

You'll need to collect evidence of:
- Security monitoring logs
- Access reviews (quarterly)
- Vulnerability scan results
- Incident response tests
- Employee training records
- Vendor security assessments
- Change management records

#### Phase 4: Audit (1-2 months)

1. **Select an Auditor**
   - Popular options: Drata, Vanta, Secureframe (automated)
   - Traditional: Deloitte, PwC, KPMG, local CPA firms
   - Cost: $15-50K for Type II

2. **Audit Process**
   - Auditor reviews policies and procedures
   - Tests control effectiveness
   - Interviews key personnel
   - Reviews evidence

3. **Report Issuance**
   - SOC 2 report valid for 12 months
   - Share with customers under NDA

### Recommended SOC 2 Tools

| Tool | Purpose | Cost/Month |
|------|---------|------------|
| **Drata** | Automated compliance | $500-2000 |
| **Vanta** | Automated compliance | $500-2000 |
| **Secureframe** | Automated compliance | $500-1500 |
| **Snyk** | Vulnerability scanning | $100-500 |
| **Datadog** | Monitoring & logging | $50-500 |
| **1Password** | Password management | $8/user |

---

## 🏥 HITRUST Certification

### What is HITRUST?

HITRUST CSF (Common Security Framework) is a certifiable framework specifically designed for healthcare. It incorporates requirements from:
- HIPAA
- NIST
- ISO 27001
- PCI DSS
- SOC 2

### HITRUST Certification Levels

| Level | Assessment | Cost | Timeline |
|-------|------------|------|----------|
| **e1** | Self-assessment | $5-10K | 1-2 months |
| **i1** | Validated (1 year) | $30-50K | 3-6 months |
| **r2** | Validated (2 years) | $50-150K | 6-12 months |

### HITRUST Requirements

HITRUST has 19 control domains:

1. Information Protection Program
2. Endpoint Protection
3. Portable Media Security
4. Mobile Device Security
5. Wireless Security
6. Configuration Management
7. Vulnerability Management
8. Network Protection
9. Transmission Protection
10. Password Management
11. Access Control
12. Audit Logging & Monitoring
13. Education, Training & Awareness
14. Third Party Assurance
15. Incident Management
16. Business Continuity & Disaster Recovery
17. Risk Management
18. Physical & Environmental Security
19. Data Protection & Privacy

### HITRUST vs SOC 2

| Factor | SOC 2 | HITRUST |
|--------|-------|---------|
| Industry | Any | Healthcare-focused |
| Cost | $30-75K | $50-150K |
| Timeline | 6-12 months | 9-18 months |
| Recognition | Widely accepted | Gold standard in healthcare |
| Maintenance | Annual audit | 2-year certification |

---

## 🚀 Recommended Path

### For Your Current Stage

**Year 1: Foundation**
1. ✅ HIPAA compliance (you have EMR with HIPAA database)
2. 🔄 SOC 2 Type I (3-4 months, ~$30K)
3. 📋 Document all policies and procedures

**Year 2: Maturity**
1. 🔄 SOC 2 Type II (6-12 months observation)
2. 📋 Continuous monitoring implementation
3. 🔄 Consider HITRUST i1 if targeting large health systems

**Year 3: Enterprise-Ready**
1. 🔄 HITRUST r2 certification
2. 📋 Full compliance program
3. 🔄 Annual penetration testing

---

## 📋 Immediate Action Items

### Week 1-2: Policy Documentation
- [ ] Write Information Security Policy
- [ ] Write Access Control Policy
- [ ] Write Incident Response Plan
- [ ] Document data flow diagrams

### Week 3-4: Technical Controls
- [ ] Implement MFA for admin access
- [ ] Set up vulnerability scanning (Snyk)
- [ ] Configure comprehensive logging
- [ ] Review and document third-party security

### Month 2: Gap Assessment
- [ ] Hire compliance consultant or use Drata/Vanta
- [ ] Complete readiness assessment
- [ ] Prioritize remediation items

### Month 3-4: Remediation
- [ ] Address critical gaps
- [ ] Implement missing controls
- [ ] Train employees

### Month 5-6: Audit Prep
- [ ] Select auditor
- [ ] Collect evidence
- [ ] Conduct internal audit

---

## 💰 Budget Estimate

### SOC 2 Type II (First Year)

| Item | Cost |
|------|------|
| Compliance platform (Drata/Vanta) | $12,000-24,000 |
| Auditor fees | $15,000-40,000 |
| Penetration testing | $5,000-15,000 |
| Security tools | $3,000-10,000 |
| Consultant (optional) | $10,000-30,000 |
| **Total** | **$45,000-120,000** |

### HITRUST r2 (First Year)

| Item | Cost |
|------|------|
| HITRUST fees | $25,000-40,000 |
| Assessor fees | $30,000-80,000 |
| Compliance platform | $15,000-30,000 |
| Remediation | $20,000-50,000 |
| **Total** | **$90,000-200,000** |

---

## 🔧 Technical Implementations Needed

### 1. Multi-Factor Authentication

```typescript
// Add to src/middleware.ts for admin routes
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Require MFA for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token?.mfaVerified) {
      return NextResponse.redirect(new URL('/auth/mfa', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 2. Session Timeout

```typescript
// Add session timeout (15 minutes for healthcare)
export const authOptions = {
  session: {
    maxAge: 15 * 60, // 15 minutes
    updateAge: 5 * 60, // Refresh every 5 minutes
  },
  // ... other options
};
```

### 3. Audit Trail Enhancement

```typescript
// src/lib/audit.ts
interface AuditEvent {
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export function logAuditEvent(event: AuditEvent): void {
  // Send to logging service (Datadog, CloudWatch, etc.)
  const logEntry = {
    ...event,
    service: 'eonmeds-intake',
    environment: process.env.NODE_ENV,
  };
  
  // In production, send to log aggregator
  if (process.env.NODE_ENV === 'production') {
    // Send to Datadog/CloudWatch/etc.
  }
  
  console.log(JSON.stringify(logEntry));
}
```

### 4. Data Retention Policy

```typescript
// Implement data retention (HIPAA requires 6 years minimum)
const DATA_RETENTION_DAYS = 365 * 6; // 6 years

export async function cleanupOldData(): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
  
  // Archive old records before deletion
  // Delete from active storage
  // Log deletion for audit trail
}
```

---

## 📚 Resources

### SOC 2
- [AICPA SOC 2 Guide](https://www.aicpa.org/soc2)
- [Drata SOC 2 Checklist](https://drata.com/soc-2-checklist)
- [Vanta SOC 2 Guide](https://www.vanta.com/soc-2)

### HITRUST
- [HITRUST Alliance](https://hitrustalliance.net/)
- [HITRUST CSF Overview](https://hitrustalliance.net/csf/)
- [HITRUST Assessment Guide](https://hitrustalliance.net/assessment/)

### HIPAA
- [HHS HIPAA Guide](https://www.hhs.gov/hipaa/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)

---

## ❓ FAQ

**Q: Do we need SOC 2 if we have HIPAA compliance?**
A: HIPAA is a legal requirement; SOC 2 is a voluntary certification. Many enterprise clients require SOC 2 in addition to HIPAA.

**Q: Can we skip SOC 2 and go straight to HITRUST?**
A: Yes, but HITRUST is more expensive and time-consuming. SOC 2 is often a good stepping stone.

**Q: How long does certification take?**
A: SOC 2 Type I: 3-4 months. SOC 2 Type II: 6-12 months. HITRUST: 9-18 months.

**Q: Do we need to recertify?**
A: SOC 2: Annual audit. HITRUST: Every 2 years (r2) or annually (i1).

---

*This guide will be updated as you progress through certification.*
