# Crypto Wallet Dashboard Implementation Checklist

This document enumerates all visible UI elements, sections, and states from the reference video for the crypto wallet dashboard at `/services/crypto`.

## ✅ Header Section
- [x] **Dashboard header with background image** - `frontend/src/components/crypto/CryptoDashboardHeader.tsx`
- [x] **Total balance display with currency** - `frontend/src/components/crypto/CryptoDashboardHeader.tsx`
- [x] **Balance visibility toggle (eye icon)** - `frontend/src/components/crypto/CryptoDashboardHeader.tsx`

## ✅ Quick Actions Row
- [x] **Send action button** - `frontend/src/components/crypto/CryptoQuickActions.tsx`
- [x] **Receive action button** - `frontend/src/components/crypto/CryptoQuickActions.tsx`
- [x] **Buy action button** - `frontend/src/components/crypto/CryptoQuickActions.tsx`
- [x] **Swap action button** - `frontend/src/components/crypto/CryptoQuickActions.tsx`

## ✅ Token/Assets List Section
- [x] **Section header with title** - `frontend/src/components/crypto/CryptoTokenList.tsx`
- [x] **Token rows with icon, name, ticker, balance** - `frontend/src/components/crypto/CryptoTokenList.tsx`
- [x] **Placeholder balances and USD values** - `frontend/src/components/crypto/CryptoTokenList.tsx`
- [x] **Generic coin fallback icon** - Uses `/assets/generated/coin-generic.dim_128x128.png`

## ✅ Activity/Transactions Section
- [x] **Activity section header** - `frontend/src/components/crypto/CryptoActivitySection.tsx`
- [x] **Filter tabs (All/Sent/Received)** - `frontend/src/components/crypto/CryptoActivitySection.tsx`
- [x] **Activity rows with icon, description, amount, status** - `frontend/src/components/crypto/CryptoActivityRow.tsx`
- [x] **Empty state message** - `frontend/src/components/crypto/CryptoActivitySection.tsx`
- [x] **Loading skeleton state** - `frontend/src/components/crypto/CryptoActivitySection.tsx`

## ✅ Action Sheets/Modals
- [x] **Send crypto sheet** - `frontend/src/components/crypto/sheets/SendCryptoSheet.tsx`
  - Address input field
  - Amount input field
  - Asset selector
  - Submit button with loading state
- [x] **Receive crypto sheet** - `frontend/src/components/crypto/sheets/ReceiveCryptoSheet.tsx`
  - Mock address display
  - Copy button
  - QR code placeholder
- [x] **Swap crypto sheet** - `frontend/src/components/crypto/sheets/SwapCryptoSheet.tsx`
  - From asset selector
  - To asset selector
  - Amount inputs
  - Exchange rate display
  - Confirm button

## ✅ Supporting Elements
- [x] **Floating support/chat button** - `frontend/src/pages/services/CryptoWalletPage.tsx`
- [x] **Bottom navigation safe area spacing** - `frontend/src/pages/services/CryptoWalletPage.tsx`
- [x] **Responsive mobile layout** - All components

## 🔄 Data & State Management
- [x] **Local transaction storage integration** - `frontend/src/state/localTransactions.ts` (extended)
- [x] **Mock token balances** - `frontend/src/pages/services/CryptoWalletPage.tsx`
- [x] **Activity filtering by type** - `frontend/src/components/crypto/CryptoActivitySection.tsx`

## Notes
- All components use shadcn/ui composition (no edits to `frontend/src/components/ui/*`)
- Placeholder data used where backend support is missing
- All crypto actions log to local transaction storage
- No external services or APIs integrated
