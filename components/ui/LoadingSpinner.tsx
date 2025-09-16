// components/ui/LoadingSpinner.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'border-indigo-600',
  white: 'border-white',
  gray: 'border-gray-600',
};

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary' 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LoadingState({ loading, children, fallback }: LoadingStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        {fallback || <LoadingSpinner size="lg" />}
      </div>
    );
  }

  return <>{children}</>;
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}

export function InlineLoading({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" className="mr-2" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}