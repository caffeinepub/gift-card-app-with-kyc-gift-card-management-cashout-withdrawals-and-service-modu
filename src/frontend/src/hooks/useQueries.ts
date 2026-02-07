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
import type { PayoutMethod as BackendPayoutMethod, WithdrawalRequest as BackendWithdrawalRequest, WithdrawalStatus as BackendWithdrawalStatus, UserProfile as BackendUserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

// Note: ExternalBlob is still imported from backend as it's part of blob-storage
// All other types are now local since backend only provides authorization

// Helper to convert backend WithdrawalStatus to frontend
function mapBackendWithdrawalStatus(status: BackendWithdrawalStatus): { __kind__: 'pending' } | { __kind__: 'paid' } | { __kind__: 'rejected' } {
  if (status === 'pending') return { __kind__: 'pending' };
  if (status === 'paid') return { __kind__: 'paid' };
  if (status === 'rejected') return { __kind__: 'rejected' };
  return { __kind__: 'pending' };
}

// Helper to convert frontend status string to backend enum
function mapFrontendStatusToBackend(status: Variant_paid_rejected): BackendWithdrawalStatus {
  return status as BackendWithdrawalStatus;
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const backendProfile = await actor.getCallerUserProfile();
      if (!backendProfile) return null;
      
      // Map backend UserProfile (just name) to frontend UserProfile
      const now = BigInt(Date.now() * 1000000);
      return {
        id: 'caller',
        email: null,
        name: backendProfile.name,
        username: backendProfile.name.toLowerCase().replace(/\s+/g, ''),
        avatar: {
          url: null,
          publicId: null,
          imgData: null,
          auto: true,
          style: null,
        },
        country: 'US',
        wallets: null,
        isPremium: false,
        createdAt: now,
        updatedAt1: null,
      };
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
      const backendProfile: BackendUserProfile = {
        name: profile.name,
      };
      await actor.saveCallerUserProfile(backendProfile);
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
      const backendProfile: BackendUserProfile = {
        name: params.name,
      };
      await actor.saveCallerUserProfile(backendProfile);
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
      const backendMethods = await actor.listUserPayoutMethods();
      // Map backend PayoutMethod to frontend PayoutMethod
      return backendMethods.map((method: BackendPayoutMethod) => ({
        id: method.id.toString(),
        bankName: method.bankName,
        accountName: method.accountName,
        accountNumber: method.accountNumber,
        createdAt: method.created,
      }));
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
      const methodId = await actor.createPayoutMethod(
        params.bankName,
        params.accountNumber,
        params.accountName
      );
      return methodId.toString();
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
      const backendRequests = await actor.listUserWithdrawals();
      // Map backend WithdrawalRequest to frontend WithdrawalRequest
      return backendRequests.map((request: BackendWithdrawalRequest) => ({
        id: request.id.toString(),
        user: request.owner,
        amount: request.amount,
        currency: { __kind__: 'usd', usd: null } as Currency, // Backend doesn't store currency yet
        payoutMethodId: request.payoutMethodId.toString(),
        status: mapBackendWithdrawalStatus(request.status),
        createdAt: request.created,
        processedAt: request.processedAt ?? null,
        processedBy: request.processedBy ?? null,
      }));
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
      const requestId = await actor.createWithdrawalRequest(
        BigInt(params.payoutMethodId),
        params.amount
      );
      return requestId.toString();
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
      const backendRequests = await actor.listPendingWithdrawals();
      // Map backend WithdrawalRequest to frontend WithdrawalRequest
      return backendRequests.map((request: BackendWithdrawalRequest) => ({
        id: request.id.toString(),
        user: request.owner,
        amount: request.amount,
        currency: { __kind__: 'usd', usd: null } as Currency,
        payoutMethodId: request.payoutMethodId.toString(),
        status: mapBackendWithdrawalStatus(request.status),
        createdAt: request.created,
        processedAt: request.processedAt ?? null,
        processedBy: request.processedBy ?? null,
      }));
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
      await actor.updateWithdrawalStatus(
        BigInt(params.withdrawalId),
        mapFrontendStatusToBackend(params.newStatus)
      );
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
