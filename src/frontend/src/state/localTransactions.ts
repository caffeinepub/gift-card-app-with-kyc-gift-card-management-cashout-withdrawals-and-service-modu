import type { LocalTransaction } from '../types/app-types';

const STORAGE_KEY = 'local_transactions';

export type { LocalTransaction };

export function getLocalTransactions(): LocalTransaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load local transactions:', error);
    return [];
  }
}

export function addLocalTransaction(transaction: LocalTransaction): void {
  try {
    const transactions = getLocalTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('localTransactionAdded', { detail: transaction }));
  } catch (error) {
    console.error('Failed to save local transaction:', error);
  }
}

export function clearLocalTransactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('localTransactionAdded'));
  } catch (error) {
    console.error('Failed to clear local transactions:', error);
  }
}
