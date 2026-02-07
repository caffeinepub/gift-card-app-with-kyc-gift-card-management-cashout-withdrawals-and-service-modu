// Nigeria (NGN) gift card rate configuration

export interface AmountTierRange {
  type: 'range';
  min: number;
  max: number;
  ratePerDollar: number; // NGN per $1 USD
}

export interface AmountTierFixed {
  type: 'fixed';
  amount: number;
  ratePerDollar: number; // NGN per $1 USD
}

export type AmountTier = AmountTierRange | AmountTierFixed;

export interface RateTable {
  tiers: AmountTier[];
}

// Default Nigeria rate table based on Apple/iTunes example
export const DEFAULT_NGN_RATE_TABLE: RateTable = {
  tiers: [
    { type: 'range', min: 10, max: 24, ratePerDollar: 1053.57 },
    { type: 'range', min: 25, max: 49, ratePerDollar: 1053.57 },
    { type: 'fixed', amount: 50, ratePerDollar: 1063.90 },
    { type: 'range', min: 51, max: 99, ratePerDollar: 1053.57 },
    { type: 'fixed', amount: 100, ratePerDollar: 1098.73 },
    { type: 'range', min: 101, max: 149, ratePerDollar: 1053.57 },
    { type: 'fixed', amount: 150, ratePerDollar: 1098.73 },
    { type: 'range', min: 151, max: 195, ratePerDollar: 1053.57 },
    { type: 'range', min: 196, max: 199, ratePerDollar: 1024.93 },
    { type: 'fixed', amount: 200, ratePerDollar: 1125.45 },
    { type: 'fixed', amount: 250, ratePerDollar: 1125.45 },
    { type: 'fixed', amount: 300, ratePerDollar: 1125.45 },
    { type: 'fixed', amount: 350, ratePerDollar: 1125.45 },
    { type: 'fixed', amount: 400, ratePerDollar: 1125.45 },
    { type: 'fixed', amount: 450, ratePerDollar: 1125.45 },
    { type: 'fixed', amount: 500, ratePerDollar: 1125.45 },
  ],
};

// Per-brand rate overrides (optional)
// Key should match the brand name from giftCardBrandCatalog
export const BRAND_RATE_OVERRIDES: Record<string, RateTable> = {
  // Example: 'Amazon Gift Card': { tiers: [...] },
  // For now, all brands use the default table
};

/**
 * Get the effective rate table for a brand (override or default)
 * Guarantees a non-empty tier list by falling back to DEFAULT_NGN_RATE_TABLE
 */
export function getBrandRateTable(brandName: string): RateTable {
  const override = BRAND_RATE_OVERRIDES[brandName];
  
  // If override exists and has tiers, use it
  if (override && override.tiers && override.tiers.length > 0) {
    return override;
  }
  
  // Always fall back to default table (which is guaranteed to have tiers)
  return DEFAULT_NGN_RATE_TABLE;
}

export interface MatchedTier {
  tier: AmountTier;
  label: string;
  ratePerDollar: number;
}

/**
 * Find the matching tier for a given USD amount
 * Returns null if no tier matches
 */
export function findMatchingTier(amount: number, rateTable: RateTable): MatchedTier | null {
  if (amount <= 0) return null;

  // First check for exact fixed amount matches
  for (const tier of rateTable.tiers) {
    if (tier.type === 'fixed' && tier.amount === amount) {
      return {
        tier,
        label: `USD ${tier.amount}`,
        ratePerDollar: tier.ratePerDollar,
      };
    }
  }

  // Then check for range matches
  for (const tier of rateTable.tiers) {
    if (tier.type === 'range' && amount >= tier.min && amount <= tier.max) {
      return {
        tier,
        label: `USD ${tier.min}–${tier.max}`,
        ratePerDollar: tier.ratePerDollar,
      };
    }
  }

  return null;
}

/**
 * Format a tier for display
 */
export function formatTierLabel(tier: AmountTier): string {
  if (tier.type === 'fixed') {
    return `USD ${tier.amount}`;
  }
  return `USD ${tier.min}–${tier.max}`;
}

/**
 * Format NGN rate for display
 */
export function formatNGNRate(ratePerDollar: number): string {
  return `₦${ratePerDollar.toFixed(2)} per $1`;
}
