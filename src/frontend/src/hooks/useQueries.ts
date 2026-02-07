import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  GiftCard,
  KycRecord,
  PayoutMethod,
  WithdrawalRequest,
  UserProfile,
  GiftCardStatus,
  KycStatus,
  Variant_paid_rejected,
  Currency,
  Avatar,
} from '../types/app-types';

// Note: ExternalBlob is still imported from backend as it's part of blob-storage
// All other types are now local since backend only provides authorization

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist, return null for now
      return null;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      email: string | null;
      name: string;
      username: string;
      avatar: Avatar;
      country: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Gift Card Queries
export function useGetGiftCards() {
  const { actor, isFetching } = useActor();

  return useQuery<GiftCard[]>({
    queryKey: ['giftCards'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGiftCard(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<GiftCard>({
    queryKey: ['giftCard', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddGiftCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      brand: string;
      currency: Currency;
      amount: bigint;
      code: string;
      image: any | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

export function useUpdateGiftCardStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; newStatus: GiftCardStatus }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCard', variables.id] });
    },
  });
}

// Gift Card Tags Queries
export function useGetUserTags() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, string[]]>>({
    queryKey: ['userTags'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGiftCardTags(giftCardId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['giftCardTags', giftCardId],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching && !!giftCardId,
  });
}

export function useSetGiftCardTags() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { giftCardId: string; tags: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userTags'] });
      queryClient.invalidateQueries({ queryKey: ['giftCardTags', variables.giftCardId] });
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCard', variables.giftCardId] });
    },
  });
}

// KYC Queries
export function useGetKycRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<KycRecord[]>({
    queryKey: ['kycRecords'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitKyc() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      documentType: string;
      documentUri: string;
      idNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycRecords'] });
    },
  });
}

// Admin KYC Queries
export function useAdminGetUserKycRecords(userPrincipal: string) {
  const { actor, isFetching } = useActor();

  return useQuery<KycRecord[]>({
    queryKey: ['adminKycRecords', userPrincipal],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useAdminUpdateKycStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userPrincipal: string;
      idNumber: string;
      newStatus: KycStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminKycRecords', variables.userPrincipal] });
    },
  });
}

// Payout Methods Queries
export function useGetPayoutMethods() {
  const { actor, isFetching } = useActor();

  return useQuery<PayoutMethod[]>({
    queryKey: ['payoutMethods'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPayoutMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutMethods'] });
    },
  });
}

// Withdrawal Queries
export function useGetWithdrawalRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['withdrawalRequests'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      amount: bigint;
      currency: Currency;
      payoutMethodId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Withdrawal Queries
export function useAdminGetPendingWithdrawals() {
  const { actor, isFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['adminPendingWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method doesn't exist
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUpdateWithdrawalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      withdrawalId: string;
      newStatus: Variant_paid_rejected;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method doesn't exist
      throw new Error('Backend method not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
    },
  });
}

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
