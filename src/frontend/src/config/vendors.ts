export interface Vendor {
  id: string;
  name: string;
  rate: number; // e.g., 0.85 for 85%
  fee?: number; // Optional fee override; if not provided, uses global fee
}

export const VENDORS: Vendor[] = [
  {
    id: 'premium-exchange',
    name: 'Premium Exchange',
    rate: 0.88,
    fee: 0.03,
  },
  {
    id: 'quick-cash',
    name: 'Quick Cash',
    rate: 0.86,
    fee: 0.04,
  },
  {
    id: 'global-traders',
    name: 'Global Traders',
    rate: 0.85,
    fee: 0.05,
  },
  {
    id: 'instant-convert',
    name: 'Instant Convert',
    rate: 0.87,
    fee: 0.045,
  },
];

/**
 * Calculate net payout for a vendor given an amount
 */
function calculateVendorPayout(amount: number, vendor: Vendor, globalFee: number): number {
  const gross = amount * vendor.rate;
  const fee = gross * (vendor.fee ?? globalFee);
  return gross - fee;
}

/**
 * Select the best vendor for a given amount based on highest net payout.
 * Tie-breaking is stable (first vendor in list wins).
 */
export function selectBestVendor(amount: number, globalFee: number): Vendor {
  if (amount <= 0 || VENDORS.length === 0) {
    return VENDORS[0];
  }

  let bestVendor = VENDORS[0];
  let bestPayout = calculateVendorPayout(amount, bestVendor, globalFee);

  for (let i = 1; i < VENDORS.length; i++) {
    const vendor = VENDORS[i];
    const payout = calculateVendorPayout(amount, vendor, globalFee);
    if (payout > bestPayout) {
      bestPayout = payout;
      bestVendor = vendor;
    }
  }

  return bestVendor;
}
