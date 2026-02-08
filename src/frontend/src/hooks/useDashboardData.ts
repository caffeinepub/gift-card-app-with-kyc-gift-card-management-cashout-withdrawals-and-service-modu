import { useGetUserGiftCards } from './useQueries';

export function useDashboardData() {
  const { data: giftCards = [], isLoading: giftCardsLoading } = useGetUserGiftCards();

  // Calculate total balance from gift cards
  const totalBalance = giftCards.reduce((sum, card) => {
    return sum + Number(card.amount);
  }, 0);

  // Count pending cards
  const pendingCount = giftCards.filter(card => card.status.__kind__ === 'pending').length;

  // Count available cards
  const availableCount = giftCards.filter(card => card.status.__kind__ === 'available').length;

  return {
    totalBalance,
    pendingCount,
    availableCount,
    isLoading: giftCardsLoading,
  };
}
