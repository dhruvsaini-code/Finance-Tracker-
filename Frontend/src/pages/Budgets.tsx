import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, X, AlertTriangle, AlertCircle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { budgetService, transactionService } from '../services/apiService';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useCurrencyStore } from '../store/currencyStore';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limitAmount: z.preprocess(
    (val) => Number(val),
    z.number().positive('Limit must be a positive number')
  ),
  month: z.string().min(1, 'Month is required').regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format')
});

type BudgetFormFields = z.infer<typeof budgetSchema>;

const CATEGORIES = [
  'Housing', 'Utilities', 'Groceries', 'Dining Out', 
  'Transport', 'Entertainment', 'Shopping', 'Healthcare', 'Other'
];

export const Budgets: React.FC = () => {
  const { currencySymbol } = useCurrencyStore();
  const queryClient = useQueryClient();
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Template States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('50-30-20');
  const [templateIncome, setTemplateIncome] = useState('4000');
  const [selectedTemplateMonth, setSelectedTemplateMonth] = useState(currentMonthStr);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  // Queries
  const { data: budgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['budgets', selectedMonth],
    queryFn: () => budgetService.getAll(selectedMonth)
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: transactionService.getStats
  });

  // Mutations
  const upsertMutation = useMutation({
    mutationFn: budgetService.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Budget cap updated successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => toast.error(err.message || 'Error updating budget limit')
  });

  const deleteMutation = useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Budget constraint deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Error deleting budget limit')
  });

  // Forms
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetFormFields>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: currentMonthStr
    }
  });

  const onSubmitForm = (data: BudgetFormFields) => {
    upsertMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget limit?')) {
      deleteMutation.mutate(id);
    }
  };

  // Calculations
  const activeSpendBreakdown = stats?.categoryBreakdown || {};
  const totalLimit = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (activeSpendBreakdown[b.category] || 0), 0);
  const remainingTotal = totalLimit - totalSpent;

  const applyTemplate = async () => {
    setIsApplyingTemplate(true);
    try {
      const allocations: Record<string, number> = {};
      const income = Number(templateIncome) || 4000;
      
      if (selectedTemplate === '50-30-20') {
        allocations['Housing'] = Math.round(income * 0.25);
        allocations['Utilities'] = Math.round(income * 0.08);
        allocations['Groceries'] = Math.round(income * 0.12);
        allocations['Transport'] = Math.round(income * 0.05);
        allocations['Dining Out'] = Math.round(income * 0.10);
        allocations['Entertainment'] = Math.round(income * 0.08);
        allocations['Shopping'] = Math.round(income * 0.07);
        allocations['Other'] = Math.round(income * 0.05);
      } else if (selectedTemplate === '70-20-10') {
        allocations['Housing'] = Math.round(income * 0.35);
        allocations['Utilities'] = Math.round(income * 0.10);
        allocations['Groceries'] = Math.round(income * 0.15);
        allocations['Transport'] = Math.round(income * 0.05);
        allocations['Healthcare'] = Math.round(income * 0.05);
        allocations['Dining Out'] = Math.round(income * 0.05);
        allocations['Entertainment'] = Math.round(income * 0.03);
        allocations['Shopping'] = Math.round(income * 0.02);
      } else { // balanced
        allocations['Housing'] = Math.round(income * 0.12);
        allocations['Utilities'] = Math.round(income * 0.08);
        allocations['Groceries'] = Math.round(income * 0.10);
        allocations['Dining Out'] = Math.round(income * 0.08);
        allocations['Transport'] = Math.round(income * 0.08);
        allocations['Entertainment'] = Math.round(income * 0.08);
        allocations['Shopping'] = Math.round(income * 0.08);
        allocations['Healthcare'] = Math.round(income * 0.08);
        allocations['Other'] = Math.round(income * 0.10);
      }
      
      const promises = Object.entries(allocations).map(([category, amount]) => {
        return budgetService.upsert({
          category,
          limitAmount: amount,
          month: selectedTemplateMonth
        });
      });
      
      await Promise.all(promises);
      
      toast.success('Budget template applied successfully!');
      queryClient.invalidateQueries({ queryKey: ['budgets', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      setIsTemplateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error applying budget template');
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Category Budgets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Establish monthly spend caps for each category to control outflows.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Month selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs font-semibold outline-none w-1/2 sm:w-auto cursor-pointer"
          />
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all w-1/2 sm:w-auto cursor-pointer border border-slate-200 dark:border-slate-850"
          >
            <span>Apply Template</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all w-1/2 sm:w-auto cursor-pointer"
          >
            <Plus size={14} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard glow className="text-left">
          <span className="text-xs font-semibold text-slate-400">Total Budget Limit</span>
          <h3 className="text-2xl font-extrabold mt-1 text-slate-700 dark:text-slate-100">
            {currencySymbol}{totalLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </GlassCard>
        
        <GlassCard glow className="text-left">
          <span className="text-xs font-semibold text-slate-400">Total Budget Spent</span>
          <h3 className="text-2xl font-extrabold mt-1 text-rose-500">
            {currencySymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </GlassCard>

        <GlassCard glow className="text-left">
          <span className="text-xs font-semibold text-slate-400">Remaining Cushion</span>
          <h3 className={`text-2xl font-extrabold mt-1 ${remainingTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {currencySymbol}{remainingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </GlassCard>
      </div>

      {/* Main Budget Progress Lists */}
      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="space-y-6">
          <div className="text-left">
            <h2 className="text-sm font-bold">Category Limits Tracker</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time status of your category spending against set budgets.</p>
          </div>

          {isBudgetsLoading || isStatsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <SkeletonLoader key={i} variant="text" />)}
            </div>
          ) : budgets.length > 0 ? (
            <div className="divide-y divide-slate-150 dark:divide-slate-800/40">
              {budgets.map((b) => {
                const spent = activeSpendBreakdown[b.category] || 0;
                const percent = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
                const isOver = spent > b.limitAmount;
                const isWarning = !isOver && percent >= 80;
                
                const r = 14;
                const stroke = 3;
                const circ = 2 * Math.PI * r;
                const offset = circ - (Math.min(percent, 100) / 100) * circ;

                return (
                  <div key={b._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Metadata & Status Progress Ring */}
                    <div className="flex items-center space-x-3 text-left md:w-1/4">
                      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle cx="20" cy="20" r={r} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth={stroke} fill="transparent" />
                          <circle cx="20" cy="20" r={r} className={`transition-all duration-500 ${isOver ? 'stroke-rose-500' : isWarning ? 'stroke-amber-500' : 'stroke-indigo-500'}`} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" />
                        </svg>
                        <div className="absolute text-[8px] font-bold">
                          {percent.toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs capitalize">{b.category}</h4>
                        <span className="text-[9px] text-slate-400">Budget for {b.month}</span>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-medium text-slate-400">
                        <span>{percent.toFixed(0)}% Utilized</span>
                        <span>
                          {currencySymbol}{spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} spent / {currencySymbol}{b.limitAmount.toLocaleString()} limit
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver 
                              ? 'bg-rose-500' 
                              : isWarning 
                                ? 'bg-amber-500' 
                                : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Remaining Cushion & Actions */}
                    <div className="flex items-center justify-between md:justify-end md:space-x-8 md:w-1/4">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-slate-400">Status</p>
                        <p className={`text-xs font-bold ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {isOver 
                            ? `Over by ${currencySymbol}${(spent - b.limitAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
                            : `${currencySymbol}${(b.limitAmount - spent).toLocaleString(undefined, { maximumFractionDigits: 0 })} left`
                          }
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete budget limit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No budgets established for {selectedMonth} yet. Click "Set Budget" to assign limits.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Set budget limits dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold">Set Category Budget</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              
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

              {/* Limit amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Limit Amount ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="500"
                  {...register('limitAmount')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.limitAmount && <p className="text-red-500 text-[10px] mt-0.5">{errors.limitAmount.message}</p>}
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Month</label>
                <input
                  type="month"
                  {...register('month')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                />
                {errors.month && <p className="text-red-500 text-[10px] mt-0.5">{errors.month.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Save Budget Limit
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Apply budget templates dialog */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold">Apply Budget Template</h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Rule Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Budgeting Method</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/55 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="50-30-20">50/30/20 Rule (Needs/Wants/Savings)</option>
                  <option value="70-20-10">70/20/10 Rule (Frugal/Invest-heavy)</option>
                  <option value="balanced">Balanced Split (Even Distributions)</option>
                </select>
              </div>

              {/* Monthly Net Income */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Monthly Net Income ({currencySymbol})</label>
                <input
                  type="number"
                  value={templateIncome}
                  onChange={(e) => setTemplateIncome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/55 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                  placeholder="4000"
                />
              </div>

              {/* Target Month */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Target Month</label>
                <input
                  type="month"
                  value={selectedTemplateMonth}
                  onChange={(e) => setSelectedTemplateMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/55 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                />
              </div>

              {/* Description box */}
              <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {selectedTemplate === '50-30-20' ? (
                  <span>
                    <strong>50/30/20 Rule:</strong> Allocates <strong>50%</strong> of income for needs (Housing, Utilities, Groceries, Transport) and <strong>30%</strong> for wants (Dining, Entertainment, Shopping). The remaining 20% represents your savings target.
                  </span>
                ) : selectedTemplate === '70-20-10' ? (
                  <span>
                    <strong>70/20/10 Rule:</strong> Allocates <strong>70%</strong> for living expenses (Housing, Utilities, Food) and <strong>10%</strong> for discretionary spending, leaving <strong>20%</strong> for savings and goals.
                  </span>
                ) : (
                  <span>
                    <strong>Balanced split:</strong> Distributes a balanced budget of <strong>80%</strong> of your income evenly across all standard categories, leaving 20% as net savings room.
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={applyTemplate}
                disabled={isApplyingTemplate}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex justify-center items-center"
              >
                {isApplyingTemplate ? 'Applying...' : 'Apply Template to Month'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Budgets;
