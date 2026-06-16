import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, X, Target, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { savingsService } from '../services/apiService';
import type { SavingsGoal } from '../types';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const savingsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  targetAmount: z.preprocess(
    (val) => Number(val),
    z.number().positive('Target must be positive')
  ),
  currentAmount: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, 'Current progress must be at least 0')
  ).optional(),
  desiredDate: z.string().optional()
});

type SavingsFormFields = z.infer<typeof savingsSchema>;

export const Savings: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [addedAmount, setAddedAmount] = useState('');

  // Queries
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: savingsService.getAll
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: savingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Savings goal created successfully!');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => toast.error(err.message || 'Error creating savings goal')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavingsGoal> }) => 
      savingsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Savings progress updated!');
      setIsProgressModalOpen(false);
      setAddedAmount('');
    },
    onError: (err: any) => toast.error(err.message || 'Error updating progress')
  });

  const deleteMutation = useMutation({
    mutationFn: savingsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('Savings goal deleted successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Error deleting goal')
  });

  // Forms
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingsFormFields>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      currentAmount: 0,
      desiredDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10) // default 1 year from now
    }
  });

  const onSubmitForm = (data: SavingsFormFields) => {
    createMutation.mutate({
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      desiredDate: data.desiredDate || undefined
    });
  };

  const handleAddSavings = () => {
    if (!activeGoal) return;
    const addition = Number(addedAmount);
    if (isNaN(addition) || addition <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const updatedCurrent = activeGoal.currentAmount + addition;
    updateMutation.mutate({
      id: activeGoal._id,
      data: { currentAmount: updatedCurrent }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Savings Goals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Establish, manage, and contribute to your future milestone savings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Grid of goals */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonLoader key={i} variant="card" className="h-[250px]" />)}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const percent = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const isFinished = percent >= 100;
            
            // Animated progress ring details
            const radius = 50;
            const strokeWidth = 8;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

            return (
              <GlassCard key={g._id} glow className="flex flex-col h-[280px] justify-between relative group">
                
                {/* Upper Details */}
                <div className="flex justify-between items-start text-left">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base truncate max-w-[140px] capitalize">{g.title}</h3>
                    <p className="text-[10px] text-slate-400 flex items-center">
                      <Calendar size={10} className="mr-1" />
                      {g.desiredDate 
                        ? `Target: ${new Date(g.desiredDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`
                        : 'No deadline set'
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(g._id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete goal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Progress Indicators (SVG Progress Ring) */}
                <div className="flex justify-center items-center my-4 relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    {/* Background track circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Colored progress circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-indigo-600 transition-all duration-500 ease-out"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  {/* Center Text Indicator */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-bold">{percent.toFixed(0)}%</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider">Saved</span>
                  </div>
                </div>

                {/* Lower Figures & Quick Add Progress Button */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end text-xs">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 block">Current</span>
                      <span className="font-bold">${g.currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block">Target</span>
                      <span className="font-semibold text-slate-500">${g.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveGoal(g); setIsProgressModalOpen(true); }}
                    className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isFinished
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 cursor-pointer'
                    }`}
                  >
                    {isFinished ? 'Completed Goal!' : 'Contribute Savings'}
                  </button>
                </div>

              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white/30 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Target size={36} className="mx-auto mb-3 text-slate-350 dark:text-slate-700" />
          <h3 className="font-semibold text-sm">No savings goals established yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Establish a target fund, input deadlines, and contribute monthly to automate saving for major events.
          </p>
        </div>
      )}

      {/* New savings target dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold">Create Savings Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="Emergency fund, Travel trip..."
                  {...register('title')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.title && <p className="text-red-500 text-[10px] mt-0.5">{errors.title.message}</p>}
              </div>

              {/* Target & Current */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    {...register('targetAmount')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                  {errors.targetAmount && <p className="text-red-500 text-[10px] mt-0.5">{errors.targetAmount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Saved ($)</label>
                  <input
                    type="number"
                    placeholder="500"
                    {...register('currentAmount')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Date</label>
                <input
                  type="date"
                  {...register('desiredDate')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Create Goal Target
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Progress contribution dialog */}
      {isProgressModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm" onClick={() => setIsProgressModalOpen(false)}></div>
          
          <div className="relative w-full max-w-xs rounded-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold truncate pr-4">Add to "{activeGoal.title}"</h3>
              <button onClick={() => setIsProgressModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Amount to Save ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="250"
                    value={addedAmount}
                    onChange={(e) => setAddedAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSavings}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <TrendingUp size={14} />
                <span>Save Funds</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Savings;
