'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyExpense } from '@/types/transaction';
import { formatCurrency } from '@/lib/chart-utils';
import { BarChart3, TrendingDown } from 'lucide-react';

interface MonthlyExpensesChartProps {
  data: MonthlyExpense[];
}

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);
  const averageExpenses = totalExpenses / data.length;
  const maxExpense = Math.max(...data.map(item => item.amount));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-red-600">
            Expenses: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Monthly Expenses
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span>Total: {formatCurrency(totalExpenses)}</span>
          </div>
          <div>Average: {formatCurrency(averageExpenses)}</div>
          <div>Peak: {formatCurrency(maxExpense)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}