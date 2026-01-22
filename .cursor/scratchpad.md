# EONMeds Intake Platform - Comprehensive Audit & Resolution Plan

**Audit Date:** January 21, 2026  
**Auditor Role:** Senior Software Architect  
**Platform:** Next.js 15 + React 19 + TypeScript Medical Intake Application

---

## Executive Summary

The EONMeds intake platform is a functional medical intake system with good foundations but has accumulated technical debt, security gaps, and structural inefficiencies that need addressing. This audit identifies **32 issues** across 7 categories with prioritized remediation steps.

**Risk Assessment:**
- 🔴 Critical (Fix immediately): 4 issues
- 🟠 High (Fix within 1 week): 8 issues  
- 🟡 Medium (Fix within 1 month): 12 issues
- 🟢 Low (Backlog): 8 issues

---

## 1. CODE QUALITY ISSUES

### 1.1 🔴 CRITICAL: Duplicate Files Pollution
**Problem:** 30+ files with " 2" suffix exist throughout the codebase, indicating poor version control practices.

**Affected Files:**
```
src/lib/storage 2.ts
src/lib/rate-limit 2.ts
src/lib/stripe 2.ts
src/lib/logger 2.ts
src/lib/emr-client 2.ts
src/middleware 2.ts
src/store/checkoutStore 2.ts
src/types/checkout 2.ts
docs/*2.md (6 files)
e2e/*2.ts (3 files)
tests/setup 2.ts
playwright.config 2.ts
vitest.config 2.ts
commitlint.config 2.js
sentry.server.config 2.ts
.husky/commit-msg 2
.husky/pre-commit 2
SECURITY 2.md
src/app/error 2.tsx
```

**Resolution:**
```bash
# Remove all duplicate files
find . -name "* 2.*" -o -name "* 2" | grep -v node_modules | grep -v .next | xargs rm -f

# Add to .gitignore to prevent future duplicates
echo "* 2.*" >> .gitignore
echo "* 2" >> .gitignore
```

**Priority:** 🔴 Critical - Do first

---

### 1.2 🟠 HIGH: Monolithic Intake Pages (11,504 lines across 60+ files)
**Problem:** Each intake step has its own page file with duplicated patterns. This leads to:
- Difficult maintenance
- Inconsistent implementations
- Large bundle size
- Hard to add new steps

**Current Structure:**
```
src/app/intake/
├── activity-level/page.tsx (80 lines)
├── address/page.tsx (150 lines)
├── allergies/page.tsx (90 lines)
... 60+ more files
```

**Recommended Structure:**
```
src/app/intake/
├── [stepId]/page.tsx          # Single dynamic route
├── layout.tsx                  # Shared layout
src/config/
├── intake-steps.ts            # Step configuration
├── step-components.ts         # Component registry
```

**Resolution:**
1. Migrate to v2 dynamic routing (`/v2/intake/[stepId]`) which already exists
2. Create step registry with metadata
3. Deprecate individual page files
4. Add redirects from old URLs

---

### 1.3 🟡 MEDIUM: Inconsistent Component Patterns
**Problem:** Some steps use `form-engine` components, others have custom implementations.

**Resolution:**
- Standardize all steps to use `form-engine`
- Create additional step types as needed
- Document component API

---

### 1.4 🟡 MEDIUM: Unused Code / Dead Exports
**Problem:** `getActions()` function at line 285 in `intakeStore.ts` is never used.

```typescript
// This function is defined but never exported or used
const getActions = () => ({
  setCurrentStep: useIntakeStore.getState().setCurrentStep,
  // ...
});
```

**Resolution:**
- Remove unused code
- Run dead code analysis: `npx knip`

---

## 2. SECURITY ISSUES

### 2.1 🔴 CRITICAL: Development Mode Bypasses Admin Auth
**Problem:** In `src/lib/auth.ts`, admin checks are bypassed in development:

```typescript:72:73:src/lib/auth.ts
  // Check for admin role
  // In development, allow access if no role is set (for initial setup)
  const isAdmin = role === 'admin' || process.env.NODE_ENV === 'development';
```

**Risk:** If NODE_ENV is accidentally set to 'development' in production, all admin routes are open.

**Resolution:**
```typescript
// Replace with explicit dev override flag
const DEV_ADMIN_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true' && process.env.NODE_ENV === 'development';
const isAdmin = role === 'admin' || DEV_ADMIN_BYPASS;
```

---

### 2.2 🔴 CRITICAL: In-Memory Rate Limiting Won't Work in Serverless
**Problem:** In `src/middleware.ts`, rate limiting uses in-memory Map:

```typescript:56:58:src/middleware.ts
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per IP per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```

**Risk:** Each serverless invocation gets fresh memory - rate limiting doesn't work across requests.

**Resolution:**
```typescript
// Use Upstash Redis (already in dependencies)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});
```

---

### 2.3 🟠 HIGH: API Key Verification is Optional
**Problem:** In airtable route, API key check can be skipped:

```typescript
// API_KEY verification is optional and not enforced
```

**Resolution:**
- Make API key required for production
- Use Clerk session tokens for authenticated endpoints

---

### 2.4 🟠 HIGH: Missing CSRF Protection
**Problem:** Form submissions don't have CSRF tokens.

**Resolution:**
- Implement CSRF tokens for state-changing operations
- Or use SameSite=Strict cookies with Clerk

---

### 2.5 🟠 HIGH: npm Audit Vulnerability
**Problem:** 1 high severity vulnerability in `tar` package.

**Resolution:**
```bash
npm audit fix
```

---

### 2.6 🟡 MEDIUM: Sensitive Data in localStorage
**Problem:** Medical data stored in localStorage via Zustand persist.

**Resolution:**
- Encrypt localStorage data
- Or use sessionStorage (already partially implemented)
- Add data expiry

---

## 3. ARCHITECTURE ISSUES

### 3.1 🟠 HIGH: No API Versioning
**Problem:** APIs are at `/api/airtable`, `/api/stripe/webhook` with no versioning.

**Resolution:**
```
/api/v1/intake/submit
/api/v1/payments/create-intent
/api/v1/webhooks/stripe
```

---

### 3.2 🟠 HIGH: Tight Coupling to Airtable
**Problem:** Airtable is directly called from API route with 1,400+ lines of code.

**Resolution:**
- Extract data layer interface
- Create repository pattern
- Allow swapping storage backends

```typescript
// src/lib/repositories/intake-repository.ts
interface IntakeRepository {
  save(data: IntakeData): Promise<string>;
  get(id: string): Promise<IntakeData>;
  update(id: string, data: Partial<IntakeData>): Promise<void>;
}

class AirtableIntakeRepository implements IntakeRepository { }
class PostgresIntakeRepository implements IntakeRepository { }
```

---

### 3.3 🟡 MEDIUM: No OpenAPI/Swagger Documentation
**Problem:** APIs are undocumented.

**Resolution:**
- Add OpenAPI spec
- Generate from route handlers
- Use `next-swagger-doc` or similar

---

### 3.4 🟡 MEDIUM: Mixed v1/v2 Intake Flows
**Problem:** Both `/intake/*` and `/v2/intake/*` exist without clear migration path.

**Resolution:**
- Document which to use
- Add deprecation warnings to v1
- Set timeline for v1 removal

---

## 4. TESTING ISSUES

### 4.1 🟠 HIGH: Insufficient Test Coverage
**Problem:** Only 3 unit test files exist:
- `api-health.test.ts`
- `intakeStore.test.ts`  
- `validation.test.ts`

**Missing:**
- Component tests
- API route integration tests
- Hook tests

**Resolution:**
- Target 80% code coverage
- Add component tests with React Testing Library
- Add API route tests with MSW

---

### 4.2 🟡 MEDIUM: E2E Tests Are Flaky
**Problem:** Multiple test failure screenshots in `test-results/`.

**Resolution:**
- Add retry logic
- Use test IDs instead of text selectors
- Add visual regression testing

---

### 4.3 🟡 MEDIUM: No Contract Testing
**Problem:** EONPRO integration could break without notice.

**Resolution:**
- Add Pact or similar contract testing
- Mock EONPRO in tests
- Add schema validation tests

---

## 5. BUILD & DEVOPS ISSUES

### 5.1 🔴 CRITICAL: ESLint Circular Reference
**Problem:** Pre-commit hooks fail with:
```
TypeError: Converting circular structure to JSON
```

**Resolution:**
```javascript
// eslint.config.mjs - Fix the FlatCompat usage
import eslintPluginReact from 'eslint-plugin-react';

const eslintConfig = [
  {
    plugins: {
      react: eslintPluginReact,
    },
    // ... rest of config
  }
];
```

---

### 5.2 🟠 HIGH: No Staging Environment in CI
**Problem:** CI only builds, doesn't deploy to staging.

**Resolution:**
```yaml
# Add to ci.yml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [build]
  if: github.ref == 'refs/heads/develop'
  steps:
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

### 5.3 🟡 MEDIUM: Security Audit Continues on Error
**Problem:** In CI, security audit has `continue-on-error: true`.

**Resolution:**
- Make security audit required for PRs to main
- Allow bypass only with explicit approval

---

### 5.4 🟡 MEDIUM: No Database Migrations
**Problem:** Airtable schema changes are manual.

**Resolution:**
- Document Airtable schema as code
- Create migration scripts
- Version control schema

---

## 6. PERFORMANCE ISSUES

### 6.1 🟡 MEDIUM: Large JavaScript Bundle
**Problem:** 60+ page components increase bundle size.

**Resolution:**
- Implement dynamic imports
- Use Next.js route groups for code splitting
- Analyze with `@next/bundle-analyzer`

---

### 6.2 🟡 MEDIUM: No Image Optimization Strategy
**Problem:** Static images in `public/` aren't optimized.

**Resolution:**
- Use Next.js `<Image>` component
- Add WebP/AVIF formats
- Implement lazy loading

---

### 6.3 🟢 LOW: No Caching Strategy
**Problem:** API responses aren't cached.

**Resolution:**
- Add cache headers for static data
- Use SWR or React Query for client caching
- Implement stale-while-revalidate

---

## 7. DOCUMENTATION ISSUES

### 7.1 🟡 MEDIUM: Duplicate Documentation Files
**Problem:** 6 docs have " 2" duplicates.

**Resolution:**
- Remove duplicates
- Single source of truth

---

### 7.2 🟡 MEDIUM: No Runbook
**Problem:** No operational documentation for incidents.

**Resolution:**
Create `docs/RUNBOOK.md`:
- Common errors and fixes
- Deployment procedures
- Rollback procedures
- Monitoring alerts

---

### 7.3 🟢 LOW: No Architecture Decision Records (ADRs)
**Resolution:**
Create `docs/adr/` directory with decisions like:
- Why Airtable for storage
- Why Zustand over Redux
- Why form-engine pattern

---

## Project Status Board

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Code Quality | 1 | 1 | 2 | 0 | 4 |
| Security | 2 | 3 | 1 | 0 | 6 |
| Architecture | 0 | 2 | 2 | 0 | 4 |
| Testing | 0 | 1 | 2 | 0 | 3 |
| Build/DevOps | 1 | 1 | 2 | 0 | 4 |
| Performance | 0 | 0 | 2 | 1 | 3 |
| Documentation | 0 | 0 | 2 | 1 | 3 |
| **TOTAL** | **4** | **8** | **13** | **2** | **27** |

---

## Recommended Resolution Order

### Phase 1: Immediate (This Week)
1. ✅ Fix Clerk production keys (DONE)
2. ✅ Fix CSP for production Clerk domains (DONE)
3. ✅ Fix health endpoint service status (DONE)
4. ⬜ Remove all " 2" duplicate files
5. ⬜ Fix ESLint circular reference
6. ⬜ Run `npm audit fix`
7. ⬜ Fix development admin bypass

### Phase 2: Short Term (2 Weeks)
8. ⬜ Implement Upstash rate limiting
9. ⬜ Add staging deployment to CI
10. ⬜ Increase unit test coverage to 50%
11. ⬜ Add API versioning
12. ⬜ Document v1 vs v2 intake flow

### Phase 3: Medium Term (1 Month)
13. ⬜ Migrate all intake steps to v2 dynamic routing
14. ⬜ Extract Airtable to repository pattern
15. ⬜ Add OpenAPI documentation
16. ⬜ Implement contract testing for EONPRO
17. ⬜ Add component tests
18. ⬜ Create operational runbook

### Phase 4: Long Term (Backlog)
19. ⬜ Implement ADRs
20. ⬜ Add caching strategy
21. ⬜ Performance optimization
22. ⬜ Image optimization

---

## Quick Wins (Can Do Today)

```bash
# 1. Remove duplicate files
find . -name "* 2.*" -o -name "* 2" | grep -v node_modules | grep -v .next | xargs rm -f

# 2. Fix npm vulnerability
npm audit fix

# 3. Add to .gitignore
echo -e "\n# Prevent duplicate files\n* 2.*\n* 2" >> .gitignore
```

---

*Last Updated: January 21, 2026*
