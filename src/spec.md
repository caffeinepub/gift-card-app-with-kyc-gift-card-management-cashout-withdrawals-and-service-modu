# Specification

## Summary
**Goal:** Add a secure 1:1 Trading Chat experience with “Verified Trader” identity badges and an in-chat escrow flow backed by persisted backend state.

**Planned changes:**
- Backend: add authenticated 1:1 chat thread model and canister methods to create/fetch a thread, send messages, and list messages with strict participant/admin access control and persisted canister storage.
- Backend: add chat-attached escrow model with lifecycle actions (create, fund, release, cancel), server-side state transition validation, participant-only authorization, and per-thread escrow querying for UI rendering.
- Backend: add a query to return whether a given Principal is KYC-verified (boolean only) for “Verified Trader” badge display, aligned with existing KYC verification logic.
- Frontend: add Trading Chat section with thread creation (enter counterparty Principal), thread list, and chat detail view with message history, composer, and polling/manual refresh updates.
- Frontend: display “Verified Trader” badge in chat UI wherever participant identity is shown, including loading states.
- Frontend: add in-chat escrow UI in the chat detail view (create escrow, view status/timeline, and perform valid actions with confirmations and readable error handling).
- Frontend: apply a coherent, distinctive visual theme for new chat/badge/escrow components consistent with existing Tailwind + shadcn composition patterns.

**User-visible outcome:** Users can start a 1:1 trading chat by entering another user’s Principal, exchange messages (updates via polling/refresh), see “Verified Trader” badges for verified participants, and create/manage an escrow within the chat (fund/release/cancel) with clear status and confirmations.
