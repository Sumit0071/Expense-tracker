import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '@/lib/transaction-db';
import { Transaction } from '@/models/Transaction';

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('API Error - GET transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.date || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate amount is a positive number
    if (isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }
    
    // Validate type
    if (!['income', 'expense'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }
    
    const transaction = await addTransaction({
      amount: Number(body.amount),
      date: body.date,
      description: body.description.trim(),
      type: body.type,
    });
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('API Error - POST transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}