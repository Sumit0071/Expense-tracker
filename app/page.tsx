'use client';

import { useState, useEffect } from 'react';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { MonthlyExpensesChart } from '@/components/monthly-expenses-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransactionAPI, 
  deleteTransactionAPI 
} from '@/lib/api-client';
import { getMonthlyExpenses } from '@/lib/chart-utils';
import { 
  Wallet, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Receipt,
  Database
} from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const loadedTransactions = await fetchTransactions();
      setTransactions(loadedTransactions);
      setIsConnected(true);
      showNotification('success', 'Connected to MongoDB successfully!');
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setIsConnected(false);
      showNotification('error', 'Failed to connect to database. Please check your MongoDB connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTransaction = async (formData: TransactionFormData) => {
    try {
      const newTransaction = await createTransaction(formData);
      setTransactions([newTransaction, ...transactions]);
      showNotification('success', 'Transaction added successfully!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to add transaction');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTransaction = async (formData: TransactionFormData) => {
    if (!editingTransaction) return;

    try {
      const updatedTransaction = await updateTransactionAPI(editingTransaction.id, formData);
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? updatedTransaction : t
      ));
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      showNotification('success', 'Transaction updated successfully!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    if (window.confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
      try {
        await deleteTransactionAPI(id);
        setTransactions(transactions.filter(t => t.id !== id));
        showNotification('success', 'Transaction deleted successfully!');
      } catch (error) {
        showNotification('error', error instanceof Error ? error.message : 'Failed to delete transaction');
      }
    }
  };

  const monthlyExpenses = getMonthlyExpenses(transactions);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Personal Finance</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className={`h-4 w-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
                {/* <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'MongoDB Connected' : 'Database Error'}
                </span> */}
              </div>
              <div className="text-sm text-gray-600">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className={`${notification.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Track Your Finances</h2>
            <p className="text-gray-600">Monitor your income and expenses with beautiful visualizations</p>
          </div>

          {/* Database Connection Alert */}
          {!isConnected && (
            <Alert className="border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Unable to connect to MongoDB. Please check your database configuration in .env.local
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={loadTransactions}
                >
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Transactions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MonthlyExpensesChart data={monthlyExpenses} />
              <TransactionList
                transactions={transactions.slice(0, 5)}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>

            <TabsContent value="add">
              <TransactionForm onSubmit={handleAddTransaction} />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionList
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}