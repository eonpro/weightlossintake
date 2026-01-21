# Clerk Authentication Setup Guide

## Overview

This document describes how to configure Clerk authentication for the EONMeds intake platform, including MFA and role-based access control.

---

## 1. Environment Variables

Add these to your `.env.local` and Vercel environment:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (optional - defaults work)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

---

## 2. Clerk Dashboard Configuration

### 2.1 Create Application

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy the API keys to your environment variables

### 2.2 Configure Sign-in Methods

In Clerk Dashboard > User & Authentication > Email, Phone, Username:

- [x] Email address (required)
- [x] Password (required)
- [ ] Phone number (optional)

### 2.3 Enable Multi-Factor Authentication (MFA)

In Clerk Dashboard > User & Authentication > Multi-factor:

1. **Enable MFA Options:**
   - [x] Authenticator application (TOTP)
   - [x] SMS verification (backup)
   - [x] Backup codes

2. **Configure MFA Policy:**
   - For admin users: **Required**
   - For regular users: Optional

### 2.4 Configure Session Settings

In Clerk Dashboard > Sessions:

- Session lifetime: 7 days
- Inactivity timeout: 15 minutes (HIPAA recommended)
- Single session mode: Enabled (optional, for security)

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Available Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | Full platform access | All features |
| `provider` | Medical provider | View submissions, analytics |
| `user` | Regular user | Self-service only |

### 3.2 Assign Roles via Clerk Dashboard

1. Go to Clerk Dashboard > Users
2. Select a user
3. Click "Edit metadata"
4. Add to `publicMetadata`:

```json
{
  "role": "admin",
  "permissions": ["view:submissions", "edit:submissions", "manage:users"]
}
```

### 3.3 Assign Roles Programmatically

```typescript
import { clerkClient } from '@clerk/nextjs/server';

// Assign admin role to user
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    role: 'admin',
    permissions: ['view:submissions', 'edit:submissions', 'manage:users'],
  },
});
```

---

## 4. Protected Routes

### 4.1 Page Protection

Protected routes are defined in `src/middleware.ts`:

```typescript
// Admin routes (require authentication)
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);
```

### 4.2 API Route Protection

Use auth helpers in API routes:

```typescript
import { requireApiAdmin } from '@/lib/auth';

export async function GET() {
  // Throws if not authenticated as admin
  const user = await requireApiAdmin();
  
  // User is authenticated admin
  return Response.json({ userId: user.userId });
}
```

### 4.3 Server Component Protection

```typescript
import { requireAdmin } from '@/lib/auth';

export default async function AdminPage() {
  // Redirects to sign-in if not admin
  const user = await requireAdmin();
  
  return <div>Welcome, {user.firstName}</div>;
}
```

---

## 5. MFA Enforcement for Admins

### Option 1: Clerk Dashboard Policy

1. Create a Clerk Organization
2. Add admin users to the organization
3. Set organization MFA policy to "Required"

### Option 2: Custom Middleware Check

```typescript
// In middleware.ts, add MFA check for admin routes
if (isAdminRoute(request)) {
  const { sessionClaims } = auth();
  
  // Check if MFA is verified for this session
  if (!sessionClaims?.mfa_verified) {
    return NextResponse.redirect(new URL('/mfa-required', request.url));
  }
}
```

---

## 6. Webhook Configuration (Optional)

For syncing user data with your database:

1. In Clerk Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`

---

## 7. Security Best Practices

### 7.1 Session Security

- Enable inactivity timeout (15 min for HIPAA)
- Use secure session cookies (default in production)
- Implement session revocation for sensitive actions

### 7.2 Password Policy

Configure in Clerk Dashboard:
- Minimum length: 12 characters
- Require uppercase, lowercase, number
- Check against breached passwords

### 7.3 Rate Limiting

Clerk provides built-in rate limiting:
- Sign-in attempts: 10/minute
- Password reset: 3/hour
- MFA verification: 5/minute

---

## 8. Testing Authentication

### Development Mode

In development, admin routes allow access without full role verification to enable testing.

### Test Users

Create test users in Clerk Dashboard:
1. admin@test.com (role: admin)
2. provider@test.com (role: provider)
3. user@test.com (role: user)

---

## 9. Troubleshooting

### Common Issues

**"Clerk keys not found"**
- Ensure environment variables are set
- Restart the development server

**"Unauthorized" on admin routes**
- Check user has `role: admin` in publicMetadata
- Verify Clerk middleware is running

**MFA not showing**
- Enable MFA in Clerk Dashboard
- Check user's MFA settings

---

*Last Updated: January 2026*
