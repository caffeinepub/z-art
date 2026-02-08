# Specification

## Summary
**Goal:** Make gallery and artist browsing fully public, while requiring a completed profile only when users upload or interact (e.g., purchase inquiry).

**Planned changes:**
- Allow anonymous and profile-incomplete authenticated users to browse: Gallery, Artwork details, Artists list, and Artist profile pages without being blocked by profile setup gating.
- Change profile setup gating so it is not enforced site-wide during browsing; instead, enforce profile completion only at restricted actions (upload flow and interaction flows).
- Gate purchase inquiry on the artwork detail page: require login first, then require a completed profile before submission.
- Fix the Artists page rendering so it consistently displays the full set of artists returned by the backend (no unintended filtering/caching drops).

**User-visible outcome:** Anyone can browse all artworks and artists without signing in or completing a profile; signing in and completing a profile is only required when uploading content or submitting a purchase inquiry.
