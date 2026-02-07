# Specification

## Summary
**Goal:** Let users choose from a complete static list of Nigerian banks when adding a “Send to Bank” payout method, instead of typing the bank name manually.

**Planned changes:**
- Add a maintained frontend module/config that exports an array of Nigerian bank names (strings) to be used as the single source for bank Select options.
- Update the “Send to Bank” sheet payout-method creation step so “Bank Name” is a searchable Select dropdown populated from the Nigerian banks list, while storing the selected bank name in the existing payout method fields.
- Update the Withdrawals page “Add Payout Method” form so “Bank Name” is a searchable Select dropdown populated from the same Nigerian banks list, preserving the existing backend payload shape (bankName/accountName/accountNumber).

**User-visible outcome:** When adding a bank payout method (from the Send to Bank sheet or the Withdrawals page), users can search and select any Nigerian bank from a dropdown, and the chosen bank name appears correctly in payout-method lists and pickers.
