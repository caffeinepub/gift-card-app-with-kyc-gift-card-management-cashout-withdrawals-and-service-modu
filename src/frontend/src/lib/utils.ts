import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Currency } from '../types/app-types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency | string): string {
  // Handle string currency for backward compatibility
  if (typeof currency === 'string') {
    const currencyCode = currency.toUpperCase();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode === 'KES' ? 'KES' : currencyCode === 'NGN' ? 'NGN' : currencyCode === 'INR' ? 'INR' : 'USD',
    }).format(amount);
  }

  // Handle Currency type
  if (currency.__kind__ === 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } else if (currency.__kind__ === 'kes') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  } else if (currency.__kind__ === 'ngn') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  } else if (currency.__kind__ === 'inr') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  } else if (currency.__kind__ === 'custom') {
    return `${currency.custom} ${amount.toFixed(2)}`;
  }
  return amount.toFixed(2);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
