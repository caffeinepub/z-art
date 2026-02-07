# Specification

## Summary
**Goal:** Let users tap/click artwork images to view them full-screen in a reusable lightbox without leaving the current page.

**Planned changes:**
- Add a reusable full-screen/lightbox image viewer that opens from an existing rendered image URL (including data-URL previews) and supports closing via close button, Escape key, and backdrop click.
- Enable image-only click/tap handling on Gallery artwork cards so clicking the image opens the lightbox while clicks outside the image continue to navigate to the artwork details page.
- Enable tap-to-view-full on the main artwork image on the Artwork Details page, scaling to fit the viewport while preserving aspect ratio.
- Enable tap-to-view-full on the preview image in the Edit Artwork form while keeping the “clear new image” control working without opening the viewer.
- Enable tap-to-view-full on artwork thumbnails in the Admin Submissions table, ensuring closing the viewer returns the user to the same context/scroll position.
- Ensure image load failures do not replace existing user-visible image error messaging with a broken full-screen view.

**User-visible outcome:** Users can tap/click artwork images (gallery cards, details page, edit preview, and admin thumbnails) to see them in a full-screen lightbox and close it easily, while existing navigation and error messaging continue to work as before.
