import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-slate-100/10 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl backdrop-blur-sm">
      <div className="p-3 bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 rounded-full mb-3">
        <Icon size={24} className="animate-pulse" />
      </div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-[11px] text-slate-400 max-w-[240px] mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
