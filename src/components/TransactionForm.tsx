import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

type Props = {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate?: (transaction: Transaction) => void;
  onCancel?: () => void;
  transaction?: Transaction | null;
};

const categories = [
  'Salary',
  'Investments',
  'Housing',
  'Utilities',
  'Food',
  'Transport',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Insurance',
  'Bills',
  'Other'
];

export function TransactionForm({ onAdd, onUpdate, onCancel, transaction }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPlanned, setIsPlanned] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setType(transaction.amount >= 0 ? 'income' : 'expense');
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(transaction.date);
      setIsPlanned(transaction.isPlanned);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const today = new Date();
    const selectedDate = new Date(date);
    const isInFuture = selectedDate > today;

    if (isInFuture && !isPlanned) {
      setIsPlanned(true);
    }

    const transactionData = {
      amount: Number(amount) * (type === 'expense' ? -1 : 1),
      type,
      category,
      description,
      date,
      isPlanned: isPlanned || isInFuture
    };

    if (transaction && onUpdate) {
      onUpdate({ ...transactionData, id: transaction.id });
      toast.success('Transaction updated successfully');
    } else {
      onAdd(transactionData);
      toast.success('Transaction added successfully');
    }

    if (!transaction) {
      setAmount('');
      setDescription('');
      setIsPlanned(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount (CZK)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="0"
            required
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter description"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPlanned"
          checked={isPlanned}
          onChange={(e) => setIsPlanned(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPlanned" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Mark as planned transaction
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {transaction ? <Save size={20} /> : <PlusCircle size={20} />}
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </button>
        
        {transaction && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <X size={20} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}