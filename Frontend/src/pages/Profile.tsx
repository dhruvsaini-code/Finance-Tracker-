import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  // Notification configs (simulated state)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [budgetWarnings, setBudgetWarnings] = useState(true);
  const [insightAlerts, setInsightAlerts] = useState(false);

  const handleSavePreferences = () => {
    toast.success('Notification preferences updated successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          User Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal details, visual themes, and alert channel configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Card Details (Left 1/3) */}
        <GlassCard className="flex flex-col items-center p-8 space-y-6 lg:col-span-1 h-fit">
          {/* Avatar sphere */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-3xl uppercase shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/20">
            {user?.username?.substring(0, 2) || 'US'}
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-lg capitalize">{user?.username}</h3>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>

          <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-800/60 space-y-4 text-left">
            {/* Username row */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400"><User size={16} /></span>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">User Username</span>
                <span className="font-semibold">{user?.username}</span>
              </div>
            </div>

            {/* Email row */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400"><Mail size={16} /></span>
              <div className="overflow-hidden">
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Email Address</span>
                <span className="font-semibold truncate block">{user?.email}</span>
              </div>
            </div>

            {/* Access status */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-emerald-500"><ShieldCheck size={16} /></span>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Account Protection</span>
                <span className="font-semibold text-emerald-500">JWT Authorized (Verified)</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Configurations Forms (Right 2/3) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* Theme card */}
          <GlassCard className="space-y-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
                <span>Visual Theme Theme Options</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Change application layouts and color variables.</p>
            </div>

            <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
              <div className="text-xs">
                <p className="font-semibold">Dark / Light Interface</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Toggle interface variables between dark and light themes.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Switch Theme (Current: {theme})
              </button>
            </div>
          </GlassCard>

          {/* Preferences Alerts configurations */}
          <GlassCard className="space-y-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <Bell size={16} className="text-indigo-500" />
                <span>Notification Alert Preferences</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Enable or disable alert reminders across messaging channels.</p>
            </div>

            <div className="space-y-4">
              
              {/* Email alerts */}
              <div className="flex items-center justify-between py-2.5">
                <div className="text-xs flex items-center space-x-3">
                  <Mail size={16} className="text-slate-400" />
                  <div>
                    <p className="font-semibold">Weekly Report Summaries</p>
                    <p className="text-slate-400 text-[10px]">Receive spending reports and AI assessments via email.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-800 cursor-pointer"
                />
              </div>

              {/* Budget alerts */}
              <div className="flex items-center justify-between py-2.5 border-t border-slate-100 dark:border-slate-800/60">
                <div className="text-xs flex items-center space-x-3">
                  <Smartphone size={16} className="text-slate-400" />
                  <div>
                    <p className="font-semibold">Budget Exceeded Push Warnings</p>
                    <p className="text-slate-400 text-[10px]">Receive screen warnings when categories exceed 80% or 100% budget limit caps.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={budgetWarnings}
                  onChange={(e) => setBudgetWarnings(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-800 cursor-pointer"
                />
              </div>

              {/* AI Insight updates */}
              <div className="flex items-center justify-between py-2.5 border-t border-slate-100 dark:border-slate-800/60">
                <div className="text-xs flex items-center space-x-3">
                  <Sparkles size={16} className="text-slate-400" />
                  <div>
                    <p className="font-semibold">Simulated Financial Advisory Tips</p>
                    <p className="text-slate-400 text-[10px]">Receive notifications when the advisor identifies saving optimization tips.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={insightAlerts}
                  onChange={(e) => setInsightAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-800 cursor-pointer"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 text-right">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Save Alert Settings
              </button>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
export default Profile;
