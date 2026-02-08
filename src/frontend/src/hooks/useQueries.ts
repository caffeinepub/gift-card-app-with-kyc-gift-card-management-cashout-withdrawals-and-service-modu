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
import type { 
  PayoutMethod as BackendPayoutMethod, 
  WithdrawalRequest as BackendWithdrawalRequest, 
  WithdrawalStatus as BackendWithdrawalStatus, 
  UserProfile as BackendUserProfile,
  KycRecord as BackendKycRecord,
  DocumentType as BackendDocumentType,
  KycStatus as BackendKycStatus,
  ExternalBlob,
  GiftCardRate as BackendGiftCardRate,
  GiftCardRateStatus as BackendGiftCardRateStatus,
} from '../backend';
import { DocumentType, KycStatus as BackendKycStatusEnum, GiftCardRateStatus } from '../backend';
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

// Helper to map backend DocumentType to frontend string
function mapBackendDocumentType(docType: BackendDocumentType): string {
  switch (docType) {
    case DocumentType.driversLicense:
      return 'ID card';
    case DocumentType.passport:
      return 'Passport';
    case DocumentType.votersID:
      return "Voter's card";
    case DocumentType.nationalID:
      return 'NIN';
    default:
      return 'Unknown';
  }
}

// Helper to map frontend document type string to backend enum
function mapFrontendDocumentType(docType: string): BackendDocumentType {
  switch (docType) {
    case 'nin':
      return DocumentType.nationalID;
    case 'id_card':
      return DocumentType.driversLicense;
    case 'voters_card':
      return DocumentType.votersID;
    case 'passport':
      return DocumentType.passport;
    case 'address_verification':
      throw new Error('Address verification is not yet supported by the backend');
    default:
      throw new Error(`Unsupported document type: ${docType}`);
  }
}

// Helper to map backend KycStatus to frontend
function mapBackendKycStatus(status: BackendKycStatus): KycStatus {
  switch (status) {
    case 'pending':
      return { __kind__: 'pending' };
    case 'verified':
      return { __kind__: 'verified' };
    case 'rejected':
      return { __kind__: 'rejected' };
    case 'expired':
      return { __kind__: 'expired' };
    default:
      return { __kind__: 'pending' };
  }
}

// Helper to map frontend KycStatus to backend
function mapFrontendKycStatus(status: KycStatus): BackendKycStatus {
  return status.__kind__ as BackendKycStatus;
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

// Alias for compatibility
export const useCreateUserProfile = useSaveCallerUserProfile;

// Admin check
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Payout Methods
export function useGetPayoutMethods() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PayoutMethod[]>({
    queryKey: ['payoutMethods'],
    queryFn: async () => {
      if (!actor) return [];
      const backendMethods = await actor.listUserPayoutMethods();
      return backendMethods.map((method: BackendPayoutMethod) => ({
        id: method.id.toString(),
        bankName: method.bankName,
        accountName: method.accountName,
        accountNumber: method.accountNumber,
        createdAt: method.created,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreatePayoutMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bankName: string; accountName: string; accountNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      const methodId = await actor.createPayoutMethod(
        data.bankName,
        data.accountNumber,
        data.accountName
      );
      return methodId.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutMethods'] });
    },
  });
}

// Alias for compatibility
export const useAddPayoutMethod = useCreatePayoutMethod;

// Withdrawals
export function useGetWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      const backendRequests = await actor.listUserWithdrawals();
      return backendRequests.map((request: BackendWithdrawalRequest) => ({
        id: request.id.toString(),
        user: request.owner,
        amount: request.amount,
        currency: { __kind__: 'ngn' as const, ngn: null },
        payoutMethodId: request.payoutMethodId.toString(),
        status: mapBackendWithdrawalStatus(request.status),
        createdAt: request.created,
        processedAt: request.processedAt ? request.processedAt : null,
        processedBy: request.processedBy ? request.processedBy : null,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for compatibility
export const useGetWithdrawalRequests = useGetWithdrawals;

export function useCreateWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { payoutMethodId: string; amount: bigint; currency?: Currency }) => {
      if (!actor) throw new Error('Actor not available');
      const requestId = await actor.createWithdrawalRequest(
        BigInt(data.payoutMethodId),
        data.amount
      );
      return requestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}

// Alias for compatibility
export const useRequestWithdrawal = useCreateWithdrawal;

// Admin - Withdrawals
export function useAdminGetPendingWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['admin', 'pendingWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      const backendRequests = await actor.listPendingWithdrawals();
      return backendRequests.map((request: BackendWithdrawalRequest) => ({
        id: request.id.toString(),
        user: request.owner,
        amount: request.amount,
        currency: { __kind__: 'ngn' as const, ngn: null },
        payoutMethodId: request.payoutMethodId.toString(),
        status: mapBackendWithdrawalStatus(request.status),
        createdAt: request.created,
        processedAt: request.processedAt ? request.processedAt : null,
        processedBy: request.processedBy ? request.processedBy : null,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminUpdateWithdrawalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { requestId: string; newStatus: Variant_paid_rejected }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateWithdrawalStatus(
        BigInt(data.requestId),
        mapFrontendStatusToBackend(data.newStatus)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingWithdrawals'] });
    },
  });
}

// KYC
export function useGetKycRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<KycRecord[]>({
    queryKey: ['kycRecords'],
    queryFn: async () => {
      if (!actor) return [];
      const backendRecords = await actor.getKycStatus();
      return backendRecords.map((record: BackendKycRecord) => ({
        documentType: mapBackendDocumentType(record.documentType),
        documentUri: record.documentURI,
        idNumber: record.idNumber,
        uploadedBy: record.user,
        status: mapBackendKycStatus(record.status),
        externalId: null,
        recordId: record.id.toString(),
        signatureUri: record.signature ? record.signature.getDirectURL() : null,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitKyc() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      documentType: string; 
      documentUri: string; 
      idNumber: string;
      signature?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const backendDocType = mapFrontendDocumentType(data.documentType);
      const recordId = await actor.submitKycRecord(
        backendDocType,
        data.idNumber,
        data.documentUri,
        data.signature || null
      );
      return recordId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycRecords'] });
    },
  });
}

// Admin - KYC
export function useAdminGetUserKycRecords(userPrincipal: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<KycRecord[]>({
    queryKey: ['admin', 'kycRecords', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      const principal = Principal.fromText(userPrincipal);
      const backendRecords = await actor.getUserKycRecords(principal);
      return backendRecords.map((record: BackendKycRecord) => ({
        documentType: mapBackendDocumentType(record.documentType),
        documentUri: record.documentURI,
        idNumber: record.idNumber,
        uploadedBy: record.user,
        status: mapBackendKycStatus(record.status),
        externalId: null,
        recordId: record.id.toString(),
        signatureUri: record.signature ? record.signature.getDirectURL() : null,
      }));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useAdminUpdateKycStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userPrincipal: string; recordId: string; newStatus: KycStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateKycStatus(
        BigInt(data.recordId),
        mapFrontendKycStatus(data.newStatus)
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kycRecords', variables.userPrincipal] });
    },
  });
}

// Gift Card Rates
export function useGetAllGiftCardRates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BackendGiftCardRate[]>({
    queryKey: ['giftCardRates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRates();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetActiveGiftCardRates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BackendGiftCardRate[]>({
    queryKey: ['giftCardRates', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveRates();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetActiveRateForBrand(brandName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint | null>({
    queryKey: ['giftCardRates', 'brand', brandName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveRateForBrand(brandName);
    },
    enabled: !!actor && !actorFetching && !!brandName,
  });
}

export function useCreateGiftCardRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { brandName: string; ratePercentage: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const rateId = await actor.createGiftCardRate(data.brandName, data.ratePercentage);
      return rateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
    },
  });
}

export function useUpdateGiftCardRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rateId: string; ratePercentage: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateGiftCardRate(BigInt(data.rateId), data.ratePercentage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
    },
  });
}

export function useSetGiftCardRateStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rateId: string; status: BackendGiftCardRateStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setGiftCardRateStatus(BigInt(data.rateId), data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
    },
  });
}

// Gift Cards (stubbed - backend doesn't support yet)
export function useGetGiftCards() {
  return useQuery<GiftCard[]>({
    queryKey: ['giftCards'],
    queryFn: async () => {
      return [];
    },
  });
}

export function useGetGiftCard(id: string) {
  return useQuery<GiftCard | null>({
    queryKey: ['giftCard', id],
    queryFn: async () => {
      return null;
    },
  });
}

export function useAddGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { brand: string; currency: Currency; amount: bigint; code?: string; image: any }) => {
      throw new Error('Gift card functionality is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

export function useUpdateGiftCardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { cardId: string; newStatus: GiftCardStatus }) => {
      throw new Error('Gift card functionality is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

// Gift Card Labels (stubbed - backend doesn't support yet)
export function useGetGiftCardLabels(cardId: string) {
  return useQuery<string[]>({
    queryKey: ['giftCardLabels', cardId],
    queryFn: async () => {
      return [];
    },
  });
}

// Alias for compatibility
export const useGetGiftCardTags = useGetGiftCardLabels;

export function useUpdateGiftCardLabels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { cardId?: string; giftCardId?: string; labels?: string[]; tags?: string[] }) => {
      throw new Error('Gift card labels functionality is not yet implemented in the backend');
    },
    onSuccess: (_, variables) => {
      const id = variables.cardId || variables.giftCardId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['giftCardLabels', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

// Alias for compatibility
export const useSetGiftCardTags = useUpdateGiftCardLabels;

// Tags (stubbed - backend doesn't support yet)
export function useGetAllTags() {
  return useQuery<Map<string, number>>({
    queryKey: ['allTags'],
    queryFn: async () => {
      return new Map();
    },
  });
}

// Alias for compatibility
export const useGetUserTags = useGetAllTags;
