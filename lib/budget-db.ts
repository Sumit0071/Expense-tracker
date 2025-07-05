import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface Budget {
  _id?: string;
  category: string;
  monthlyLimit: number;
  month: string; // Format: YYYY-MM
  createdAt: Date;
  updatedAt: Date;
}

// Demo budgets for when MongoDB is not available
const demoBudgets: Budget[] = [
  {
    _id: '1',
    category: 'Food',
    monthlyLimit: 500,
    month: '2024-01',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '2',
    category: 'Transportation',
    monthlyLimit: 200,
    month: '2024-01',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '3',
    category: 'Entertainment',
    monthlyLimit: 150,
    month: '2024-01',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '4',
    category: 'Shopping',
    monthlyLimit: 300,
    month: '2024-01',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export async function getBudgets(month?: string): Promise<Budget[]> {
  try {
    const { db, isConnected } = await connectToDatabase();
    
    if (!isConnected) {
      console.log('Using demo budgets - MongoDB not connected');
      return month ? demoBudgets.filter(b => b.month === month) : demoBudgets;
    }

    const collection = db.collection('budgets');
    const query = month ? { month } : {};
    const budgets = await collection.find(query).toArray();
    
    return budgets.map(budget => ({
      ...budget,
      _id: budget._id.toString()
    }));
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return month ? demoBudgets.filter(b => b.month === month) : demoBudgets;
  }
}

export async function createBudget(budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
  try {
    const { db, isConnected } = await connectToDatabase();
    
    if (!isConnected) {
      throw new Error('Cannot create budget - MongoDB not connected. Using demo mode.');
    }

    const collection = db.collection('budgets');
    const now = new Date();
    
    const newBudget = {
      ...budget,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newBudget);
    
    return {
      ...newBudget,
      _id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('Error creating budget:', error);
    throw new Error('Failed to create budget');
  }
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | null> {
  try {
    const { db, isConnected } = await connectToDatabase();
    
    if (!isConnected) {
      throw new Error('Cannot update budget - MongoDB not connected. Using demo mode.');
    }

    const collection = db.collection('budgets');
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id.toString()
    };
  } catch (error) {
    console.error('Error updating budget:', error);
    throw new Error('Failed to update budget');
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const { db, isConnected } = await connectToDatabase();
    
    if (!isConnected) {
      throw new Error('Cannot delete budget - MongoDB not connected. Using demo mode.');
    }

    const collection = db.collection('budgets');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw new Error('Failed to delete budget');
  }
}