# Specification

## Summary
**Goal:** Add support for a private internal artist profile name and a unique public site username, and update the new profile creation flow and public displays to use the public username.

**Planned changes:**
- Update backend artist profile model and APIs to store both `profileName` (private) and `username` (public), including a public profile view that excludes `profileName`.
- Enforce uniqueness of `username` on create/update and return a clear, user-readable error when taken.
- Build a new frontend artist profile creation flow that collects both fields, validates the username client-side, and surfaces backend uniqueness errors.
- Update public-facing UI surfaces to display `artist.username` and ensure `profileName` is only visible in owner-only views.

**User-visible outcome:** Users can create an artist profile with a private internal name and a unique public username; public pages show the username, while the private name is only visible to the signed-in owner.
