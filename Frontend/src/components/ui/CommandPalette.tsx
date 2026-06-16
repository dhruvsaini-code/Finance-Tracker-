import React, { useState, useEffect } from 'react';
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
  LogOut 
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useThemeStore();
  const { logout } = useAuthStore();
  const [search, setSearch] = useState('');

  // Close command palette on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const items = [
    { name: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/') },
    { name: 'View Transactions', icon: ArrowLeftRight, action: () => navigate('/transactions') },
    { name: 'Manage Budgets', icon: PieChart, action: () => navigate('/budgets') },
    { name: 'Track Savings Goals', icon: Coins, action: () => navigate('/savings') },
    { name: 'View Financial Analytics', icon: TrendingUp, action: () => navigate('/analytics') },
    { name: 'View Profile Settings', icon: User, action: () => navigate('/profile') },
    { name: `Toggle Theme (Current: ${theme})`, icon: theme === 'dark' ? Sun : Moon, action: () => toggleTheme() },
    { name: 'Log Out of Application', icon: LogOut, action: () => { logout(); navigate('/login'); } },
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 glass-card bg-white dark:bg-slate-900 flex flex-col max-h-[50vh]">
        {/* Search Bar */}
        <div className="flex items-center space-x-3 px-4 border-b border-slate-200/60 dark:border-slate-800/60 h-12">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Type a command or page name..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm placeholder-slate-400 py-2"
          />
          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item.action)}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left rounded-xl hover:bg-indigo-600 hover:text-white transition-colors text-sm group"
                >
                  <Icon size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No results found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
