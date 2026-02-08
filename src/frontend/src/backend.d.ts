import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type KycRecordId = bigint;
export type Time = bigint;
export type WithdrawalRequestId = bigint;
export type PayoutMethodId = bigint;
export type GiftCardRateId = bigint;
export interface PayoutMethod {
    id: PayoutMethodId;
    created: Time;
    owner: Principal;
    bankName: string;
    accountName: string;
    accountNumber: string;
}
export interface KycRecord {
    id: KycRecordId;
    status: KycStatus;
    documentType: DocumentType;
    signature?: ExternalBlob;
    documentURI: string;
    user: Principal;
    submittedAt: Time;
    idNumber: string;
    verifiedAt?: Time;
}
export interface GiftCardRate {
    id: GiftCardRateId;
    status: GiftCardRateStatus;
    createdAt: Time;
    updatedAt: Time;
    ratePercentage: bigint;
    brandName: string;
}
export interface WithdrawalRequest {
    id: WithdrawalRequestId;
    status: WithdrawalStatus;
    created: Time;
    payoutMethodId: PayoutMethodId;
    owner: Principal;
    processedAt?: Time;
    processedBy?: Principal;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum DocumentType {
    votersID = "votersID",
    passport = "passport",
    nationalID = "nationalID",
    driversLicense = "driversLicense"
}
export enum GiftCardRateStatus {
    active = "active",
    inactive = "inactive"
}
export enum KycStatus {
    verified = "verified",
    expired = "expired",
    pending = "pending",
    unverified = "unverified",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalStatus {
    pending = "pending",
    paid = "paid",
    rejected = "rejected"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGiftCardRate(brandName: string, ratePercentage: bigint): Promise<GiftCardRateId>;
    createPayoutMethod(bankName: string, accountNumber: string, accountName: string): Promise<PayoutMethodId>;
    createWithdrawalRequest(payoutMethodId: PayoutMethodId, amount: bigint): Promise<WithdrawalRequestId>;
    getActiveRateForBrand(brandName: string): Promise<bigint | null>;
    getAllRates(): Promise<Array<GiftCardRate>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKycStatus(): Promise<Array<KycRecord>>;
    getUserKycRecords(user: Principal): Promise<Array<KycRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listActiveRates(): Promise<Array<GiftCardRate>>;
    listPendingWithdrawals(): Promise<Array<WithdrawalRequest>>;
    listUserPayoutMethods(): Promise<Array<PayoutMethod>>;
    listUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setGiftCardRateStatus(rateId: GiftCardRateId, status: GiftCardRateStatus): Promise<void>;
    submitKycRecord(documentType: DocumentType, idNumber: string, documentURI: string, signature: ExternalBlob | null): Promise<KycRecordId>;
    updateGiftCardRate(rateId: GiftCardRateId, ratePercentage: bigint): Promise<void>;
    updateKycStatus(recordId: KycRecordId, status: KycStatus): Promise<void>;
    updateWithdrawalStatus(requestId: WithdrawalRequestId, status: WithdrawalStatus): Promise<void>;
}
