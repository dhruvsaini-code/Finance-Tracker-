import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  glowType?: 'default' | 'success' | 'danger';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  glow = false, 
  glowType = 'default',
  ...props 
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-card rounded-2xl p-6 transition-all duration-300',
          'glass-card-light dark:glass-card-dark',
          glow && glowType === 'default' && 'hover:shadow-neon hover:border-indigo-500/30',
          glow && glowType === 'success' && 'hover:shadow-neon-success hover:border-emerald-500/30',
          glow && glowType === 'danger' && 'hover:shadow-neon-danger hover:border-rose-500/30',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
