import { useState, useEffect } from 'react';
import { getNotificationsEnabled, setNotificationsEnabled } from '../state/notificationSettingsStorage';

/**
 * Hook that manages the in-app notifications preference for the signed-in principal.
 * Defaults to ON when no stored value exists.
 * Persists changes to localStorage scoped to the principal.
 */
export function useNotificationSettings(principal: string | null) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = getNotificationsEnabled(principal);
    return stored !== null ? stored : true; // Default ON
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync with localStorage when principal changes
  useEffect(() => {
    const stored = getNotificationsEnabled(principal);
    if (stored !== null) {
      setEnabled(stored);
    } else {
      setEnabled(true); // Default ON
    }
  }, [principal]);

  const toggle = (newValue: boolean) => {
    setIsLoading(true);
    const success = setNotificationsEnabled(principal, newValue);
    if (success) {
      setEnabled(newValue);
    }
    setIsLoading(false);
  };

  return {
    enabled,
    toggle,
    isLoading,
  };
}
