import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { RateQuote } from '../backend';

interface SellQuoteParams {
  brandName: string;
  amount: number;
}

/**
 * Hook to generate and fetch a backend sell quote with rate snapshot
 */
export function useSellGiftCardQuote(params: SellQuoteParams | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Query to generate and fetch the quote
  const query = useQuery<RateQuote | null>({
    queryKey: ['sellQuote', params?.brandName, params?.amount],
    queryFn: async () => {
      if (!actor || !params) return null;

      // First, get the active rate for the brand
      const activeRate = await actor.getActiveRateForBrand(params.brandName);
      
      if (activeRate === null) {
        throw new Error(`No active rate found for ${params.brandName}`);
      }

      // Generate a quote with the active rate
      const quote = await actor.generateRateQuote(
        params.brandName,
        BigInt(Number(activeRate))
      );

      return quote;
    },
    enabled: !!actor && !actorFetching && !!params && params.amount > 0,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

/**
 * Hook to calculate payout for a quote
 */
export function useCalculatePayout() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ quoteId, amount }: { quoteId: bigint; amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      const payout = await actor.calculatePayout(quoteId, BigInt(Math.round(amount * 100)));
      return Number(payout) / 100; // Convert from cents to dollars
    },
  });
}
