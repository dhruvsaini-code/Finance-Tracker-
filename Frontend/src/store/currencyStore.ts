import { create } from 'zustand';

export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'INR';

interface CurrencyState {
  currency: CurrencyType;
  currencySymbol: string;
  setCurrency: (currency: CurrencyType) => void;
  formatAmount: (amount: number) => string;
}

const symbols: Record<CurrencyType, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

export const useCurrencyStore = create<CurrencyState>((set) => {
  const savedCurrency = (localStorage.getItem('currency') || 'USD') as CurrencyType;
  return {
    currency: savedCurrency,
    currencySymbol: symbols[savedCurrency],
    setCurrency: (currency: CurrencyType) => {
      localStorage.setItem('currency', currency);
      set({ currency, currencySymbol: symbols[currency] });
    },
    formatAmount: (amount: number) => {
      const active = localStorage.getItem('currency') as CurrencyType || 'USD';
      return `${symbols[active]}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };
});
