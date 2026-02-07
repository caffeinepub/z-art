/**
 * GBP Money Utilities
 * 
 * Handles conversion between user-facing decimal GBP values (e.g., "123.45")
 * and backend minor-unit integer storage (e.g., 12345 pence).
 */

/**
 * Format a minor-unit price (pence) as a GBP string with £ symbol
 * @param minorUnits - Price in pence (e.g., 12345 for £123.45)
 * @returns Formatted string like "£123.45"
 */
export function formatGBP(minorUnits: bigint | number): string {
  const pounds = Number(minorUnits) / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pounds);
}

/**
 * Parse a user-entered price string into minor units (pence)
 * Accepts formats like: "123.45", "£123.45", "1,234.56", "£1,234.56"
 * @param input - User input string
 * @returns Price in pence as bigint
 * @throws Error if input is invalid
 */
export function parseGBPToMinorUnits(input: string): bigint {
  // Remove £ symbol and whitespace
  let cleaned = input.replace(/£/g, '').trim();
  
  // Remove thousands separators (commas)
  cleaned = cleaned.replace(/,/g, '');
  
  // Parse as float
  const pounds = parseFloat(cleaned);
  
  if (isNaN(pounds) || pounds < 0) {
    throw new Error('Invalid price format');
  }
  
  // Convert to pence (minor units) and round to avoid floating point issues
  const pence = Math.round(pounds * 100);
  
  return BigInt(pence);
}

/**
 * Convert minor units to a decimal string suitable for form input
 * @param minorUnits - Price in pence
 * @returns Decimal string like "123.45"
 */
export function minorUnitsToDecimal(minorUnits: bigint | number): string {
  const pounds = Number(minorUnits) / 100;
  return pounds.toFixed(2);
}
