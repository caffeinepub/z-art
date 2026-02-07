# Specification

## Summary
**Goal:** Let users upload, view, change, and remove an optional profile avatar, stored as part of their user profile.

**Planned changes:**
- Extend the backend `UserProfile` model with an optional avatar field (data URL string) and update all profile read/write APIs to include/persist it.
- Regenerate/update the Candid interface/types so the frontend can read/write the new avatar field.
- Update the Profile Setup modal to pick an image file, convert it to a data URL via `fileToDataUrl`, preview it, allow clearing it, and submit it with name/email/bio.
- Update the My Profile page to display the current avatar (if any) and support uploading/changing/removing it with the existing save/dirty-state flow and error handling.

**User-visible outcome:** Users can optionally add an avatar image during profile setup or later on the My Profile page, see a preview, save it so it persists on refresh, or remove it.
