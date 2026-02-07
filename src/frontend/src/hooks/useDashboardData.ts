import { useGetCallerUserProfile } from './useCurrentUserProfile';
import { useGetKycRecords, useGetGiftCards, useGetWithdrawalRequests, useGetUserTags } from './useQueries';
import { getLocalTransactions } from '../state/localTransactions';
import type { WithdrawalRequest, Transaction } from '../types/app-types';

export function useDashboardData() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: kycRecords = [], isLoading: kycLoading } = useGetKycRecords();
  const { data: giftCards = [], isLoading: cardsLoading } = useGetGiftCards();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useGetWithdrawalRequests();
  const { data: userTags = [], isLoading: tagsLoading } = useGetUserTags();

  const isLoading = profileLoading || kycLoading || cardsLoading || withdrawalsLoading || tagsLoading;

  // KYC status
  const latestKyc = kycRecords[kycRecords.length - 1];
  const kycStatus = latestKyc?.status || null;

  // Balance
  const wallets = profile?.wallets || [];
  const primaryWallet = wallets[0];
  const balance = primaryWallet?.balance || BigInt(0);
  const currency = primaryWallet?.currency || { __kind__: 'usd' as const, usd: null };

  // Gift cards stats
  const totalCards = giftCards.length;
  const availableCards = giftCards.filter(c => c.status.__kind__ === 'available').length;
  const totalValue = giftCards.reduce((sum, card) => sum + Number(card.amount), 0);

  // Pending withdrawals - properly handle the status type
  const pendingWithdrawals = withdrawals.filter((w: WithdrawalRequest) => {
    const status = w.status as any;
    if (typeof status === 'object' && status !== null && '__kind__' in status) {
      return status.__kind__ === 'pending';
    }
    return false;
  });

  // Recent transactions (combine backend + local)
  const backendTransactions = primaryWallet?.transactions || [];
  const localTransactions = getLocalTransactions();
  
  const allTransactions = [
    ...backendTransactions.map((t: Transaction) => {
      const status = t.status as any;
      const statusStr = typeof status === 'object' && status !== null && '__kind__' in status 
        ? status.__kind__ 
        : String(status);
      
      return {
        id: t.id,
        type: t.kind.__kind__,
        amount: Number(t.amount),
        currency: t.currency,
        description: t.description,
        timestamp: Number(t.timestamp),
        status: statusStr,
        isLocal: false,
      };
    }),
    ...localTransactions.map(t => ({
      ...t,
      isLocal: true,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  // Convert tags array to Map for easy lookup
  const tagsMap = new Map(userTags);

  return {
    isLoading,
    kycStatus,
    balance,
    currency,
    totalCards,
    availableCards,
    totalValue,
    pendingWithdrawals: pendingWithdrawals.length,
    recentTransactions: allTransactions,
    tagsMap,
  };
}
