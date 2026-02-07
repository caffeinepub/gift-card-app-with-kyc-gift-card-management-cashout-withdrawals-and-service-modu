import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type KycRecordId = bigint;
export type Time = bigint;
export type WithdrawalRequestId = bigint;
export type PayoutMethodId = bigint;
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
    documentURI: string;
    user: Principal;
    submittedAt: Time;
    idNumber: string;
    verifiedAt?: Time;
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
    createPayoutMethod(bankName: string, accountNumber: string, accountName: string): Promise<PayoutMethodId>;
    createWithdrawalRequest(payoutMethodId: PayoutMethodId, amount: bigint): Promise<WithdrawalRequestId>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKycStatus(): Promise<Array<KycRecord>>;
    getUserKycRecords(user: Principal): Promise<Array<KycRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listPendingWithdrawals(): Promise<Array<WithdrawalRequest>>;
    listUserPayoutMethods(): Promise<Array<PayoutMethod>>;
    listUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitKycRecord(documentType: DocumentType, idNumber: string, documentURI: string): Promise<KycRecordId>;
    updateKycStatus(recordId: KycRecordId, status: KycStatus): Promise<void>;
    updateWithdrawalStatus(requestId: WithdrawalRequestId, status: WithdrawalStatus): Promise<void>;
}
