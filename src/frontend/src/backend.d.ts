import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type WithdrawalRequestId = bigint;
export type PayoutMethodId = bigint;
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
export interface PayoutMethod {
    id: PayoutMethodId;
    created: Time;
    owner: Principal;
    bankName: string;
    accountName: string;
    accountNumber: string;
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
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    listPendingWithdrawals(): Promise<Array<WithdrawalRequest>>;
    listUserPayoutMethods(): Promise<Array<PayoutMethod>>;
    listUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    updateWithdrawalStatus(requestId: WithdrawalRequestId, status: WithdrawalStatus): Promise<void>;
}
