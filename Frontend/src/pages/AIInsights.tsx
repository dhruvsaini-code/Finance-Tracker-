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
  ArrowRight,
  TrendingUp as TrendIcon,
  ShieldAlert,
  CalendarDays,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { transactionService } from '../services/apiService';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useCurrencyStore } from '../store/currencyStore';

export const AIInsights: React.FC = () => {
  const { currencySymbol } = useCurrencyStore();
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: transactionService.getAIInsights,
    refetchOnWindowFocus: false,
  });

  const score = insightsData?.score || 0;
  const savingsRate = insightsData?.savingsRate || '0%';
  const budgetCompliance = insightsData?.budgetCompliance || '100%';
  const recommendations = insightsData?.recommendations || [];
  const warnings = insightsData?.budgetWarnings || [];
  const anomalies = insightsData?.anomalies || [];
  const goalPredictions = insightsData?.goalPredictions || [];
  const forecast = insightsData?.forecast || { projectedIncome: 0, projectedExpense: 0, projectedNet: 0, chartData: [] };

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGrade = (val: number) => {
    if (val >= 90) return { text: 'A+', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (val >= 80) return { text: 'B', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10' };
    if (val >= 70) return { text: 'C+', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { text: 'D', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const grade = getGrade(score);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          AI Wealth Insights
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Smart spending audits, dynamic wellness grades, automated anomaly checks, and future cash flow projections.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader variant="card" className="h-[360px]" />
          <SkeletonLoader variant="card" className="lg:col-span-2 h-[360px]" />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Financial Health Score (Left) */}
            <GlassCard className="flex flex-col items-center justify-between p-6 text-center h-[360px] border border-indigo-500/15">
              <div className="text-left w-full">
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <Activity size={16} className="text-indigo-500" />
                  <span>Financial Health Score</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Weighted metrics score of savings, budgets, and milestones.</p>
              </div>

              <div className="relative flex justify-center items-center my-4">
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
              </div>

              <div className="grid grid-cols-2 gap-2 w-full text-left text-xs border-t border-slate-150 dark:border-slate-800/60 pt-3">
                <div>
                  <span className="text-[9px] text-slate-450 block font-semibold uppercase">Savings Rate</span>
                  <span className="font-extrabold text-indigo-500">{savingsRate}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block font-semibold uppercase">Budget Compliance</span>
                  <span className="font-extrabold text-emerald-500">{budgetCompliance}</span>
                </div>
              </div>
            </GlassCard>

            {/* Smart Cash Flow Forecast Extrapolations (Right 2/3) */}
            <GlassCard className="lg:col-span-2 flex flex-col justify-between h-[360px]">
              <div className="text-left">
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span>3-Month Predictive Forecasts</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Projected financials extrapolating income and cost trends.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                {/* Projected Income */}
                <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-left relative overflow-hidden group">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Projected Income</span>
                  <h4 className="text-lg font-extrabold text-emerald-500 mt-1">
                    +{currencySymbol}{forecast.projectedIncome.toLocaleString()}
                  </h4>
                  <p className="text-[8px] text-slate-400 mt-1">Next month salary estimate</p>
                  <TrendingUp size={48} className="absolute bottom-[-10px] right-[-10px] text-emerald-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
                </div>

                {/* Projected Expense */}
                <div className="bg-slate-100/40 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-left relative overflow-hidden group">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Projected Outflows</span>
                  <h4 className="text-lg font-extrabold text-rose-500 mt-1">
                    -{currencySymbol}{forecast.projectedExpense.toLocaleString()}
                  </h4>
                  <p className="text-[8px] text-slate-400 mt-1">Expected utility & cost caps</p>
                  <TrendingDown size={48} className="absolute bottom-[-10px] right-[-10px] text-rose-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
                </div>

                {/* Projected Net Savings */}
                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/15 text-left relative overflow-hidden group">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Net Monthly Surplus</span>
                  <h4 className="text-lg font-extrabold text-indigo-500 dark:text-indigo-400 mt-1">
                    +{currencySymbol}{forecast.projectedNet.toLocaleString()}
                  </h4>
                  <p className="text-[8px] text-slate-400 mt-1">Estimated added wealth size</p>
                  <Sparkles size={48} className="absolute bottom-[-10px] right-[-10px] text-indigo-500/5 group-hover:scale-110 transition-transform pointer-events-none" />
                </div>
              </div>

              <div className="bg-indigo-500/5 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/15 flex items-center justify-between text-left">
                <div className="text-xs">
                  <span className="font-semibold block text-slate-700 dark:text-slate-200">AI Summary Profile</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{insightsData?.summary}</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Forecasting Trend Line Chart */}
          {forecast.chartData && forecast.chartData.length > 0 && (
            <GlassCard className="h-[300px] flex flex-col">
              <div className="text-left mb-3">
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <TrendIcon size={16} className="text-indigo-500" />
                  <span>Interactive Cash Flow Projection Graph</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Historical ledger data compared with 3 months of predictive AI projections (marked by vertical reference boundary).</p>
              </div>
              <div className="flex-1 w-full text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
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
                    <Legend iconSize={8} />
                    <ReferenceLine x={forecast.chartData.find((d: any) => d.type === 'forecast')?.month} stroke="#6366F1" strokeDasharray="3 3" label={{ value: 'Prediction Start', fill: '#6366F1', fontSize: 10, position: 'insideTopLeft' }} />
                    <Area type="monotone" name="Inflow" dataKey="Income" stroke="#10B981" fillOpacity={1} fill="url(#incForecast)" strokeWidth={2} />
                    <Area type="monotone" name="Outflow" dataKey="Expenses" stroke="#EF4444" fillOpacity={1} fill="url(#expForecast)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Anomalies & Goal Milestones Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Spending Anomaly Detection */}
            <GlassCard className="space-y-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldAlert size={16} className="text-rose-500" />
                  <span>Spending Anomaly Detection</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Isolated expenses that significantly exceed category averages.</p>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {anomalies.length > 0 ? (
                  anomalies.map((a: any, idx: number) => (
                    <div key={idx} className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl flex justify-between items-start text-xs hover:border-rose-500/25 transition-all">
                      <div className="space-y-1">
                        <span className="font-semibold block text-slate-700 dark:text-slate-200 capitalize">{a.description}</span>
                        <span className="text-[9px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold">
                          {a.deviationTimes}x standard category average
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">Typical {a.category} item cost is around {currencySymbol}{a.average}.</p>
                      </div>
                      <span className="font-extrabold text-rose-500 text-sm">-{currencySymbol}{a.amount.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-450 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No suspicious spending anomalies detected this period.
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Savings Goal Achievement timelines */}
            <GlassCard className="space-y-4">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <Target size={16} className="text-emerald-500" />
                  <span>Savings Target Projections</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Projected completion dates calculated via net monthly savings rate.</p>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {goalPredictions.length > 0 ? (
                  goalPredictions.map((gp: any, idx: number) => {
                    const isAtRisk = gp.status === 'Delayed' || gp.status === 'At Risk';
                    return (
                      <div key={idx} className={`p-3 rounded-xl border flex flex-col text-xs space-y-2 ${
                        gp.status === 'Completed'
                          ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/25'
                          : isAtRisk
                          ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/25'
                          : 'bg-slate-100/40 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 hover:border-indigo-500/20'
                      } transition-all`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{gp.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            gp.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : isAtRisk
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                              : 'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {gp.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed">{gp.advice}</p>
                        {gp.projectedDate && (
                          <div className="flex items-center space-x-1 text-[9px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                            <CalendarDays size={10} />
                            <span>Estimated Finish: {new Date(gp.projectedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-450 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No active savings goals found. Set up goal targets to enable projections.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Bottom Alerts & Recommendations List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <GlassCard className="lg:col-span-2 space-y-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <Lightbulb size={16} className="text-indigo-500" />
                  <span>Strategic Advice Recommendations</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Personalized operational suggestions based on cash flow audits.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {recommendations.map((tip: string, idx: number) => (
                  <div key={idx} className="bg-slate-100/30 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-[11px] leading-relaxed text-slate-650 dark:text-slate-300">
                    {tip}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="space-y-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-indigo-500" />
                  <span>Active Budget Warnings</span>
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Threshold triggers for category overruns.</p>
              </div>
              <div className="space-y-2">
                {warnings.map((w: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2 text-[11px] text-amber-500 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIInsights;
