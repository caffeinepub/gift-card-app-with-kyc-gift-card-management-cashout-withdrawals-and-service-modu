# Specification

## Summary
**Goal:** Add backend support for managing per-brand gift card rates with active/inactive status.

**Planned changes:**
- Add a `gift_card_rates` data model in `backend/main.mo` with fields: `id`, `brand_name`, `rate_percentage`, `status` (active/inactive), stored in backend state with an auto-incrementing id counter.
- Implement admin-only backend methods to create, update, and deactivate/reactivate gift card rate entries.
- Implement query methods to list gift card rate entries (explicitly defined as admin-only or public) and to fetch the active `rate_percentage` for a given `brand_name` (returning null when none is active).

**User-visible outcome:** Admins can manage brand-specific gift card rates (including toggling active/inactive), and the system can retrieve the active rate for a given brand when needed.
