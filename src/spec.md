# Specification

## Summary
**Goal:** Implement a complete KYC verification workflow covering NIN, ID card, voter’s card, passport, and address verification, including user submission, backend storage, and admin review/approval.

**Planned changes:**
- Add a backend KYC record data model and persistent per-user storage (document type, document URI, ID number, uploaded-by principal, status, timestamps).
- Add backend user APIs to submit a KYC record (default status=pending) and list the authenticated user’s KYC records.
- Add backend admin APIs to fetch any user’s KYC records and update a record’s status to verified/rejected (and optionally expired if supported).
- Wire frontend React Query hooks to the new backend KYC APIs and ensure queries invalidate/refresh after submissions and admin status updates.
- Update the KYC submission page UI to support document types (NIN, ID card, voter’s card, passport, address verification) with required-field validation and existing file constraints.
- Update the admin KYC review UI to display record details and provide a link/button to open the submitted document URI for review before approving/rejecting.

**User-visible outcome:** Users can submit KYC documents for the supported document types and view their KYC status history; admins can search for a user’s KYC records, open submitted documents via their URI, and approve/reject pending submissions.
