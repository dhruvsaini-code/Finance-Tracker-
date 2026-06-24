import apiClient from '../api/apiClient';
import type { User, Transaction, Budget, SavingsGoal, DashboardStats, AIInsights } from '../types';

// Auth API calls
export const authService = {
  register: async (data: { username: string; email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  }
};

// Transactions API calls
export const transactionService = {
  getAll: async (params?: { type?: string; category?: string; search?: string; startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<{ success: boolean; count: number; data: Transaction[] }>('/transactions', { params });
    return res.data.data;
  },
  create: async (data: Omit<Transaction, '_id' | 'createdAt'>) => {
    const res = await apiClient.post<{ success: boolean; data: Transaction }>('/transactions', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Transaction>) => {
    const res = await apiClient.put<{ success: boolean; data: Transaction }>(`/transactions/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; data: {} }>(`/transactions/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await apiClient.get<{ success: boolean; stats: DashboardStats }>('/transactions/stats');
    return res.data.stats;
  },
  getAIInsights: async () => {
    const res = await apiClient.get<{ success: boolean; insights: AIInsights }>('/transactions/ai-insights');
    return res.data.insights;
  },
  getRecurring: async () => {
    const res = await apiClient.get<{ success: boolean; count: number; data: any[] }>('/transactions/recurring');
    return res.data.data;
  },
  createRecurring: async (data: { amount: number; description: string; category: string; type: string; frequency: string; startDate?: string; tags?: string[]; notes?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: any }>('/transactions/recurring', data);
    return res.data.data;
  },
  updateRecurring: async (id: string, data: any) => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/transactions/recurring/${id}`, data);
    return res.data.data;
  },
  deleteRecurring: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; data: {} }>(`/transactions/recurring/${id}`);
    return res.data;
  }
};

// Budgets API calls
export const budgetService = {
  getAll: async (month?: string) => {
    const res = await apiClient.get<{ success: boolean; count: number; data: Budget[] }>('/budgets', { params: { month } });
    return res.data.data;
  },
  upsert: async (data: { category: string; limitAmount: number; month: string }) => {
    const res = await apiClient.post<{ success: boolean; data: Budget }>('/budgets', data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; data: {} }>(`/budgets/${id}`);
    return res.data;
  }
};

// Savings Goals API calls
export const savingsService = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; count: number; data: SavingsGoal[] }>('/savings');
    return res.data.data;
  },
  create: async (data: { title: string; targetAmount: number; currentAmount?: number; desiredDate?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: SavingsGoal }>('/savings', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<SavingsGoal>) => {
    const res = await apiClient.put<{ success: boolean; data: SavingsGoal }>(`/savings/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; data: {} }>(`/savings/${id}`);
    return res.data;
  }
};
