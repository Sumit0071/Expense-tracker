import { NextRequest, NextResponse } from 'next/server';
import { updateTransaction, deleteTransaction } from '@/lib/transaction-db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate amount if provided
    if (body.amount !== undefined && (isNaN(body.amount) || body.amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }
    
    // Validate type if provided
    if (body.type && !['income', 'expense'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }
    
    const updates: any = {};
    if (body.amount !== undefined) updates.amount = Number(body.amount);
    if (body.date) updates.date = body.date;
    if (body.description) updates.description = body.description.trim();
    if (body.type) updates.type = body.type;
    
    const transaction = await updateTransaction(id, updates);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('API Error - PUT transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const success = await deleteTransaction(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('API Error - DELETE transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}