import { Currency } from './AppContext';

export const formatCurrency = (amount: number, currency?: Currency): string => {
  const symbols = {
    USD: '$',
    AED: 'د.إ',
    INR: '₹',
  };

  const currencySymbol = symbols[currency || 'USD'] || '$'; // Default to USD symbol if currency is invalid
  return `${currencySymbol}${amount.toFixed(2)}`;
};
