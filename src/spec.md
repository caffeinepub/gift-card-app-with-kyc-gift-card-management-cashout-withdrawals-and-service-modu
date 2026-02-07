# Specification

## Summary
**Goal:** Add a complete “send to bank” withdrawal flow backed by persistent payout methods and withdrawal requests, and connect existing withdrawals UI to real backend data.

**Planned changes:**
- Add backend Candid methods and stable storage for authenticated users to create and list their bank payout methods (bank name, account name, account number), with validation and stable unique IDs.
- Add backend Candid methods and stable storage for authenticated users to create and list their withdrawal requests (amount, currency, payoutMethodId) with default `pending` status and `createdAt` timestamps.
- Add backend admin-only methods to list all pending withdrawals and mark withdrawals as `paid` or `rejected`, recording `processedAt` and `processedBy`.
- Update Withdrawals React Query hooks to call the new backend methods for payout methods and withdrawals, including loading/error states and toast-based error handling.
- Add a new “Send to bank” quick action in the crypto wallet that opens a bottom-sheet multi-step flow (amount/currency, choose/add payout method, review, confirm) and creates a withdrawal on confirm.
- Add conditional state migration support only if needed to safely introduce new stable state without trapping on upgrade.

**User-visible outcome:** Users can add bank payout methods, request send-to-bank withdrawals, and see withdrawal history/status in the Withdrawals screens; they can also start the flow from the crypto wallet via a new “Send to bank” quick action, while admins can process pending withdrawals as paid or rejected.
