import { getBrandRateTable, findMatchingTier, MatchedTier } from '../../config/giftCardRatesNGN';

/**
 * Helper to compute the matched NGN rate tier for a given brand and amount.
 * Returns null if amount is invalid or no tier matches.
 */
export function computeNGNRateTier(brand: string, amountStr: string): MatchedTier | null {
  // Parse amount
  const amount = parseFloat(amountStr);
  
  // Validate amount
  if (!amountStr || isNaN(amount) || amount <= 0) {
    return null;
  }
  
  // Get brand's rate table
  const rateTable = getBrandRateTable(brand);
  
  // Find matching tier
  return findMatchingTier(amount, rateTable);
}
