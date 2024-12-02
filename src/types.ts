export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  isPlanned: boolean;
};

export type Theme = 'light' | 'dark';