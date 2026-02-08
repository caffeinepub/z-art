# Specification

## Summary
**Goal:** Redesign backend storage to ensure all application data persists across canister upgrades and automatically migrates from Version 14 without any manual action.

**Planned changes:**
- Add stable-memory persistence for all core datasets (user profiles, artist profiles, artworks, submissions, purchase inquiries) and ID counters so they survive upgrades.
- Implement explicit upgrade hooks (preupgrade/postupgrade) to serialize runtime Maps/counters into stable storage and rehydrate them on upgrade completion.
- Add an automatic, conditional migration that detects Version 14 state shape during upgrade and converts it into the new stable format in an idempotent way.
- Ensure all mutating operations (including replaceDataset and create/edit/delete flows) correctly update persisted state so post-upgrade data matches pre-upgrade data.

**User-visible outcome:** After upgrading the canister, existing users, uploads, and related data from Version 14 (including counters and relationships) remain available automatically, with no manual migration steps or resets.
