import { GiftCard } from '../../types/app-types';
import { getBrandRateTable } from '../../config/giftCardRatesNGN';

export interface RankedGiftCard {
  card: GiftCard;
  bestRate: number | null;
  rateLabel: string;
}

/**
 * Compute the best available NGN rate for a brand
 * Returns the highest ratePerDollar from the brand's rate table
 */
function computeBestBrandRate(brandName: string): number | null {
  try {
    const rateTable = getBrandRateTable(brandName);
    if (!rateTable.tiers || rateTable.tiers.length === 0) {
      return null;
    }
    
    // Find the maximum ratePerDollar across all tiers
    const maxRate = Math.max(...rateTable.tiers.map(tier => tier.ratePerDollar));
    return maxRate;
  } catch (error) {
    console.error(`Error computing rate for brand ${brandName}:`, error);
    return null;
  }
}

/**
 * Rank gift cards by best available NGN rate (descending)
 * Uses deterministic tiebreakers: rate desc, then brand name asc, then card id asc
 */
export function rankGiftCardsByRate(cards: GiftCard[]): RankedGiftCard[] {
  // Compute best rate for each card
  const rankedCards: RankedGiftCard[] = cards.map(card => {
    const bestRate = computeBestBrandRate(card.brand);
    const rateLabel = bestRate !== null 
      ? `₦${bestRate.toFixed(2)} per $1`
      : 'Rate unavailable';
    
    return {
      card,
      bestRate,
      rateLabel,
    };
  });

  // Sort by rate (desc), then brand name (asc), then card id (asc)
  rankedCards.sort((a, b) => {
    // Cards with rates come before cards without rates
    if (a.bestRate === null && b.bestRate !== null) return 1;
    if (a.bestRate !== null && b.bestRate === null) return -1;
    
    // Both have rates: sort by rate descending
    if (a.bestRate !== null && b.bestRate !== null) {
      if (a.bestRate !== b.bestRate) {
        return b.bestRate - a.bestRate;
      }
    }
    
    // Tiebreaker 1: brand name ascending
    const brandCompare = a.card.brand.localeCompare(b.card.brand);
    if (brandCompare !== 0) return brandCompare;
    
    // Tiebreaker 2: card id ascending
    return a.card.id.localeCompare(b.card.id);
  });

  return rankedCards;
}
