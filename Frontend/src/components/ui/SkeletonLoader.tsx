import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'circle';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  className,
  ...props 
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-slate-200 dark:bg-slate-800',
          variant === 'text' && 'h-4 w-full rounded-md',
          variant === 'circle' && 'h-10 w-10 rounded-full',
          variant === 'card' && 'h-32 w-full rounded-2xl',
          className
        )
      )}
      {...props}
    />
  );
};

export default SkeletonLoader;
