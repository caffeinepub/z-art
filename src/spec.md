# Specification

## Summary
**Goal:** Permanently remove the specified header element so the header reflows naturally without leaving any empty space.

**Planned changes:**
- Remove the UI element at XPath `/html[1]/body[1]/div[1]/div[1]/header[1]/div[1]/div[2]/div[1]/div[1]` from the header render output in all states (no conditional rendering).
- Ensure the surrounding header layout collapses/reflows naturally with correct spacing across desktop and mobile breakpoints.
- Keep all other header elements unchanged (no redesign or additional removals).

**User-visible outcome:** The header no longer shows the removed element, and the remaining header items align correctly with no gap where it used to be.
