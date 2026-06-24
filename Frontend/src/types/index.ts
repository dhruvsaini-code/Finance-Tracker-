export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  description: string;
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
  score: number;
  summary: string;
  savingsRate: string;
  budgetCompliance: string;
  budgetWarnings: string[];
  recommendations: string[];
  anomalies?: {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    average: number;
    deviationTimes: string;
  }[];
  goalPredictions?: {
    goalId: string;
    title: string;
    status: 'Completed' | 'On Track' | 'Delayed' | 'At Risk';
    projectedMonths: number;
    projectedDate: string | null;
    advice: string;
  }[];
  forecast?: {
    projectedIncome: number;
    projectedExpense: number;
    projectedNet: number;
    chartData: {
      month: string;
      Income: number;
      Expenses: number;
      type: 'historical' | 'forecast';
    }[];
  };
}
