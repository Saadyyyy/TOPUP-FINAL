// Currency utilities for IDR/MYR conversion and formatting

export type Currency = "IDR" | "MYR";

// Get exchange rate from environment or use default
const getExchangeRate = (): number => {
  // Default: 1 MYR = 3,400 IDR
  return parseFloat(import.meta.env.VITE_MYR_TO_IDR_RATE || "3400");
};

/**
 * Detect currency based on browser language
 */
export const detectCurrency = (): Currency => {
  if (typeof window === "undefined") return "IDR";

  const language = navigator.language || navigator.languages?.[0] || "id-ID";

  // Malaysian locales
  if (language.startsWith("ms") || language === "ms-MY") {
    return "MYR";
  }

  // Default to IDR (Indonesian)
  return "IDR";
};

/**
 * Convert amount between currencies
 * Base currency in DB is IDR
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
): number => {
  if (fromCurrency === toCurrency) return amount;

  const rate = getExchangeRate();

  // Convert IDR to MYR
  if (fromCurrency === "IDR" && toCurrency === "MYR") {
    return amount / rate;
  }

  // Convert MYR to IDR
  if (fromCurrency === "MYR" && toCurrency === "IDR") {
    return amount * rate;
  }

  return amount;
};

/**
 * Format currency with proper symbol and locale
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  // Convert from IDR (base currency) to display currency
  const convertedAmount = convertCurrency(amount, "IDR", currency);

  if (currency === "MYR") {
    return new Intl.NumberFormat("ms-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  }

  // IDR (no decimals)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: Currency): string => {
  return currency === "MYR" ? "RM" : "Rp";
};

/**
 * Get currency name
 */
export const getCurrencyName = (currency: Currency): string => {
  return currency === "MYR" ? "Malaysian Ringgit" : "Indonesian Rupiah";
};
