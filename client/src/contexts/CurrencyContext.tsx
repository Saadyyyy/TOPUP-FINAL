import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Currency,
  detectCurrency,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("IDR");
  const [mounted, setMounted] = useState(false);

  // Initialize currency from localStorage or auto-detect
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("currency") as Currency;
    if (stored && (stored === "IDR" || stored === "MYR")) {
      setCurrencyState(stored);
    } else {
      const detected = detectCurrency();
      setCurrencyState(detected);
      localStorage.setItem("currency", detected);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const formatPrice = (amount: number): string => {
    if (!mounted) return "Rp 0"; // SSR fallback
    return formatCurrencyUtil(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
