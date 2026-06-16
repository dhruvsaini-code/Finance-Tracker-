import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, Sparkles, HelpCircle, Activity } from 'lucide-react';
import { transactionService } from '../services/apiService';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export const Analytics: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: transactionService.getStats,
    refetchOnWindowFocus: false,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(),
  });

  // 1. Prepare Trends Chart Data
  const barChartData = stats?.monthlyTrends
    ? Object.keys(stats.monthlyTrends).sort().map(month => ({
        month,
        Income: stats.monthlyTrends[month].income,
        Expenses: stats.monthlyTrends[month].expense,
        Net: stats.monthlyTrends[month].income - stats.monthlyTrends[month].expense
      }))
    : [];

  // 2. Extrapolate Next Month Forecast
  const incomeValues = barChartData.map(d => d.Income);
  const expenseValues = barChartData.map(d => d.Expenses);
  
  const avgIncome = incomeValues.length > 0 ? incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length : 0;
  const avgExpense = expenseValues.length > 0 ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length : 0;
  
  const forecastIncome = avgIncome * 1.05; // assume a light 5% growth
  const forecastExpense = avgExpense * 0.96; // assume a light 4% cost cutting
  const forecastNet = forecastIncome - forecastExpense;

  // 3. Build Weekday Activity Matrix (Spending Heatmap)
  // 7 days (columns) x 4 slots (rows) or simple 7 weekdays representation
  const weekdaySpend = Array(7).fill(0);
  const weekdayCounts = Array(7).fill(0);
  
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const day = new Date(t.date).getDay(); // 0 (Sunday) to 6 (Saturday)
      weekdaySpend[day] += t.amount;
      weekdayCounts[day] += 1;
    }
  });

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const maxSpend = Math.max(...weekdaySpend) || 1;

  // Get intensity classes for the heatmap cells
  const getDensityClass = (val: number) => {
    if (val === 0) return 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800/80';
    const ratio = val / maxSpend;
    if (ratio < 0.25) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
    if (ratio < 0.5) return 'bg-indigo-500/40 text-indigo-300 border-indigo-500/35';
    if (ratio < 0.75) return 'bg-indigo-500/70 text-white border-indigo-500/60';
    return 'bg-indigo-600 text-white border-indigo-600';
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          Financial Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep dive into comparative metrics, forecast predictions, and spending density heatmaps.
        </p>
      </div>

      {/* Grid: Trends Chart & Forecast Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart (Left 2/3) */}
        <GlassCard className="lg:col-span-2 h-[350px] flex flex-col">
          <div className="mb-4 text-left">
            <h2 className="text-sm font-bold">Monthly Cash Flow Breakdown</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Comparative bar mapping of inflows vs outflows.</p>
          </div>
          <div className="flex-1 w-full text-xs">
            {isLoading ? (
              <SkeletonLoader variant="card" className="h-full" />
            ) : barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No comparative data available yet.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Predictive Forecasting Engine (Right 1/3) */}
        <GlassCard className="flex flex-col justify-between border border-indigo-500/10">
          <div className="text-left">
            <div className="flex items-center space-x-1.5 mb-1">
              <Sparkles size={16} className="text-indigo-500" />
              <h2 className="text-sm font-bold">Smart Cash Flow Forecast</h2>
            </div>
            <p className="text-[9px] text-slate-400">Next month predictions calculated using linear average projection filters.</p>
          </div>

          {isLoading ? (
            <div className="space-y-4 my-6">
              {[1, 2, 3].map(i => <SkeletonLoader key={i} variant="text" />)}
            </div>
          ) : (
            <div className="space-y-4 my-4 text-left">
              
              {/* Forecast Income */}
              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Projected Inflow</span>
                  <span className="text-sm font-bold text-emerald-500">+${forecastIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">+5.0% Est</span>
              </div>

              {/* Forecast Expense */}
              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Projected Outflow</span>
                  <span className="text-sm font-bold text-rose-500">-${forecastExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <span className="text-[8px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">-4.0% Est</span>
              </div>

              {/* Forecast Net Surplus */}
              <div className="flex justify-between items-center bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Estimated Surplus</span>
                  <span className={`text-base font-extrabold ${forecastNet >= 0 ? 'text-indigo-500 dark:text-indigo-400' : 'text-rose-500'}`}>
                    ${forecastNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <TrendingUp size={20} className="text-indigo-500" />
              </div>

            </div>
          )}

          <div className="text-[9px] text-slate-400 flex items-start space-x-1 border-t border-slate-150 dark:border-slate-800/60 pt-3 text-left">
            <HelpCircle size={12} className="shrink-0 mt-0.5 text-slate-500" />
            <span>Estimates are diagnostic approximations and do not guarantee future savings results. Optimize spending to exceed targets.</span>
          </div>
        </GlassCard>

      </div>

      {/* Weekday Spending Heatmap Density board */}
      <GlassCard className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h2 className="text-sm font-bold flex items-center space-x-1.5">
              <Activity size={16} className="text-indigo-500" />
              <span>Spending Activity Intensity Heatmap</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Average density distribution of expense transactions across days of the week.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonLoader key={i} variant="card" className="h-20" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {weekdays.map((day, idx) => {
              const spent = weekdaySpend[idx];
              const count = weekdayCounts[idx];
              return (
                <div 
                  key={day} 
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-300 h-24 hover-glow ${getDensityClass(spent)}`}
                >
                  <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">{day.substring(0, 3)}</span>
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold block">
                      ${spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[8px] opacity-75 block">
                      {count} expense{count === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end space-x-1.5 text-[9px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/40">
          <span>Less spent</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80"></div>
          <div className="w-2.5 h-2.5 rounded bg-indigo-500/20 border border-indigo-500/20"></div>
          <div className="w-2.5 h-2.5 rounded bg-indigo-500/40 border border-indigo-500/35"></div>
          <div className="w-2.5 h-2.5 rounded bg-indigo-500/70 border border-indigo-500/60"></div>
          <div className="w-2.5 h-2.5 rounded bg-indigo-600 border border-indigo-600"></div>
          <span>More spent</span>
        </div>
      </GlassCard>

    </div>
  );
};
export default Analytics;
