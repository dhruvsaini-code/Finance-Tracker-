export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  notes?: string;
  createdAt?: string;
}

export interface Budget {
  _id: string;
  category: string;
  limitAmount: number;
  month: string; // YYYY-MM
  createdAt?: string;
}

export interface SavingsGoal {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  desiredDate?: string;
  createdAt?: string;
}

export interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  categoryBreakdown: { [key: string]: number };
  monthlyTrends: {
    [key: string]: {
      income: number;
      expense: number;
    };
  };
}

export interface AIInsights {
  summary: string;
  savingsRate: string;
  budgetWarnings: string[];
  recommendations: string[];
}
