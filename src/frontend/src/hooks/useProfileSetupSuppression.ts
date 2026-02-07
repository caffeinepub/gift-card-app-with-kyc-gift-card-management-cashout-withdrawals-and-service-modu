import { useCallback, useMemo } from 'react';

const STORAGE_KEY = 'giftvault_profile_setup_dismissed';

interface SuppressionState {
  [principal: string]: boolean;
}

function getSuppressionState(): SuppressionState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to read profile setup suppression state:', error);
    return {};
  }
}

function setSuppressionState(state: SuppressionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save profile setup suppression state:', error);
  }
}

export function useProfileSetupSuppression(principal: string | null) {
  const isSuppressed = useMemo(() => {
    if (!principal) return false;
    const state = getSuppressionState();
    return state[principal] === true;
  }, [principal]);

  const suppress = useCallback(() => {
    if (!principal) return;
    const state = getSuppressionState();
    state[principal] = true;
    setSuppressionState(state);
  }, [principal]);

  const unsuppress = useCallback(() => {
    if (!principal) return;
    const state = getSuppressionState();
    delete state[principal];
    setSuppressionState(state);
  }, [principal]);

  return {
    isSuppressed,
    suppress,
    unsuppress,
  };
}
