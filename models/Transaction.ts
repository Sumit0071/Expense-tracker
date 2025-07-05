import { ObjectId } from 'mongodb';

export interface TransactionDocument {
  _id?: ObjectId;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt?: string;
}

export function documentToTransaction(doc: TransactionDocument): Transaction {
  return {
    id: doc._id?.toString() || '',
    amount: doc.amount,
    date: doc.date,
    description: doc.description,
    type: doc.type,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function transactionToDocument(transaction: Omit<Transaction, 'id'>): Omit<TransactionDocument, '_id'> {
  return {
    amount: transaction.amount,
    date: transaction.date,
    description: transaction.description,
    type: transaction.type,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}