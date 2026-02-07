/**
 * Determines a user-friendly reason for image load failure based on the provided URL.
 * This function performs client-side validation to provide the most specific error message possible.
 */
export function getImageFailureReason(imageUrl: string | undefined | null): string {
  // Check for missing or empty URL
  if (!imageUrl || imageUrl.trim() === '') {
    return 'No image URL provided';
  }

  // Check for valid URL format
  try {
    const url = new URL(imageUrl);
    
    // Check for unsupported schemes
    if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
      return `Unsupported URL scheme: ${url.protocol}`;
    }
  } catch {
    // Invalid URL format
    return 'Invalid image URL format';
  }

  // Generic failure message for onError cases
  return 'Failed to load image from the provided URL';
}

/**
 * Pre-validates an image URL before attempting to load it.
 * Returns null if valid, or an error message if invalid.
 */
export function validateImageUrl(imageUrl: string | undefined | null): string | null {
  if (!imageUrl || imageUrl.trim() === '') {
    return 'No image URL provided';
  }

  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
      return `Unsupported URL scheme: ${url.protocol}`;
    }
    return null; // Valid
  } catch {
    return 'Invalid image URL format';
  }
}
