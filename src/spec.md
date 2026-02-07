# Specification

## Summary
**Goal:** Replace any Firebase/placeholder auth and data stubs with Internet Identity authentication and a real, persistent Motoko backend data layer, then wire the frontend to those backend methods.

**Planned changes:**
- Implement stable, upgrade-safe Motoko persistence (single actor) for user profiles, gift cards, gift card tags/labels, and KYC records (alongside existing payouts/withdrawals), keyed by the authenticated caller Principal.
- Enforce authorization rules in the backend: user-scoped methods only read/write the caller’s own data; admin-only methods require admin privileges and trap with clear English errors when unauthorized.
- Update React Query hooks to call real backend actor methods for profile, gift cards, tags, KYC, and admin KYC; ensure mutations invalidate/refetch so UI reflects persisted updates.
- Update authentication UX copy to clearly state Internet Identity is used; remove any UI text implying Google Sign-In or email/password support; ensure sign-out clears identity and cached queries.
- Add a short, non-blocking in-app informational note stating Firebase/third-party auth providers are not used and data is stored on-canister with Internet Identity.

**User-visible outcome:** Users can sign in with Internet Identity, complete profile setup once, and then reliably create/view/update gift cards, tags, and KYC with data persisting across sessions; admins can view and update admin KYC flows when authorized.
