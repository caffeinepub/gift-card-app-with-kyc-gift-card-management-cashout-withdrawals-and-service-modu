# Specification

## Summary
**Goal:** Restrict when a pending withdrawal can be approved as paid to a 5–20 minute window after creation, and update user/admin UI messaging to match.

**Planned changes:**
- Enforce a server-side rule in `backend/main.mo` that only allows marking a pending withdrawal as `#paid` between 5 and 20 minutes (inclusive) after it was created; return clear English errors when outside the window.
- Keep `#rejected` behavior unchanged (still allowed for pending requests regardless of time window).
- Update user-facing copy to consistently state a 5–20 minute processing window on:
  - `frontend/src/components/crypto/sheets/SendToBankSheet.tsx` (review info text)
  - `frontend/src/pages/withdrawals/WithdrawalsPage.tsx` (typical processing time text)
- Update the Withdrawals page pending-status helper so it reflects the 5–20 minute window rather than a fixed 10-minute countdown.
- In `frontend/src/pages/admin/AdminWithdrawalsPage.tsx`, display the backend window-rule error in a helpful toast when approval fails due to the timing restriction; keep other error handling and reject behavior unchanged.

**User-visible outcome:** Users see updated withdrawal timing text (5–20 minutes) and more accurate pending timing indicators, while admins can only approve withdrawals as paid within 5–20 minutes and will see a clear toast message if they try too early or too late.
