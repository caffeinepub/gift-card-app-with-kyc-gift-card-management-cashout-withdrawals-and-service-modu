# Specification

## Summary
**Goal:** Expand the selectable Nigerian bank list for withdrawal payout method creation to include major digital banks/fintechs.

**Planned changes:**
- Update `frontend/src/config/nigerianBanks.ts` to add user-facing bank entries for: Kuda Bank, OPay, Moniepoint, and PalmPay.
- Ensure the updated bank list remains the single source of truth consumed by `NigerianBankSelect`, so the new options appear via search (e.g., “kuda”, “opay”, “monie”, “palm”).
- Verify payout method creation works with these new selections in both the Withdrawals flow and the Send-to-Bank sheet without UI/validation issues.

**User-visible outcome:** Users can search for and select Kuda Bank, OPay, Moniepoint, and PalmPay (and other Nigerian digital bank options present in the updated list) when creating a payout method for withdrawals.
