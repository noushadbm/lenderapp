import { Currency } from './types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbols = {
    USD: '$',
    AED: 'د.إ',
    INR: '₹',
  };

  return `${symbols[currency]}${amount.toFixed(2)}`;
};