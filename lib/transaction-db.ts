import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';
import { Transaction, TransactionDocument, documentToTransaction, transactionToDocument } from '@/models/Transaction';

const COLLECTION_NAME = 'transactions';

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const db = await getDatabase();
    const collection = db.collection<TransactionDocument>(COLLECTION_NAME);
    
    const documents = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return documents.map(documentToTransaction);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  try {
    const db = await getDatabase();
    const collection = db.collection<TransactionDocument>(COLLECTION_NAME);
    
    const newTransaction: Omit<TransactionDocument, '_id'> = {
      ...transactionToDocument({
        ...transaction,
        createdAt: new Date().toISOString(),
      }),
    };
    
    const result = await collection.insertOne(newTransaction);
    
    const insertedDoc = await collection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve inserted transaction');
    }
    
    return documentToTransaction(insertedDoc);
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction');
  }
}

export async function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction | null> {
  try {
    const db = await getDatabase();
    const collection = db.collection<TransactionDocument>(COLLECTION_NAME);
    
    const updateDoc = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );
    
    return result ? documentToTransaction(result) : null;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const collection = db.collection<TransactionDocument>(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  try {
    const db = await getDatabase();
    const collection = db.collection<TransactionDocument>(COLLECTION_NAME);
    
    const documents = await collection
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: -1 })
      .toArray();
    
    return documents.map(documentToTransaction);
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw new Error('Failed to fetch transactions by date range');
  }
}

export async function getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]> {
  try {
    const db = await getDatabase();
    const collection = db.collection<TransactionDocument>(COLLECTION_NAME);
    
    const documents = await collection
      .find({ type })
      .sort({ createdAt: -1 })
      .toArray();
    
    return documents.map(documentToTransaction);
  } catch (error) {
    console.error('Error fetching transactions by type:', error);
    throw new Error('Failed to fetch transactions by type');
  }
}