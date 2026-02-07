/**
 * Local type definitions for application data structures
 * These types are defined here because the backend has been reduced to only authorization functionality
 * In a full implementation, these would be generated from the backend Candid interface
 */

import type { Principal } from '@dfinity/principal';

// Currency types
export type Currency =
  | { __kind__: 'kes'; kes: null }
  | { __kind__: 'usd'; usd: null }
  | { __kind__: 'ngn'; ngn: null }
  | { __kind__: 'inr'; inr: null }
  | { __kind__: 'custom'; custom: string };

// Avatar types
export interface Avatar {
  url: string | null;
  publicId: string | null;
  imgData: any | null; // ExternalBlob
  auto: boolean;
  style: string | null;
}

// User Profile types
export interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  username: string;
  avatar: Avatar;
  country: string;
  wallets: Wallet[] | null;
  isPremium: boolean;
  createdAt: bigint;
  updatedAt1: bigint | null;
}

// Wallet and Transaction types
export interface Transaction {
  id: string;
  amount: bigint;
  currency: Currency;
  description: string;
  timestamp: bigint;
  kind:
    | { __kind__: 'deposit' }
    | { __kind__: 'withdrawal' }
    | { __kind__: 'transfer'; from: Principal; to: Principal }
    | { __kind__: 'sellGiftCard' };
  status:
    | { __kind__: 'pending' }
    | { __kind__: 'completed' }
    | { __kind__: 'failed' };
  externalId: ExternalId | null;
  metadata: Array<[string, string]>;
}

export interface Wallet {
  id: string;
  name: string;
  balance: bigint;
  currency: Currency;
  transactions: Transaction[] | null;
  createdAt: bigint;
  updatedAt1: bigint | null;
  metadata: Array<[string, string]>;
  isActive: boolean;
  externalId: ExternalId | null;
}

export interface ExternalId {
  id: string;
  provider: string | null;
}

// Gift Card types
export type GiftCardStatus =
  | { __kind__: 'available' }
  | { __kind__: 'pending' }
  | { __kind__: 'sold' }
  | { __kind__: 'archived' };

export interface GiftCard {
  id: string;
  brand: string;
  currency: Currency;
  amount: bigint;
  code: string;
  notes: string | null;
  uploadedBy: Principal;
  seller: Principal | null;
  status: GiftCardStatus;
  createdAt: bigint;
  updatedAt1: bigint | null;
  image: any | null; // ExternalBlob
  externalId: ExternalId | null;
}

// KYC types
export type KycStatus =
  | { __kind__: 'pending' }
  | { __kind__: 'verified' }
  | { __kind__: 'rejected' }
  | { __kind__: 'expired' };

export interface KycRecord {
  documentType: string;
  documentUri: string;
  idNumber: string;
  uploadedBy: Principal;
  status: KycStatus;
  externalId: ExternalId | null;
  recordId?: string; // Optional field for admin operations
}

// Payout Method types
export interface PayoutMethod {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  createdAt: bigint;
}

// Withdrawal types
export type WithdrawalStatus =
  | { __kind__: 'pending' }
  | { __kind__: 'paid' }
  | { __kind__: 'rejected' };

export type Variant_paid_rejected = 'paid' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  user: Principal;
  amount: bigint;
  currency: Currency;
  payoutMethodId: string;
  status: WithdrawalStatus;
  createdAt: bigint;
  processedAt: bigint | null;
  processedBy: Principal | null;
}
