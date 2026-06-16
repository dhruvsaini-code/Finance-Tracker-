import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Coins, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  Menu, 
  X,
  Sparkles,
  Command
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onOpenCommandPalette: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onOpenCommandPalette }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, initializeTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Savings', path: '/savings', icon: Coins },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'AI Insights', path: '/ai-insights', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex text-slate-800 bg-[#F8FAFC] dark:text-slate-100 dark:bg-[#0B1220] transition-colors duration-300 overflow-x-hidden relative">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '-5s' }}></div>

      {/* Sidebar Desktop */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 transition-transform -translate-x-full md:translate-x-0 border-r border-slate-200/60 dark:border-slate-800/60 glass-card ${
        theme === 'dark' ? 'glass-card-dark' : 'glass-card-light'
      } ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
              F
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
              FinanceSaaS
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'text-white bg-indigo-600 shadow-md shadow-indigo-500/25 active-tab-glow'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer User */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-sm">
              {user?.username?.substring(0, 2) || 'US'}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.username}</span>
              <span className="text-xs text-slate-400 truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main frame container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative z-10">
        
        {/* Topbar Header */}
        <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-30 border-b border-slate-200/40 dark:border-slate-800/40 backdrop-blur-md bg-white/75 dark:bg-[#0B1220]/75`}>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            <button 
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-sm w-64 text-left"
            >
              <Search size={16} />
              <span className="flex-1">Search dashboard...</span>
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] bg-white dark:bg-slate-900 flex items-center gap-0.5">
                <Command size={10} />K
              </kbd>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={onOpenCommandPalette}
              className="sm:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Search size={20} />
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
              </button>

              {isNotificationOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 glass-card py-2 ${
                  theme === 'dark' ? 'glass-card-dark' : 'glass-card-light'
                }`}>
                  <div className="px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center">
                    <span className="font-semibold text-sm">Notifications</span>
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-medium">New</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                    <div className="p-4 text-xs hover:bg-slate-100/30 dark:hover:bg-slate-800/20 text-left">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">Budget Limit Warning</p>
                      <p className="text-slate-400 mt-1">You have spent 85% of your Dinning category budget for this month.</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">10 mins ago</span>
                    </div>
                    <div className="p-4 text-xs hover:bg-slate-100/30 dark:hover:bg-slate-800/20 text-left">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">AI Spending Insight Available</p>
                      <p className="text-slate-400 mt-1">Your monthly savings report has been generated. View smart recommendations.</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all shadow-sm"
              >
                {user?.username?.substring(0, 2) || 'US'}
              </button>
              
              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 glass-card py-1.5 ${
                  theme === 'dark' ? 'glass-card-dark' : 'glass-card-light'
                }`}>
                  <div className="px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/60 text-left">
                    <p className="font-semibold text-xs truncate">{user?.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-left w-full text-slate-600 dark:text-slate-300"
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-red-500/10 text-red-500 hover:text-red-600 text-left w-full"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>

    </div>
  );
};
export default DashboardLayout;
