/**
 * Storage Utility with localStorage Backup
 * 
 * Provides a unified storage interface that automatically backs up
 * sessionStorage data to localStorage to prevent data loss.
 * 
 * Features:
 * - Automatic backup to localStorage
 * - Auto-restore from localStorage if sessionStorage is empty
 * - PHI-safe key prefixing
 * - Expiration support for localStorage entries
 * - Type-safe get/set operations
 */

const STORAGE_PREFIX = 'eonpro_intake_';
const BACKUP_PREFIX = 'eonpro_backup_';
const DEFAULT_EXPIRY_HOURS = 24; // localStorage entries expire after 24 hours

// Keys that should be backed up to localStorage
const BACKUP_KEYS = [
  'intake_name',
  'intake_email',
  'intake_phone',
  'intake_dob',
  'intake_sex',
  'intake_state',
  'intake_address',
  'intake_height',
  'current_weight',
  'ideal_weight',
  'intake_bmi',
  'intake_goals',
  'intake_activity',
  'medication_type',
  'session_id',
  'glp1_history',
  'health_conditions',
  'current_medications',
  'referral_source',
  'midpoint_submitted',
  'qualified',
];

interface StoredItem<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if sessionStorage is available
 */
function isSessionStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a value from storage (sessionStorage with localStorage fallback)
 */
export function getStorageItem<T = string>(key: string, defaultValue?: T): T | null {
  if (typeof window === 'undefined') return defaultValue ?? null;
  
  // Try sessionStorage first
  if (isSessionStorageAvailable()) {
    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue !== null) {
      return parseStoredValue<T>(sessionValue);
    }
  }
  
  // Fall back to localStorage backup
  if (isLocalStorageAvailable() && BACKUP_KEYS.includes(key)) {
    const backupKey = `${BACKUP_PREFIX}${key}`;
    const backupValue = localStorage.getItem(backupKey);
    
    if (backupValue !== null) {
      try {
        const stored: StoredItem<T> = JSON.parse(backupValue);
        
        // Check if expired
        if (stored.expiresAt && Date.now() > stored.expiresAt) {
          localStorage.removeItem(backupKey);
          return defaultValue ?? null;
        }
        
        // Restore to sessionStorage
        if (isSessionStorageAvailable()) {
          sessionStorage.setItem(key, typeof stored.value === 'string' 
            ? stored.value 
            : JSON.stringify(stored.value));
        }
        
        return stored.value;
      } catch {
        // If parsing fails, return raw value
        return backupValue as unknown as T;
      }
    }
  }
  
  return defaultValue ?? null;
}

/**
 * Set a value in storage (sessionStorage with localStorage backup)
 */
export function setStorageItem<T = string>(
  key: string, 
  value: T, 
  options?: { backup?: boolean; expiryHours?: number }
): void {
  if (typeof window === 'undefined') return;
  
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Set in sessionStorage
  if (isSessionStorageAvailable()) {
    sessionStorage.setItem(key, stringValue);
  }
  
  // Backup to localStorage if applicable
  const shouldBackup = options?.backup !== false && BACKUP_KEYS.includes(key);
  
  if (shouldBackup && isLocalStorageAvailable()) {
    const backupKey = `${BACKUP_PREFIX}${key}`;
    const expiryHours = options?.expiryHours ?? DEFAULT_EXPIRY_HOURS;
    
    const storedItem: StoredItem<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000),
    };
    
    try {
      localStorage.setItem(backupKey, JSON.stringify(storedItem));
    } catch (e) {
      // localStorage might be full, try to clear old entries
      clearExpiredBackups();
      try {
        localStorage.setItem(backupKey, JSON.stringify(storedItem));
      } catch {
        // Storage is still full, ignore - silently fail as this is non-critical
      }
    }
  }
}

/**
 * Remove a value from storage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  if (isSessionStorageAvailable()) {
    sessionStorage.removeItem(key);
  }
  
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(`${BACKUP_PREFIX}${key}`);
  }
}

/**
 * Clear all intake data from storage
 */
export function clearIntakeStorage(): void {
  if (typeof window === 'undefined') return;
  
  BACKUP_KEYS.forEach(key => {
    removeStorageItem(key);
  });
}

/**
 * Clear expired backups from localStorage
 */
export function clearExpiredBackups(): void {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) return;
  
  const now = Date.now();
  
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(BACKUP_PREFIX)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const stored: StoredItem<unknown> = JSON.parse(item);
          if (stored.expiresAt && now > stored.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // If parsing fails, remove the item
        localStorage.removeItem(key!);
      }
    }
  }
}

/**
 * Restore all data from localStorage backup to sessionStorage
 */
export function restoreFromBackup(): number {
  if (typeof window === 'undefined') return 0;
  
  let restoredCount = 0;
  
  BACKUP_KEYS.forEach(key => {
    if (isSessionStorageAvailable()) {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue === null) {
        const restored = getStorageItem(key);
        if (restored !== null) {
          restoredCount++;
        }
      }
    }
  });
  
  return restoredCount;
}

/**
 * Get all intake data as an object
 */
export function getAllIntakeData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  
  BACKUP_KEYS.forEach(key => {
    const value = getStorageItem(key);
    if (value !== null) {
      data[key] = value;
    }
  });
  
  return data;
}

/**
 * Parse a stored value, handling both JSON and plain strings
 */
function parseStoredValue<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

/**
 * Safe JSON parse with type safety
 */
export function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Hook-friendly storage getter with auto-restore
 */
export function useStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  // Try to restore from backup on first access
  const value = getStorageItem<T>(key);
  return value ?? defaultValue;
}

// Auto-clear expired backups on module load
if (typeof window !== 'undefined') {
  clearExpiredBackups();
}
