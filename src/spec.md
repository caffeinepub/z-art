# Specification

## Summary
**Goal:** Add a backend-only admin authorization mechanism so the caller can be recognized as an admin with full review permissions, with no new UI.

**Planned changes:**
- Add canister-level admin authorization in `backend/main.mo`, including a way to bootstrap the specified Internet Identity principal as an admin.
- Gate admin-only review operations (e.g., approve/reject submissions and viewing all submissions) behind an `isCallerAdmin()`-style check.
- Persist the admin authorization state across canister upgrades (stable storage), adding a migration only if required by existing state/schema changes.

**User-visible outcome:** After deployment, the user can log in with Internet Identity and backend admin-only review actions succeed for that admin identity and are rejected for non-admins, with no new frontend UI.
