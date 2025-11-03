import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  helperText,
  variant = 'default',
  fullWidth = false,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'block px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-purple-400',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-gray-800 dark:text-gray-100',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600 dark:bg-gray-800 dark:text-gray-100'
  };
  
  const widthClasses = fullWidth ? 'w-full' : 'w-auto';
  
  // Determine variant based on error/success props
  const currentVariant = error ? 'error' : success ? 'success' : variant;
  
  return (
    <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            baseClasses,
            variantClasses[currentVariant],
            widthClasses,
            (error || success) && 'pr-10',
            className
          )}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" data-testid="error-icon" />
          </div>
        )}
        
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircle className="h-5 w-5 text-green-500" data-testid="success-icon" />
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <div className="mt-1 text-sm">
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && !error && (
            <p className="text-green-600 dark:text-green-400">{success}</p>
          )}
          {helperText && !error && !success && (
            <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});