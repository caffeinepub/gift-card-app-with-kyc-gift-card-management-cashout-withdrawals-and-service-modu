/**
 * Storage utility for per-principal notification settings.
 * Generates scoped localStorage keys and safely gets/sets the notifications-enabled flag.
 */

const STORAGE_KEY_PREFIX = 'notifications_enabled';

/**
 * Generate a localStorage key scoped to the given principal.
 */
function getStorageKey(principal: string | null): string | null {
  if (!principal) return null;
  return `${STORAGE_KEY_PREFIX}_${principal}`;
}

/**
 * Get the notifications-enabled flag for the given principal.
 * Returns true (default ON) if no stored value exists.
 * Returns null if principal is missing or localStorage is unavailable.
 */
export function getNotificationsEnabled(principal: string | null): boolean | null {
  const key = getStorageKey(principal);
  if (!key) return null;

  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      // No stored value: default to ON
      return true;
    }
    return stored === 'true';
  } catch (error) {
    console.error('Failed to read notifications setting from localStorage:', error);
    return null;
  }
}

/**
 * Set the notifications-enabled flag for the given principal.
 * Returns true if successful, false otherwise.
 */
export function setNotificationsEnabled(principal: string | null, enabled: boolean): boolean {
  const key = getStorageKey(principal);
  if (!key) return false;

  try {
    localStorage.setItem(key, enabled.toString());
    return true;
  } catch (error) {
    console.error('Failed to write notifications setting to localStorage:', error);
    return false;
  }
}
