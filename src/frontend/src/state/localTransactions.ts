interface LocalTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  timestamp: number;
  status: string;
}

const STORAGE_KEY = 'local_transactions';

export function addLocalTransaction(transaction: Omit<LocalTransaction, 'id' | 'timestamp'>) {
  const transactions = getLocalTransactions();
  const newTransaction: LocalTransaction = {
    ...transaction,
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  
  transactions.unshift(newTransaction);
  
  // Keep only last 50 transactions
  const trimmed = transactions.slice(0, 50);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to save local transaction:', error);
  }
  
  return newTransaction;
}

export function getLocalTransactions(): LocalTransaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load local transactions:', error);
    return [];
  }
}

export function clearLocalTransactions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear local transactions:', error);
  }
}
