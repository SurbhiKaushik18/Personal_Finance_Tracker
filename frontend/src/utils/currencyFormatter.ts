/**
 * Utility functions for currency formatting
 */

/**
 * Format a number as Indian Rupees
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with rupee symbol
 */
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  return `₹${amount.toFixed(decimals)}`;
};

/**
 * Format a number as Indian Rupees with thousands separators
 * @param amount - The amount to format
 * @returns Formatted string with rupee symbol and thousands separators
 */
export const formatCurrencyWithSeparators = (amount: number): string => {
  // Format with Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}; 