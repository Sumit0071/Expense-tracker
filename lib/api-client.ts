import { Transaction, TransactionFormData } from '@/types/transaction';

const API_BASE = '/api';

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE}/transactions`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  
  return response.json();
}

export async function createTransaction(data: TransactionFormData): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      type: data.type,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }
  
  return response.json();
}

export async function updateTransactionAPI(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
  const updateData: any = {};
  
  if (data.amount) updateData.amount = Number(data.amount);
  if (data.date) updateData.date = data.date;
  if (data.description) updateData.description = data.description;
  if (data.type) updateData.type = data.type;
  
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update transaction');
  }
  
  return response.json();
}

export async function deleteTransactionAPI(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete transaction');
  }
}