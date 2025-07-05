import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'personal-finance-transactions';

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  const transactions = getTransactions();
  transactions.unshift(newTransaction);
  saveTransactions(transactions);
  
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | null => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  transactions[index] = { ...transactions[index], ...updates };
  saveTransactions(transactions);
  
  return transactions[index];
};

export const deleteTransaction = (id: string): boolean => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  
  if (filtered.length === transactions.length) return false;
  
  saveTransactions(filtered);
  return true;
};