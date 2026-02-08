# Specification

## Summary
**Goal:** Require users to be KYC-verified before they can create withdrawal requests, with clear backend enforcement and frontend gating.

**Planned changes:**
- Enforce a KYC gate in the backend `createWithdrawalRequest` so only users whose latest KYC record is **verified** can create withdrawals; otherwise return clear English error messages.
- Add a protected backend query that returns whether the authenticated caller is currently eligible to withdraw (true only if latest KYC record is verified), using the same logic as withdrawal creation.
- Update the Withdrawals UI to block/disable withdrawal requests for non-verified users, show an English explanation, and provide a link/button to navigate to the existing KYC page; surface backend KYC errors in English if encountered.

**User-visible outcome:** Users who are not KYC-verified cannot request withdrawals and are prompted to complete KYC; verified users can withdraw as before.
