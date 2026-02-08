export interface RateAlert {
  id: string;
  assetOrBrand: string;
  threshold: number;
  direction: 'above' | 'below';
  type: 'crypto' | 'giftcard';
  enabled: boolean;
  createdAt: number;
  lastTriggered?: number;
}

const STORAGE_KEY_PREFIX = 'rate_alerts_';

function getStorageKey(principal: string): string {
  return `${STORAGE_KEY_PREFIX}${principal}`;
}

export function getRateAlerts(principal: string): RateAlert[] {
  try {
    const stored = localStorage.getItem(getStorageKey(principal));
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load rate alerts:', error);
    return [];
  }
}

export function createRateAlert(
  principal: string,
  alert: Omit<RateAlert, 'id' | 'enabled' | 'createdAt'>
): RateAlert {
  const alerts = getRateAlerts(principal);
  const newAlert: RateAlert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    enabled: true,
    createdAt: Date.now(),
  };
  alerts.push(newAlert);
  localStorage.setItem(getStorageKey(principal), JSON.stringify(alerts));
  return newAlert;
}

export function toggleRateAlert(principal: string, alertId: string): void {
  const alerts = getRateAlerts(principal);
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.enabled = !alert.enabled;
    localStorage.setItem(getStorageKey(principal), JSON.stringify(alerts));
  }
}

export function deleteRateAlert(principal: string, alertId: string): void {
  const alerts = getRateAlerts(principal);
  const filtered = alerts.filter(a => a.id !== alertId);
  localStorage.setItem(getStorageKey(principal), JSON.stringify(filtered));
}

export function updateAlertLastTriggered(principal: string, alertId: string): void {
  const alerts = getRateAlerts(principal);
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.lastTriggered = Date.now();
    localStorage.setItem(getStorageKey(principal), JSON.stringify(alerts));
  }
}
