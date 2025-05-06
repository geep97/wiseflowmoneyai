
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string;
  type: 'income' | 'expense';
}

export type TransactionCategory = 
  | 'food'
  | 'housing'
  | 'transportation'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'shopping'
  | 'personal'
  | 'education'
  | 'travel'
  | 'income'
  | 'savings'
  | 'investments'
  | 'other';

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AIInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement';
  message: string;
  date: string;
  read: boolean;
}
