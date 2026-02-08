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

// KYC Verification Check
export function useIsCallerKycVerified() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerKycVerified'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerKycVerified();
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
      return backendRequests.map((req: BackendWithdrawalRequest) => ({
        id: req.id.toString(),
        user: req.owner,
        payoutMethodId: req.payoutMethodId.toString(),
        amount: req.amount,
        currency: { __kind__: 'ngn' as const, ngn: null },
        status: mapBackendWithdrawalStatus(req.status),
        createdAt: req.created,
        processedAt: req.processedAt ? req.processedAt : null,
        processedBy: req.processedBy ? req.processedBy : null,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

// Aliases for compatibility
export const useGetWithdrawalRequests = useGetWithdrawals;

export function useCreateWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { payoutMethodId: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const requestId = await actor.createWithdrawalRequest(
        BigInt(data.payoutMethodId),
        data.amount
      );
      return requestId.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}

// Alias for compatibility
export const useRequestWithdrawal = useCreateWithdrawal;

// Admin - Pending Withdrawals
export function useGetPendingWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      const backendRequests = await actor.listPendingWithdrawals();
      return backendRequests.map((req: BackendWithdrawalRequest) => ({
        id: req.id.toString(),
        user: req.owner,
        payoutMethodId: req.payoutMethodId.toString(),
        amount: req.amount,
        currency: { __kind__: 'ngn' as const, ngn: null },
        status: mapBackendWithdrawalStatus(req.status),
        createdAt: req.created,
        processedAt: req.processedAt ? req.processedAt : null,
        processedBy: req.processedBy ? req.processedBy : null,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for compatibility
export const useAdminGetPendingWithdrawals = useGetPendingWithdrawals;

export function useUpdateWithdrawalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { requestId: string; status: Variant_paid_rejected }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateWithdrawalStatus(
        BigInt(data.requestId),
        mapFrontendStatusToBackend(data.status)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
  });
}

// Alias for compatibility
export const useAdminUpdateWithdrawalStatus = useUpdateWithdrawalStatus;

// KYC
export function useGetKycStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<KycRecord[]>({
    queryKey: ['kycStatus'],
    queryFn: async () => {
      if (!actor) return [];
      const backendRecords = await actor.getKycStatus();
      return backendRecords.map((record: BackendKycRecord) => ({
        id: record.id.toString(),
        documentType: mapBackendDocumentType(record.documentType),
        idNumber: record.idNumber,
        documentUri: record.documentURI,
        signatureUri: record.signature ? record.signature.getDirectURL() : undefined,
        uploadedBy: record.user,
        status: mapBackendKycStatus(record.status),
        submittedAt: record.submittedAt,
        verifiedAt: record.verifiedAt ? record.verifiedAt : null,
        externalId: null,
      }));
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for compatibility
export const useGetKycRecords = useGetKycStatus;

export function useSubmitKyc() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      documentType: string;
      idNumber: string;
      documentUri: string;
      signature?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const backendDocType = mapFrontendDocumentType(data.documentType);
      const recordId = await actor.submitKycRecord(
        backendDocType,
        data.idNumber,
        data.documentUri,
        data.signature ?? null
      );
      return recordId.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycStatus'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerKycVerified'] });
    },
  });
}

// Admin - KYC Review
export function useGetUserKycRecords() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      const backendRecords = await actor.getUserKycRecords(principal);
      return backendRecords.map((record: BackendKycRecord) => ({
        id: record.id.toString(),
        user: record.user.toString(),
        documentType: mapBackendDocumentType(record.documentType),
        idNumber: record.idNumber,
        documentUri: record.documentURI,
        signatureUri: record.signature ? record.signature.getDirectURL() : undefined,
        uploadedBy: record.user,
        status: mapBackendKycStatus(record.status),
        submittedAt: record.submittedAt,
        verifiedAt: record.verifiedAt ? record.verifiedAt : null,
        externalId: null,
      }));
    },
  });
}

// Alias for compatibility
export const useAdminGetUserKycRecords = useGetUserKycRecords;

export function useUpdateKycStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { recordId: string; status: KycStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateKycStatus(
        BigInt(data.recordId),
        mapFrontendKycStatus(data.status)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycStatus'] });
    },
  });
}

// Alias for compatibility
export const useAdminUpdateKycStatus = useUpdateKycStatus;

// Gift Card Rates (Admin)
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
    queryKey: ['activeGiftCardRates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveRates();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateGiftCardRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { brandName: string; ratePercentage: number }) => {
      if (!actor) throw new Error('Actor not available');
      const rateId = await actor.createGiftCardRate(
        data.brandName,
        BigInt(data.ratePercentage)
      );
      return rateId.toString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
      queryClient.invalidateQueries({ queryKey: ['activeGiftCardRates'] });
    },
  });
}

export function useUpdateGiftCardRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rateId: string; ratePercentage: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateGiftCardRate(
        BigInt(data.rateId),
        BigInt(data.ratePercentage)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
      queryClient.invalidateQueries({ queryKey: ['activeGiftCardRates'] });
    },
  });
}

export function useSetGiftCardRateStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rateId: string; status: BackendGiftCardRateStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setGiftCardRateStatus(
        BigInt(data.rateId),
        data.status
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
      queryClient.invalidateQueries({ queryKey: ['activeGiftCardRates'] });
    },
  });
}

// Coin Price Index
export function useGetCoinPriceIndex() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['coinPriceIndex'],
    queryFn: async () => {
      if (!actor) return 100;
      const index = await actor.getCoinPriceIndex();
      return Number(index);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetCoinPriceIndex() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceIndex: number) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCoinPriceIndex(BigInt(priceIndex));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coinPriceIndex'] });
      // Invalidate gift card rates as they depend on the coin price index
      queryClient.invalidateQueries({ queryKey: ['giftCardRates'] });
      queryClient.invalidateQueries({ queryKey: ['activeGiftCardRates'] });
    },
  });
}

// Mock Gift Card queries (stubbed - backend not implemented yet)
export function useGetGiftCards() {
  return useQuery<GiftCard[]>({
    queryKey: ['giftCards'],
    queryFn: async () => {
      // Mock data for now
      return [];
    },
  });
}

export function useGetGiftCard(id: string) {
  return useQuery<GiftCard | null>({
    queryKey: ['giftCard', id],
    queryFn: async () => {
      // Mock data for now
      return null;
    },
  });
}

export function useCreateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<GiftCard>) => {
      // Mock implementation
      throw new Error('Gift card creation is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

// Alias for compatibility
export const useAddGiftCard = useCreateGiftCard;

export function useUpdateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<GiftCard> }) => {
      // Mock implementation
      throw new Error('Gift card update is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

export function useUpdateGiftCardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { cardId: string; status: GiftCardStatus }) => {
      // Mock implementation
      throw new Error('Gift card status update is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

export function useDeleteGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      throw new Error('Gift card deletion is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
}

// User Tags (stubbed - backend not implemented yet)
export function useGetUserTags() {
  return useQuery<Map<string, number>>({
    queryKey: ['userTags'],
    queryFn: async () => {
      // Return empty map for now
      return new Map<string, number>();
    },
  });
}
