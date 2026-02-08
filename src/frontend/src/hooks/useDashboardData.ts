import { useGetGiftCards } from './useQueries';
import type { LocalTransaction } from '../types/app-types';
import { getLocalTransactions } from '../state/localTransactions';

export function useDashboardData() {
  const { data: giftCards = [], isLoading: giftCardsLoading } = useGetGiftCards();

  const localTransactions = getLocalTransactions();

  const recentActivity = [
    ...localTransactions.map(tx => ({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      timestamp: tx.timestamp,
      status: tx.status,
    })),
  ].sort((a, b) => {
    const aTime = typeof a.timestamp === 'bigint' ? Number(a.timestamp) : a.timestamp;
    const bTime = typeof b.timestamp === 'bigint' ? Number(b.timestamp) : b.timestamp;
    return bTime - aTime;
  }).slice(0, 10);

  const totalBalance = giftCards.reduce((sum, card) => {
    if (card.status.__kind__ === 'available') {
      return sum + Number(card.amount);
    }
    return sum;
  }, 0);

  const availableCards = giftCards.filter(card => card.status.__kind__ === 'available').length;
  const pendingCards = giftCards.filter(card => card.status.__kind__ === 'pending').length;

  const tagCounts = new Map<string, number>();

  return {
    totalBalance,
    availableCards,
    pendingCards,
    recentActivity,
    tags: tagCounts,
    isLoading: giftCardsLoading,
  };
}
