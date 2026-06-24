const { useThemeStore } = require('../../store/themeStore');
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Coins, 
  TrendingUp, 
  User, 
  Sun, 
  Moon, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useThemeStore as useTheme } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const { logout } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = [
    { name: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/') },
    { name: 'View Transactions', icon: ArrowLeftRight, action: () => navigate('/transactions') },
    { name: 'Manage Budgets', icon: PieChart, action: () => navigate('/budgets') },
    { name: 'Track Savings Goals', icon: Coins, action: () => navigate('/savings') },
    { name: 'View Financial Analytics', icon: TrendingUp, action: () => navigate('/analytics') },
    { name: 'View AI Wealth Insights', icon: Sparkles, action: () => navigate('/ai-insights') },
    { name: 'View Profile Settings', icon: User, action: () => navigate('/settings') },
    { name: `Toggle Theme (Current: ${theme})`, icon: theme === 'dark' ? Sun : Moon, action: () => toggleTheme() },
    { name: 'Log Out of Application', icon: LogOut, action: () => { logout(); navigate('/login'); } },
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Handle keyboard shortcuts inside palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          handleItemClick(filteredItems[activeIndex].action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, activeIndex]);

  // Scroll active item into view if list is long
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/80 glass-card bg-white dark:bg-slate-900 flex flex-col max-h-[50vh] transition-transform duration-200 scale-100">
        {/* Search Input bar */}
        <div className="flex items-center space-x-3 px-4 border-b border-slate-200/60 dark:border-slate-800/60 h-12">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Type a command or page name..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm placeholder-slate-400 py-2 text-slate-800 dark:text-slate-100"
          />
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[9px] bg-slate-50 dark:bg-slate-950 text-slate-400 font-sans shadow-sm font-semibold">
              ↓↑ Navigate
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[9px] bg-slate-50 dark:bg-slate-950 text-slate-400 font-sans shadow-sm font-semibold">
              ESC
            </kbd>
          </span>
        </div>

        {/* Command list results */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  data-active={isActive}
                  onClick={() => handleItemClick(item.action)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-left rounded-xl transition-all duration-150 text-xs font-semibold cursor-pointer group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <kbd className="px-1.5 py-0.5 rounded bg-indigo-700/80 text-[8px] text-white">
                      Enter
                    </kbd>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No results found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
