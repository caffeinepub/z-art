/**
 * Utility functions for handling optional email fields in user profiles.
 * Normalizes empty/whitespace strings to undefined for backend storage
 * and converts undefined/null to empty strings for form display.
 */

/**
 * Normalize email for backend: convert empty/whitespace strings to undefined
 */
export function normalizeEmailForBackend(email: string | undefined): string | undefined {
  if (!email || email.trim() === '') {
    return undefined;
  }
  return email.trim();
}

/**
 * Normalize email for form display: convert undefined/null to empty string
 */
export function normalizeEmailForDisplay(email: string | undefined | null): string {
  return email || '';
}
