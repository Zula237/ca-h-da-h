import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Transaction } from '../types';
import { format, addMonths, startOfMonth, endOfMonth, isFuture, isPast } from 'date-fns';

type Props = {
  transactions: Transaction[];
};

export function Dashboard({ transactions }: Props) {
  const [viewRange, setViewRange] = useState<'3m' | '6m'>('3m');

  const currentDate = new Date();
  const monthsBack = viewRange === '3m' ? 1 : 3;
  const monthsForward = viewRange === '3m' ? 2 : 3;
  
  const startDate = startOfMonth(addMonths(currentDate, -monthsBack));
  const endDate = endOfMonth(addMonths(currentDate, monthsForward));

  const actualBalance = transactions
    .filter(t => !t.isPlanned && isPast(new Date(t.date)))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const projectedBalance = transactions
    .filter(t => isFuture(new Date(t.date)) || t.isPlanned)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => !t.isPlanned && isPast(new Date(t.date)) && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => !t.isPlanned && isPast(new Date(t.date)) && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyData = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .reduce((acc: Record<string, { 
      income: number; 
      expenses: number; 
      plannedIncome: number; 
      plannedExpenses: number;
      balance: number;
      isProjected: boolean;
    }>, t) => {
      const month = format(new Date(t.date), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { 
          income: 0, 
          expenses: 0, 
          plannedIncome: 0, 
          plannedExpenses: 0,
          balance: 0,
          isProjected: isFuture(new Date(t.date))
        };
      }
      
      if (t.amount > 0) {
        if (t.isPlanned) {
          acc[month].plannedIncome += t.amount;
        } else {
          acc[month].income += t.amount;
        }
      } else {
        if (t.isPlanned) {
          acc[month].plannedExpenses += Math.abs(t.amount);
        } else {
          acc[month].expenses += Math.abs(t.amount);
        }
      }
      
      acc[month].balance += t.amount;
      return acc;
    }, {});

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
    netCashflow: data.income + data.plannedIncome - data.expenses - data.plannedExpenses
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Current Balance</h3>
          <p className={`text-2xl font-bold ${actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {actualBalance.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Projected Balance</h3>
          <p className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(actualBalance + projectedBalance).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Actual Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {totalIncome.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Actual Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {totalExpenses.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Cash Flow Forecast</h3>
          <select
            value={viewRange}
            onChange={(e) => setViewRange(e.target.value as '3m' | '6m')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="3m">3 months forecast</option>
            <option value="6m">6 months forecast</option>
          </select>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#666' }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => 
                  value.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })
                }
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" />
              <Bar dataKey="income" stackId="a" fill="#10B981" name="Actual Income" />
              <Bar dataKey="plannedIncome" stackId="a" fill="#93C5FD" name="Planned Income" />
              <Bar dataKey="expenses" stackId="b" fill="#EF4444" name="Actual Expenses" />
              <Bar dataKey="plannedExpenses" stackId="b" fill="#FCA5A5" name="Planned Expenses" />
              <Bar dataKey="netCashflow" fill="#6366F1" name="Net Cashflow" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}