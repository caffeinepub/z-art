# Specification

## Summary
**Goal:** Ensure all backend data (users, artists, artworks, submissions, inquiries, and ID counters) persists safely across canister upgrades with versioned stable-state support.

**Planned changes:**
- Add stable variables to store snapshots of user profiles, artist profiles, artworks, submissions, inquiries, and ID counters.
- Implement `system preupgrade` to serialize and write the full in-memory state into stable memory.
- Implement `system postupgrade` to restore/rebuild the in-memory Maps and counters from stable memory, including a clean initialization path for fresh installs.
- Add a stable schema/version marker and guarded restore logic with a conditional migration path that preserves existing state (including nullable `UserProfile.avatar`).

**User-visible outcome:** After backend upgrades, previously created profiles, artworks, submissions, and inquiries are still available via existing query methods, and new IDs continue incrementing from the pre-upgrade values.
