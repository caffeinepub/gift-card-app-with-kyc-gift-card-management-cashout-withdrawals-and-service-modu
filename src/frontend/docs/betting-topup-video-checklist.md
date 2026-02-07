# Betting Top-Up Flow Implementation Checklist

This document tracks the implementation of the betting account top-up flow based on the reference video and design requirements.

## Overview
The betting top-up flow allows users to add funds to their betting accounts through a mobile-first, two-step process: details entry and review/confirmation.

**Primary Implementation File:** `frontend/src/pages/services/BettingPage.tsx`  
**Configuration File:** `frontend/src/config/betting.ts`

---

## Screens & Steps

### 1. Details Entry Screen
- [x] Mobile-first layout with sticky header
- [x] Back button in header (top-left)
- [x] Centered page title "Betting Top-Up"
- [x] Provider selection dropdown
- [x] Betting account ID input field with icon
- [x] Wallet balance display (₦0.00)
- [x] Amount input field with NGN currency pill
- [x] Quick-pick amount chips (₦500 - ₦50,000)
- [x] Bottom "Continue" CTA button (rounded-full, primary style)

### 2. Review & Confirmation Screen
- [x] Header with "Review & Confirm" title
- [x] Back button returns to details entry
- [x] Transaction summary card showing:
  - [x] Provider name
  - [x] Account ID
  - [x] Amount (formatted with NGN symbol)
- [x] "Confirm Top-Up" primary button
- [x] "Back to Edit" secondary button

### 3. Processing State
- [x] Disabled form controls during processing
- [x] Loading spinner on confirm button
- [x] "Processing..." text feedback

### 4. Success State
- [x] Success toast notification
- [x] Form reset to initial state
- [x] Return to details entry step

---

## Form Fields & Inputs

### Provider Selection
- [x] Dropdown/Select component
- [x] List of 8 betting providers (Bet9ja, SportyBet, 1xBet, NairaBet, BetKing, MerryBet, 22Bet, BetWay)
- [x] Placeholder: "Select betting provider"
- [x] Disabled during processing

### Betting Account ID
- [x] Text input field
- [x] Trophy icon on right side
- [x] Placeholder: "Enter your betting account ID"
- [x] Disabled during processing

### Amount Input
- [x] Number input (step 0.01)
- [x] NGN currency pill on right
- [x] Placeholder: "Enter amount"
- [x] Disabled during processing

### Quick-Pick Amount Chips
- [x] 7 preset amounts: ₦500, ₦1,000, ₦2,000, ₦5,000, ₦10,000, ₦20,000, ₦50,000
- [x] Clickable chips fill amount input
- [x] Disabled during processing
- [x] Hover state styling

---

## Validations

### Form Validation
- [x] Provider must be selected
- [x] Account ID must not be empty (trimmed)
- [x] Amount must be greater than 0
- [x] Continue button disabled until all fields valid

### Error Handling
- [x] Toast error if form submitted with invalid data
- [x] Graceful error messaging

---

## States & Interactions

### Loading States
- [x] `isProcessing` state controls all disabled states
- [x] Inline spinner on confirm button during processing
- [x] All inputs/buttons disabled during processing

### Navigation
- [x] Back button on details screen goes to previous page (window.history.back)
- [x] Back button on review screen returns to details step
- [x] Continue button advances to review step
- [x] Confirm button processes transaction and resets

### Local Transaction Logging
- [x] Type: 'betting'
- [x] Currency: 'NGN' (consistent with other services)
- [x] Description includes provider and account ID: `"${provider} betting top-up for ${accountId}"`
- [x] Status: 'pending'
- [x] Transaction logged only after confirmation (not on Continue)

### Post-Success Behavior
- [x] Success toast displayed
- [x] Form fields reset (provider, accountId, amount cleared)
- [x] Step reset to 'details'
- [x] Processing state cleared

---

## Design Consistency

### Mobile-First Layout
- [x] Full-height page container (`min-h-screen`)
- [x] Safe area padding (`pb-safe`)
- [x] Sticky header with border-bottom
- [x] Content padding (px-4 py-6)

### Component Patterns
- [x] Matches AirtimePage structure and spacing
- [x] Uses shadcn/ui components (Select, Input, Button, Card, Label)
- [x] Consistent input heights (h-14)
- [x] Consistent button styling (rounded-full for primary CTA)
- [x] Muted background for inputs (bg-muted/50)

### Typography & Spacing
- [x] Header title: text-lg font-semibold
- [x] Labels: text-sm font-medium
- [x] Consistent spacing (space-y-6, space-y-2)
- [x] Proper form section grouping

---

## Configuration

### Betting Providers List
- [x] Defined in `frontend/src/config/betting.ts`
- [x] Exported as `BETTING_PROVIDERS` array
- [x] 8 providers included

### Amount Chips
- [x] Defined in `frontend/src/config/betting.ts`
- [x] Exported as `AMOUNT_CHIPS` array
- [x] 7 preset amounts (500 to 50000)

---

## Testing Checklist

### User Flow
- [ ] Navigate to /services/betting
- [ ] Select a provider from dropdown
- [ ] Enter betting account ID
- [ ] Enter or select amount via chips
- [ ] Click Continue (should advance to review)
- [ ] Verify summary shows correct details
- [ ] Click Back to Edit (should return to details with data preserved)
- [ ] Click Continue again, then Confirm Top-Up
- [ ] Verify success toast appears
- [ ] Verify form resets to initial state
- [ ] Verify transaction logged in local storage with correct metadata

### Validation Testing
- [ ] Try clicking Continue with empty fields (should show error)
- [ ] Try clicking Continue with only provider selected (should be disabled)
- [ ] Try clicking Continue with zero amount (should be disabled)
- [ ] Verify all controls disable during processing

### Responsive Testing
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Verify header stays sticky on scroll
- [ ] Verify buttons remain accessible

---

## Notes
- Coming Soon badge/alert has been removed as per requirements
- Currency aligned to NGN (Nigerian Naira) for consistency with other bill payment services
- Two-step flow (details → review) provides user confidence before final submission
- Local transaction logging matches patterns from AirtimePage and other service pages
