# Specification

## Summary
**Goal:** Ensure the Add Gift Card form shows the Nigeria (NGN) rate summary when a valid Amount is entered, instead of silently showing nothing.

**Planned changes:**
- On `/gift-cards/add`, render the existing `NGNRateInlineSummary` near the Amount field when a Brand is selected and the Amount is a positive number.
- Use the existing NGN rate configuration/matching logic (`giftCardRatesNGN.ts` via `getBrandRateTable` + `findMatchingTier`) to determine the matching tier and drive the inline summary display.
- When no tier matches the entered Amount, show the existing explicit “rate unavailable” state from `NGNRateInlineSummary` (rather than rendering nothing).
- Add lightweight automated UI regression checks to confirm the rate summary appears for a matching Amount and that the “rate unavailable” message appears when no tier matches, both wired to the current NGN matching/formatting logic.
- Keep the Add Gift Card submit flow unchanged (still uses `useAddGiftCard` and existing success/error toasts).

**User-visible outcome:** When adding a gift card and entering a valid amount, users see an inline “Nigeria Rate” summary (or a clear “rate unavailable” message if no NGN tier matches) instead of a blank/missing rate area.
