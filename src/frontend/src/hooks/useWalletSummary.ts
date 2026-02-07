import { useGetCallerUserProfile } from './useCurrentUserProfile';

export function useWalletSummary() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  const wallets = profile?.wallets || [];
  const primaryWallet = wallets[0];
  
  const balance = primaryWallet?.balance || BigInt(0);
  const currency = primaryWallet?.currency || { __kind__: 'usd' as const, usd: null };

  return {
    balance,
    currency,
    isLoading,
  };
}
