import React, { useState, useRef } from 'react';
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
import { useCurrencyStore } from '../store/currencyStore';

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(150, 'Description too long'),
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currencySymbol } = useCurrencyStore();
  
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

  // Tabs State
  const [activeTab, setActiveTab] = useState<'all' | 'recurring'>('all');

  // Recurring transactions states
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recDescription, setRecDescription] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recCategory, setRecCategory] = useState('');
  const [recType, setRecType] = useState('expense');
  const [recFrequency, setRecFrequency] = useState('monthly');
  const [recStartDate, setRecStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [recNotes, setRecNotes] = useState('');

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

  // React Query Fetch for Recurring Transactions
  const { data: recurring = [], isLoading: isRecurringLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: transactionService.getRecurring,
    enabled: activeTab === 'recurring'
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

  // React Query Mutations for Recurring
  const createRecurringMutation = useMutation({
    mutationFn: transactionService.createRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring transaction scheduled successfully!');
      closeRecurringModal();
    },
    onError: (err: any) => toast.error(err.message || 'Error scheduling recurring transaction')
  });

  const updateRecurringMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      transactionService.updateRecurring(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring entry status updated!');
    },
    onError: (err: any) => toast.error(err.message || 'Error updating status')
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: transactionService.deleteRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring transaction deleted successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Error deleting recurring item')
  });

  const handleCreateRecurring = () => {
    if (!recDescription || !recAmount || !recCategory) {
      toast.error('Please specify description, amount and category');
      return;
    }
    const amt = Number(recAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }
    createRecurringMutation.mutate({
      description: recDescription,
      amount: amt,
      category: recCategory,
      type: recType,
      frequency: recFrequency,
      startDate: recStartDate,
      notes: recNotes
    });
  };

  const toggleRecurringActive = (id: string, currentActive: boolean) => {
    updateRecurringMutation.mutate({ id, data: { isActive: !currentActive } });
  };

  const handleDeleteRecurring = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring scheduler entry?')) {
      deleteRecurringMutation.mutate(id);
    }
  };

  const closeRecurringModal = () => {
    setIsRecurringModalOpen(false);
    setRecDescription('');
    setRecAmount('');
    setRecCategory('');
    setRecType('expense');
    setRecFrequency('monthly');
    setRecStartDate(new Date().toISOString().substring(0, 10));
    setRecNotes('');
  };

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
      description: '',
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
    setValue('description', tx.description);
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

  // CSV Import parser logic
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          toast.error('CSV file has no data rows.');
          return;
        }

        // Header alignment checks
        const headers = lines[0].toLowerCase().split(',');
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('title') || h.includes('item'));
        const amtIdx = headers.findIndex(h => h.includes('amount') || h.includes('val') || h.includes('cost'));
        const typeIdx = headers.findIndex(h => h.includes('type'));
        const catIdx = headers.findIndex(h => h.includes('cat'));
        const dateIdx = headers.findIndex(h => h.includes('date'));
        const notesIdx = headers.findIndex(h => h.includes('note'));

        if (descIdx === -1 || amtIdx === -1) {
          toast.error('Invalid columns. "Description" and "Amount" headers are required.');
          return;
        }

        const list = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(field => field.replace(/^"|"$/g, '').trim());
          if (row.length < 2) continue;

          const description = row[descIdx];
          const amount = parseFloat(row[amtIdx]);
          const type = typeIdx !== -1 && row[typeIdx].toLowerCase() === 'income' ? 'income' : 'expense';
          const category = catIdx !== -1 && row[catIdx] ? row[catIdx] : 'Other';
          const date = dateIdx !== -1 && !isNaN(Date.parse(row[dateIdx])) ? new Date(row[dateIdx]).toISOString() : new Date().toISOString();
          const notes = notesIdx !== -1 ? row[notesIdx] : '';

          if (!description || isNaN(amount)) continue;
          list.push({ description, amount, type, category, date, notes });
        }

        if (list.length === 0) {
          toast.error('No valid transactions parsed.');
          return;
        }

        let imported = 0;
        for (const item of list) {
          await createMutation.mutateAsync(item);
          imported++;
        }
        toast.success(`Successfully imported ${imported} transactions!`);
      } catch (err: any) {
        toast.error(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export CSV logic
  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = ['Description,Amount,Type,Category,Date,Notes\n'];
    const rows = transactions.map(t => 
      `"${t.description.replace(/"/g, '""')}",${t.amount},${t.type},"${t.category}",${new Date(t.date).toISOString().substring(0, 10)},"${(t.notes || '').replace(/"/g, '""')}"`
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

  // Export PDF Statement logic
  const exportToPDF = () => {
    if (transactions.length === 0) {
      toast.error('No transaction ledger data to export.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked! Enable popups to print statements.');
      return;
    }

    const rowsHTML = transactions.map(t => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${t.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(t.date).toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${t.type}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: ${t.type === 'income' ? '#10B981' : '#EF4444'}">
          ${t.type === 'income' ? '+' : '-'}${currencySymbol}${t.amount.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Finance Tracker - Financial Statement</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 30px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 12px; }
            th { text-align: left; background-color: #f8fafc; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #475569; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; }
            .summary { margin-top: 40px; display: flex; justify-content: flex-end; gap: 15px; }
            .summary-box { border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 12px; background: #f8fafc; min-width: 130px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; color: #6366f1; font-size: 24px;">FinanceSaaS</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Ledger Statement - Generated ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #0f172a; font-size: 14px;">Account Activity Report</h3>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Transaction Count: ${transactions.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-box">
              <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Income</span>
              <h3 style="margin: 4px 0 0 0; color: #10B981; font-size: 16px;">+${currencySymbol}${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div class="summary-box">
              <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Expenses</span>
              <h3 style="margin: 4px 0 0 0; color: #EF4444; font-size: 16px;">-${currencySymbol}${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <div class="summary-box" style="border-color: #c7d2fe; background: #e0e7ff;">
              <span style="font-size: 9px; color: #4f46e5; text-transform: uppercase; font-weight: 700;">Net Balance</span>
              <h3 style="margin: 4px 0 0 0; color: #4338ca; font-size: 18px;">${currencySymbol}${(totalIncome - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {activeTab === 'all' ? (
            <>
              {/* Hidden input for CSV imports */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCSVImport}
                accept=".csv"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 rounded-xl text-xs font-semibold hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Import CSV</span>
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 rounded-xl text-xs font-semibold hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button
                onClick={exportToPDF}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 rounded-xl text-xs font-semibold hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
              
              <button
                onClick={openAddModal}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>New Record</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsRecurringModalOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Schedule Recurring</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/60 pb-px">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Ledger Transactions
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`pb-2.5 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'recurring'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Recurring Scheduler
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
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
                  <th className="py-3 font-semibold px-4">Description</th>
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
                    <td className="py-3 px-4 font-semibold">{tx.description}</td>
                    <td className={`py-3 px-4 font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
      </>
      ) : (
        /* Recurring Scheduler View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {isRecurringLoading ? (
            [1, 2, 3].map(i => <SkeletonLoader key={i} variant="card" className="h-[180px]" />)
          ) : recurring.length > 0 ? (
            recurring.map((item: any) => {
              return (
                <GlassCard key={item._id} className="p-5 flex flex-col justify-between h-[180px] relative border border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 capitalize">{item.description}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-semibold text-indigo-500">{item.frequency} schedule</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      item.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {item.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </div>

                  <div className="my-3">
                    <span className={`text-lg font-black ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.type === 'income' ? '+' : '-'}{currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {item.nextOccurrence && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Next: {new Date(item.nextOccurrence).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-450">Active</span>
                      <button
                        onClick={() => toggleRecurringActive(item._id, item.isActive)}
                        className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                          item.isActive ? 'bg-indigo-600' : 'bg-slate-350 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.25 transition-all shadow-sm ${
                            item.isActive ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteRecurring(item._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete schedule"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </GlassCard>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white/30 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <h3 className="font-semibold text-sm">No recurring schedules set up</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Schedule repeating outflows (subscriptions, utility bills) or inflows (salary, dividends) to auto-post details.
              </p>
            </div>
          )}
        </div>
      )}

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

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Grocery bill, Salary paycheck..."
                  {...register('description')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.description && <p className="text-red-500 text-[10px] mt-0.5">{errors.description.message}</p>}
              </div>

              {/* Grid: Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Amount ({currencySymbol})</label>
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

      {/* Schedule Recurring Modal */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm" onClick={closeRecurringModal}></div>
          
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold">Schedule Recurring Transaction</h3>
              <button onClick={closeRecurringModal} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRecType('expense')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    recType === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setRecType('income')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    recType === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Netflix, rent, paycheck..."
                  value={recDescription}
                  onChange={(e) => setRecDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Amount, Date & Frequency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="14.99"
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Frequency</label>
                  <select
                    value={recFrequency}
                    onChange={(e) => setRecFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={recStartDate}
                    onChange={(e) => setRecStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                <select
                  value={recCategory}
                  onChange={(e) => setRecCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="Shared subscription plan..."
                  rows={2}
                  value={recNotes}
                  onChange={(e) => setRecNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors resize-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateRecurring}
                disabled={createRecurringMutation.isPending}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{createRecurringMutation.isPending ? 'Scheduling...' : 'Schedule Recurring'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Transactions;
