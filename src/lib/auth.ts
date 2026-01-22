// =============================================================================
// AUTHENTICATION UTILITIES
// =============================================================================
// Centralized authentication helpers using Clerk
// =============================================================================

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// =============================================================================
// TYPES
// =============================================================================

export interface UserMetadata {
  role?: 'admin' | 'provider' | 'user';
  permissions?: string[];
}

export interface AuthenticatedUser {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  permissions: string[];
}

// =============================================================================
// SERVER-SIDE AUTH HELPERS
// =============================================================================

/**
 * Get the current authenticated user ID
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Use this in server components/actions that require auth
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return userId;
}

/**
 * Require admin role - throws error if user is not an admin
 * Use this in admin routes and API handlers
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const user = await currentUser();
  const metadata = (user?.publicMetadata || {}) as UserMetadata;
  const role = metadata.role || 'user';
  
  // Check for admin role
  // DEV_ADMIN_BYPASS allows access in development for initial setup
  // Must be explicitly enabled AND in development mode
  const devBypassEnabled = process.env.DEV_ADMIN_BYPASS === 'true' && process.env.NODE_ENV === 'development';
  const isAdmin = role === 'admin' || devBypassEnabled;
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return {
    userId,
    email: user?.emailAddresses[0]?.emailAddress || null,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    role,
    permissions: metadata.permissions || [],
  };
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const { userId } = await auth();
  
  if (!userId) {
    return false;
  }
  
  const user = await currentUser();
  const metadata = (user?.publicMetadata || {}) as UserMetadata;
  const permissions = metadata.permissions || [];
  
  // Admins have all permissions
  if (metadata.role === 'admin') {
    return true;
  }
  
  return permissions.includes(permission);
}

/**
 * Require specific permission - throws error if user lacks permission
 */
export async function requirePermission(permission: string): Promise<void> {
  const hasAccess = await hasPermission(permission);
  
  if (!hasAccess) {
    throw new Error(`Unauthorized: ${permission} permission required`);
  }
}

// =============================================================================
// API ROUTE HELPERS
// =============================================================================

/**
 * Validate auth for API routes
 * Returns user info or null if not authenticated
 */
export async function validateApiAuth(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  const user = await currentUser();
  const metadata = (user?.publicMetadata || {}) as UserMetadata;
  
  return {
    userId,
    email: user?.emailAddresses[0]?.emailAddress || null,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    role: metadata.role || 'user',
    permissions: metadata.permissions || [],
  };
}

/**
 * Require auth for API routes - returns 401 response if not authenticated
 */
export async function requireApiAuth(): Promise<AuthenticatedUser> {
  const user = await validateApiAuth();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Require admin for API routes - returns 403 response if not admin
 */
export async function requireApiAdmin(): Promise<AuthenticatedUser> {
  const user = await validateApiAuth();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  // DEV_ADMIN_BYPASS allows access in development for testing
  // Must be explicitly enabled AND in development mode
  const devBypassEnabled = process.env.DEV_ADMIN_BYPASS === 'true' && process.env.NODE_ENV === 'development';
  const isAdmin = user.role === 'admin' || devBypassEnabled;
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return user;
}

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

export const ROLES = {
  ADMIN: 'admin',
  PROVIDER: 'provider',
  USER: 'user',
} as const;

export const PERMISSIONS = {
  VIEW_SUBMISSIONS: 'view:submissions',
  EDIT_SUBMISSIONS: 'edit:submissions',
  DELETE_SUBMISSIONS: 'delete:submissions',
  VIEW_ANALYTICS: 'view:analytics',
  MANAGE_USERS: 'manage:users',
  MANAGE_SETTINGS: 'manage:settings',
} as const;

// Default permissions by role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(PERMISSIONS),
  provider: [
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.EDIT_SUBMISSIONS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  user: [],
};
