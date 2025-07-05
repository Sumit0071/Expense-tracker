import { Transaction, MonthlyExpense } from '@/types/transaction';

export const getMonthlyExpenses = (transactions: Transaction[]): MonthlyExpense[] => {
  const monthlyData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
    });
  
  // Get last 12 months of data
  const result: MonthlyExpense[] = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    result.push({
      month: monthKey,
      amount: monthlyData[monthKey] || 0
    });
  }
  
  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};