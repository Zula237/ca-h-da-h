import React, { useState, useEffect } from 'react';
import { Sun, Moon, Download } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Transaction, Theme } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setLoading(false);
  }, [theme]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions([
      ...transactions,
      { ...newTransaction, id: crypto.randomUUID() }
    ]);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleExport = () => {
    const data = JSON.stringify(transactions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Dashboard
          </h1>
          
          <div className="flex gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Export Data
            </button>
            
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <Dashboard transactions={transactions} />
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <TransactionForm 
              onAdd={handleAddTransaction}
              onUpdate={handleUpdateTransaction}
              transaction={editingTransaction}
              onCancel={() => setEditingTransaction(null)}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <input
                type="text"
                placeholder="Search transactions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <TransactionList
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              onEdit={setEditingTransaction}
              filter={filter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;