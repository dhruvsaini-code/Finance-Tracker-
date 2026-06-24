import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Sparkles, 
  Calendar,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { transactionService, budgetService, savingsService } from '../services/apiService';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useCurrencyStore } from '../store/currencyStore';

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

export const Dashboard: React.FC = () => {
  const { currencySymbol } = useCurrencyStore();
  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: transactionService.getStats,
    refetchOnWindowFocus: false,
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(),
    refetchOnWindowFocus: false,
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getAll(),
  });

  const { data: savingsGoals } = useQuery({
    queryKey: ['savings'],
    queryFn: savingsService.getAll,
  });

  const { data: aiInsights, isLoading: isAIInsightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: transactionService.getAIInsights,
    refetchOnWindowFocus: false,
  });

  const recentTx = transactions?.slice(0, 5) || [];

  // Prepare Chart Data for Area Chart (Monthly Trends)
  const trendsData = stats?.monthlyTrends 
    ? Object.keys(stats.monthlyTrends).sort().map(month => ({
        month,
        Income: stats.monthlyTrends[month].income,
        Expenses: stats.monthlyTrends[month].expense,
      }))
    : [];

  // Prepare Chart Data for Pie Chart (Category Breakdown)
  const breakdownData = stats?.categoryBreakdown
    ? Object.keys(stats.categoryBreakdown).map(cat => ({
        name: cat,
        value: stats.categoryBreakdown[cat]
      }))
    : [];

  // Progress calculations
  const totalSavingsGoal = savingsGoals?.reduce((acc, goal) => acc + goal.targetAmount, 0) || 0;
  const currentSavingsGoal = savingsGoals?.reduce((acc, goal) => acc + goal.currentAmount, 0) || 0;
  const savingsGoalProgress = totalSavingsGoal > 0 ? (currentSavingsGoal / totalSavingsGoal) * 100 : 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial status, budgets monitoring, and AI recommendations.
          </p>
        </div>

        <Link
          to="/transactions"
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
        >
          <Plus size={14} />
          <span>Add Transaction</span>
        </Link>
      </div>

      {/* Main Stats Summary Cards */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} variant="card" />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Card 1: Total Balance */}
          <motion.div variants={itemVariants}>
            <GlassCard glow className="relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Total Net Worth</span>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    <AnimatedCounter value={stats?.balance || 0} />
                  </h3>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-[10px] text-slate-400">
                <Calendar size={12} className="mr-1" />
                <span>Aggregated live balance</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 2: Total Income */}
          <motion.div variants={itemVariants}>
            <GlassCard glow glowType="success" className="relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Total Inflow</span>
                  <h3 className="text-2xl font-extrabold text-emerald-500 tracking-tight">
                    <AnimatedCounter value={stats?.totalIncome || 0} />
                  </h3>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-[10px] text-emerald-500">
                <span>Earned from all streams</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 3: Total Expenses */}
          <motion.div variants={itemVariants}>
            <GlassCard glow glowType="danger" className="relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Total Outflow</span>
                  <h3 className="text-2xl font-extrabold text-rose-500 tracking-tight">
                    <AnimatedCounter value={stats?.totalExpenses || 0} />
                  </h3>
                </div>
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <TrendingDown size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-[10px] text-rose-500">
                <span>Spent across categories</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 4: Savings Goals Progress */}
          <motion.div variants={itemVariants}>
            <GlassCard glow className="relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Goal Milestones</span>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    <span>{savingsGoalProgress.toFixed(0)}%</span>
                  </h3>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Target size={20} />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(savingsGoalProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>{currencySymbol}{currentSavingsGoal.toLocaleString()} saved</span>
                  <span>{currencySymbol}{totalSavingsGoal.toLocaleString()} goal</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* AI Financial insights Panel */}
      <GlassCard glow className="relative border border-indigo-500/20 dark:border-indigo-500/10 bg-gradient-to-r from-indigo-500/5 to-transparent">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-lg">
            <Sparkles size={16} />
          </div>
          <h2 className="text-sm font-bold">AI Financial Insights & Advice</h2>
        </div>

        {isAIInsightsLoading ? (
          <div className="space-y-2">
            <SkeletonLoader variant="text" className="w-1/3" />
            <SkeletonLoader variant="text" />
            <SkeletonLoader variant="text" className="w-5/6" />
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {aiInsights?.summary}
              </span>
              <span className="text-[10px] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold">
                Savings Rate: {aiInsights?.savingsRate}
              </span>
            </div>

            {/* Warning notes */}
            {aiInsights?.budgetWarnings && aiInsights.budgetWarnings.length > 0 && (
              <div className="space-y-1">
                {aiInsights.budgetWarnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {aiInsights?.recommendations?.map((tip, idx) => (
                <div key={idx} className="bg-slate-100/40 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-xs">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Left) */}
        <GlassCard glow className="lg:col-span-2 flex flex-col h-[350px]">
          <div className="mb-4">
            <h2 className="text-sm font-bold">Income vs Expense Trend</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Historical overview of monthly cash flow dynamics.</p>
          </div>
          <div className="flex-1 w-full text-xs">
            {isStatsLoading ? (
              <SkeletonLoader variant="card" className="h-full" />
            ) : trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
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
                  <Area type="monotone" dataKey="Income" stroke="#10B981" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expenses" stroke="#EF4444" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No financial trends data available yet.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Category Breakdown Pie Chart (Right) */}
        <GlassCard glow className="flex flex-col h-[350px]">
          <div className="mb-4">
            <h2 className="text-sm font-bold">Expenses by Category</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Where your money goes this month.</p>
          </div>
          <div className="flex-1 w-full text-xs flex items-center justify-center">
            {isStatsLoading ? (
              <SkeletonLoader variant="card" className="h-full" />
            ) : breakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                    formatter={(value) => `${currencySymbol}${Number(value).toLocaleString()}`}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400">
                No expense logs recorded yet.
              </div>
            )}
          </div>
        </GlassCard>

      </div>

      {/* Grid: Recent Transactions (Left 2/3) and Budgets Progress (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions List */}
        <GlassCard glow className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold">Recent Transactions</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Your last 5 transaction records.</p>
            </div>
            <Link 
              to="/transactions" 
              className="text-xs text-indigo-500 hover:underline font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isTxLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <SkeletonLoader key={i} variant="text" />)}
              </div>
            ) : recentTx.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200/50 dark:border-slate-800/40">
                    <th className="py-2.5 font-medium">Title</th>
                    <th className="py-2.5 font-medium">Category</th>
                    <th className="py-2.5 font-medium">Date</th>
                    <th className="py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {recentTx.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10">
                      <td className="py-3 font-semibold">{tx.description}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-200/50 dark:bg-slate-800 font-medium capitalize text-slate-600 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className={`py-3 text-right font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400">
                No transactions found. Click "Add Transaction" to create your first record.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Budgets Progress Bar summary */}
        <GlassCard glow>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold">Category Budgets</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Budget status limits for the month.</p>
            </div>
            <Link 
              to="/budgets" 
              className="text-xs text-indigo-500 hover:underline font-semibold"
            >
              Edit
            </Link>
          </div>

          <div className="space-y-4">
            {budgets && budgets.length > 0 ? (
              budgets.slice(0, 4).map((b) => {
                const spent = stats?.categoryBreakdown[b.category] || 0;
                const percent = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
                const isOver = spent > b.limitAmount;
                return (
                  <div key={b._id} className="space-y-1.5 text-left">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold capitalize">{b.category}</span>
                      <span className={`font-bold ${isOver ? 'text-rose-500' : 'text-slate-400'}`}>
                        {currencySymbol}{spent.toFixed(0)} / {currencySymbol}{b.limitAmount.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active budgets set for this month. Set budget limits under the Budgets tab.
              </div>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default Dashboard;
