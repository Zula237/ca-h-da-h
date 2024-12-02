import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Clock, Edit2 } from 'lucide-react';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  filter: string;
};

export function TransactionList({ transactions, onDelete, onEdit, filter }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredTransactions = transactions
    .filter(t => 
      t.description.toLowerCase().includes(filter.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
      toast.success('Transaction deleted successfully');
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No transactions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-center">Status</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr 
              key={transaction.id}
              className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                transaction.isPlanned ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <td className="px-4 py-2">
                {format(new Date(transaction.date), 'dd.MM.yyyy')}
              </td>
              <td className="px-4 py-2">{transaction.description}</td>
              <td className="px-4 py-2">{transaction.category}</td>
              <td className={`px-4 py-2 text-right ${
                transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.amount.toLocaleString('cs-CZ', {
                  style: 'currency',
                  currency: 'CZK'
                })}
              </td>
              <td className="px-4 py-2 text-center">
                {transaction.isPlanned && (
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Clock size={16} />
                    Planned
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit transaction"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className={`transition-colors ${
                      deleteConfirm === transaction.id
                        ? 'text-red-500 animate-pulse'
                        : 'text-red-600 hover:text-red-800'
                    }`}
                    title={deleteConfirm === transaction.id ? 'Click again to confirm' : 'Delete transaction'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}