# Specification

## Summary
**Goal:** Redesign the logged-out login screen to match the provided screenshot’s email/password-style UI while keeping Internet Identity as the only authentication method.

**Planned changes:**
- Update the unauthenticated login layout to match the screenshot: dark full-screen background/header with a large white rounded sheet containing the “Log in” title, “Don’t have an account? Sign up” row, two large rounded input fields (email + password), “Forgot Password?” link, and a wide rounded “Continue” primary CTA at the bottom.
- Keep routing/auth gating intact so this redesigned screen shows when no identity is present.
- Wire the “Continue” button to trigger the existing Internet Identity flow (`useInternetIdentity().login`) with a loading/disabled state while `loginStatus` is “logging-in”.
- Ensure the email/password fields do not perform email/password authentication (ignored/optional/disabled) and add concise helper text indicating that login uses Internet Identity (without bringing back a large alert card).
- Add screenshot-like interactions: password visibility toggle inside the password field, link styling + hover/focus states for “Sign up” and “Forgot Password?”, and prevent double-submit on the primary CTA.

**User-visible outcome:** When logged out, users see a screenshot-matching login screen and can tap “Continue” to sign in via Internet Identity, with clear UI feedback and no email/password authentication behavior.
