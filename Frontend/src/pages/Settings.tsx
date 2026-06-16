import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'theme'>('profile');

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification configs
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [budgetWarnings, setBudgetWarnings] = useState(true);
  const [insightAlerts, setInsightAlerts] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    
    // Simulate successful password update
    toast.success('Security password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust profile details, passwords, notifications channels, and theme preferences.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
        
        {/* Navigation Sidebar (Left 1/4) */}
        <div className="lg:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
            }`}
          >
            Profile Information
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
            }`}
          >
            Security & Password
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
            }`}
          >
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'theme'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
            }`}
          >
            Theme Preference
          </button>
        </div>

        {/* Configurations Forms (Right 3/4) */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <GlassCard className="space-y-6">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <User size={16} className="text-indigo-500" />
                  <span>Profile Information</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Your personal credentials metadata.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:space-x-6 gap-4 py-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl uppercase shadow-md shadow-indigo-500/25 ring-4 ring-indigo-500/20">
                  {user?.username?.substring(0, 2) || 'US'}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="font-bold text-base capitalize">{user?.username}</h4>
                  <span className="text-xs text-slate-450">{user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-6">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      disabled
                      value={user?.username || ''}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/15 flex items-center space-x-2 text-xs text-emerald-500">
                <ShieldCheck size={18} className="shrink-0" />
                <span>Authorization protection active. Session secured via rotating JSON Web Tokens (JWT).</span>
              </div>
            </GlassCard>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <GlassCard className="space-y-6">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Lock size={16} className="text-indigo-500" />
                  <span>Change Password</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Ensure your account is protected with a strong password.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                
                {/* Old password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-xs outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Update Security Credentials
                </button>

              </form>
            </GlassCard>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <GlassCard className="space-y-6">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Bell size={16} className="text-indigo-500" />
                  <span>Notification Toggles</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle alert channels and reminders configurations.</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 space-y-4">
                
                {/* Email alerts */}
                <div className="flex items-center justify-between pt-4 first:pt-0">
                  <div className="text-xs">
                    <p className="font-semibold">Weekly Inflow/Outflow Summaries</p>
                    <p className="text-slate-450 text-[10px] mt-0.5">Send a weekly breakdown report to your verified email address.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-800 cursor-pointer"
                  />
                </div>

                {/* Budget limit alerts */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-xs">
                    <p className="font-semibold">Budget Breach Push Warnings</p>
                    <p className="text-slate-450 text-[10px] mt-0.5">Get visual overlay notifications on the dashboard when spending exceeds limits.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={budgetWarnings}
                    onChange={(e) => setBudgetWarnings(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-800 cursor-pointer"
                  />
                </div>

                {/* AI advice */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-xs">
                    <p className="font-semibold">Weekly AI Advisory Tips</p>
                    <p className="text-slate-450 text-[10px] mt-0.5">Send savings optimizations suggestions immediately when recalculated by the AI engine.</p>
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
                  type="button"
                  onClick={handleSaveNotifications}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Save Alert Options
                </button>
              </div>
            </GlassCard>
          )}

          {/* TAB 4: THEME */}
          {activeTab === 'theme' && (
            <GlassCard className="space-y-6">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
                  <span>Visual Theme options</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Control layout styling theme variables.</p>
              </div>

              <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <div className="text-xs">
                  <p className="font-semibold">Toggle Theme Mode</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Choose between light and dark glassmorphic dashboard modes.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Switch Theme (Current: {theme})
                </button>
              </div>
            </GlassCard>
          )}

        </div>
      </div>

    </div>
  );
};
export default Settings;
