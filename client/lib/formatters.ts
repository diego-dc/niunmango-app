/**
 * Formats a number as Chilean Peso currency
 * Uses dots as thousands separator (Chilean standard)
 * @param amount - The number to format
 * @returns Formatted string with thousands separator
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number as Chilean Peso currency with $ prefix
 * @param amount - The number to format
 * @returns Formatted string with $ prefix and thousands separator
 */
export function formatCurrency(amount: number): string {
  return `$${formatCLP(amount)}`;
}

/**
 * Formats a percentage with no decimal places
 * @param percentage - The percentage to format
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
