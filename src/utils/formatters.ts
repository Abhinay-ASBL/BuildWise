/**
 * Format number as Indian Rupees with proper comma grouping
 * e.g., 1245000 → "₹12,45,000"
 */
export function formatINR(amount: number): string {
  if (amount === 0) return '₹0';
  const formatted = amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  return `₹${formatted}`;
}

/**
 * Compact INR format for charts and badges
 * e.g., 1245000 → "₹12.5L", 52856950 → "₹5.29Cr"
 */
export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs}`;
}

/**
 * Format number with Indian comma grouping (no ₹ symbol)
 */
export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Format as percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format cost per sqft
 */
export function formatCostPerSqft(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}/sqft`;
}

/**
 * Parse an Indian-formatted number string back to a number
 * e.g., "12,45,000" → 1245000, "8,00,000" → 800000
 */
export function parseINR(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
