import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  HelpCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { transactionService } from '../services/apiService';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export const AIInsights: React.FC = () => {
  // Fetch AI insights from the backend (which includes forecast details)
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: transactionService.getAIInsights,
    refetchOnWindowFocus: false,
  });

  const score = insightsData?.score || 0;
  const savingsRate = insightsData?.savingsRate || '0%';
  const recommendations = insightsData?.recommendations || [];
  const warnings = insightsData?.budgetWarnings || [];
  
  // Forecast values from backend payload
  const forecast = insightsData?.forecast || { projectedIncome: 0, projectedExpense: 0, projectedNet: 0 };

  // Easing function for score circular gauge
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Grade indicator
  const getGrade = (val: number) => {
    if (val >= 90) return { text: 'A+', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (val >= 80) return { text: 'B', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10' };
    if (val >= 70) return { text: 'C+', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { text: 'D', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const grade = getGrade(score);

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          AI Wealth Insights
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Smart cost audits, dynamic financial wellness scoring, and forecasting calculations.
        </p>
      </div>

      {/* Grid: Financial Wellness & Next-Month Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Circular Financial Health Score Gauge (Left 1/3) */}
        <GlassCard className="flex flex-col items-center justify-between p-8 text-center h-[360px] relative border border-indigo-500/15">
          <div className="text-left w-full">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Activity size={16} className="text-indigo-500" />
              <span>Financial Health Grade</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Weighted metrics score of savings, budgets, and milestones.</p>
          </div>

          <div className="relative flex justify-center items-center my-6">
            {isLoading ? (
              <SkeletonLoader variant="circle" className="w-32 h-32" />
            ) : (
              <>
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-3xl font-extrabold tracking-tighter ${grade.color}`}>
                    {grade.text}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Score: {score}/100
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-left border-t border-slate-150 dark:border-slate-800/60 pt-3 w-full">
            Your financial health rating evaluates whether your savings rate exceeds the 20% mark and if active budgets are maintained.
          </div>
        </GlassCard>

        {/* Forecast predictions card (Right 2/3) */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between h-[360px]">
          <div className="text-left">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-500" />
              <span>Next-Month Extrapolations</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">AI projected ledger items based on historical trends.</p>
          </div>

          {isLoading ? (
            <div className="space-y-4 my-6">
              {[1, 2, 3].map(i => <SkeletonLoader key={i} variant="text" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              
              {/* Projected income */}
              <div className="bg-slate-100/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-left relative overflow-hidden group">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Projected Income</span>
                <h4 className="text-xl font-extrabold text-emerald-500 mt-2">
                  +${forecast.projectedIncome.toLocaleString()}
                </h4>
                <p className="text-[8px] text-slate-400 mt-1">Extrapolated salary & freelancer cash flow</p>
                <TrendingUp size={48} className="absolute bottom-[-10px] right-[-10px] text-emerald-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
              </div>

              {/* Projected Expense */}
              <div className="bg-slate-100/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-left relative overflow-hidden group">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Projected Expenses</span>
                <h4 className="text-xl font-extrabold text-rose-500 mt-2">
                  -${forecast.projectedExpense.toLocaleString()}
                </h4>
                <p className="text-[8px] text-slate-400 mt-1">Expected categories billings caps</p>
                <TrendingDown size={48} className="absolute bottom-[-10px] right-[-10px] text-rose-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
              </div>

              {/* Projected Net savings */}
              <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/15 text-left relative overflow-hidden group">
                <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Net Surplus Savings</span>
                <h4 className="text-xl font-extrabold text-indigo-500 dark:text-indigo-400 mt-2">
                  +${forecast.projectedNet.toLocaleString()}
                </h4>
                <p className="text-[8px] text-slate-400 mt-1">Estimated added wealth growth</p>
                <Sparkles size={48} className="absolute bottom-[-10px] right-[-10px] text-indigo-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
              </div>

            </div>
          )}

          <div className="bg-slate-100/40 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-left">
            <div className="text-xs">
              <span className="font-semibold block">Saving Rate Target Assessment</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Your extrapolated savings rate this month is forecasted to hit {savingsRate}.</span>
            </div>
            <ArrowRight size={16} className="text-indigo-500 hidden sm:block" />
          </div>
        </GlassCard>

      </div>

      {/* Grid: Recommendations & active warning notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Optimization recommendations (Left 2/3) */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Lightbulb size={16} className="text-indigo-500" />
              <span>Smart Recommendations</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Target actions generated by your current budget compliance and savings speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              [1, 2].map(i => <SkeletonLoader key={i} variant="card" />)
            ) : recommendations.length > 0 ? (
              recommendations.map((tip, idx) => (
                <div key={idx} className="bg-slate-100/30 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-xs">
                  {tip}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-slate-450 py-6 text-xs">
                No active recommendations. Keep adding transactions!
              </div>
            )}
          </div>
        </GlassCard>

        {/* Alerts & budget warnings (Right 1/3) */}
        <GlassCard className="space-y-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-indigo-500" />
              <span>Active Budget Alerts</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Warnings for active categories overruns.</p>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1, 2].map(i => <SkeletonLoader key={i} variant="text" />)
            ) : warnings.length > 0 ? (
              warnings.map((warn, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-amber-500 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-450 py-8 text-xs">
                No budget limits warning triggers recorded. Great discipline!
              </div>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default AIInsights;
