import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { transactionService } from '../services/apiService';
import type { Transaction } from '../types';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive('Amount must be positive')
  ),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional()
});

type TransactionFormFields = z.infer<typeof transactionSchema>;

const CATEGORIES = [
  'Housing', 'Utilities', 'Groceries', 'Dining Out', 
  'Transport', 'Entertainment', 'Shopping', 'Healthcare',
  'Salary', 'Investments', 'Freelance', 'Other'
];

export const Transactions: React.FC = () => {
  const queryClient = useQueryClient();
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // React Query Fetch
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', filterType, filterCategory, search, startDate, endDate],
    queryFn: () => transactionService.getAll({
      type: filterType || undefined,
      category: filterCategory || undefined,
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })
  });

  // React Query Mutations
  const createMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Transaction created successfully!');
      closeModal();
    },
    onError: (err: any) => toast.error(err.message || 'Error creating transaction')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Transaction> }) => 
      transactionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Transaction updated successfully!');
      closeModal();
    },
    onError: (err: any) => toast.error(err.message || 'Error updating transaction')
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Error deleting transaction')
  });

  // Forms
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TransactionFormFields>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().substring(0, 10),
      notes: ''
    }
  });

  // Open modal for adding
  const openAddModal = () => {
    setEditingTx(null);
    reset({
      title: '',
      amount: undefined,
      category: '',
      type: 'expense',
      date: new Date().toISOString().substring(0, 10),
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setValue('title', tx.title);
    setValue('amount', tx.amount);
    setValue('category', tx.category);
    setValue('type', tx.type);
    setValue('date', new Date(tx.date).toISOString().substring(0, 10));
    setValue('notes', tx.notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  const onSubmitForm = (data: TransactionFormFields) => {
    if (editingTx) {
      updateMutation.mutate({ id: editingTx._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  // Sort and Paginate
  const sortedTransactions = [...transactions].sort((a, b) => {
    let valueA = sortField === 'date' ? new Date(a.date).getTime() : a.amount;
    let valueB = sortField === 'date' ? new Date(b.date).getTime() : b.amount;
    
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTx = sortedTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export CSV logic
  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = ['Title,Amount,Type,Category,Date,Notes\n'];
    const rows = transactions.map(t => 
      `"${t.title.replace(/"/g, '""')}",${t.amount},${t.type},"${t.category}",${new Date(t.date).toISOString().substring(0, 10)},"${(t.notes || '').replace(/"/g, '""')}"`
    );

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Transactions History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, search, sort, and export your transaction records.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 rounded-xl text-xs font-semibold hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-colors w-1/2 sm:w-auto cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all w-1/2 sm:w-auto cursor-pointer"
          >
            <Plus size={14} />
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:flex md:items-center">
          
          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:border-indigo-500 transition-colors capitalize cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:border-indigo-500 transition-colors capitalize cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {/* Start Date */}
          <input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          />

          {/* End Date */}
          <input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          />
        </div>
      </GlassCard>

      {/* Main Table Card */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <SkeletonLoader key={i} variant="text" />)}
            </div>
          ) : paginatedTx.length > 0 ? (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200/50 dark:border-slate-800/40">
                  <th className="py-3 font-semibold px-4">Title</th>
                  <th className="py-3 font-semibold px-4">
                    <button onClick={() => toggleSort('amount')} className="flex items-center space-x-1 hover:text-indigo-500 transition-colors">
                      <span>Amount</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 font-semibold px-4">Type</th>
                  <th className="py-3 font-semibold px-4">Category</th>
                  <th className="py-3 font-semibold px-4">
                    <button onClick={() => toggleSort('date')} className="flex items-center space-x-1 hover:text-indigo-500 transition-colors">
                      <span>Date</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 font-semibold px-4">Notes</th>
                  <th className="py-3 font-semibold px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {paginatedTx.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                    <td className="py-3 px-4 font-semibold">{tx.title}</td>
                    <td className={`py-3 px-4 font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        tx.type === 'income' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className="bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[150px] truncate" title={tx.notes || ''}>
                      {tx.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-slate-400">
              No transactions match your search/filter criteria.
            </div>
          )}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center text-xs">
            <span className="text-slate-400">
              Showing page {page} of {totalPages} ({transactions.length} total records)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1 rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1 rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* CRUD Add/Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm" onClick={closeModal}></div>
          
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold">
                {editingTx ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setValue('type', 'expense')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    register('type').value === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setValue('type', 'income')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    register('type').value === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Grocery bill, Salary paycheck..."
                  {...register('title')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.title && <p className="text-red-500 text-[10px] mt-0.5">{errors.title.message}</p>}
              </div>

              {/* Grid: Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25.50"
                    {...register('amount')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                  {errors.amount && <p className="text-red-500 text-[10px] mt-0.5">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  />
                  {errors.date && <p className="text-red-500 text-[10px] mt-0.5">{errors.date.message}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-[10px] mt-0.5">{errors.category.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="Add details about transaction..."
                  rows={2}
                  {...register('notes')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Save Transaction</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Transactions;
