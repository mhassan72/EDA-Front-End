import React from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  options?: ToastOptions;
}

// Custom toast component for consistent styling
const CustomToast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
}> = ({ message, type, onDismiss }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  const backgrounds = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };

  const Icon = icons[type];

  return (
    <div className={clsx(
      'flex items-center p-4 rounded-lg border shadow-lg max-w-md',
      backgrounds[type]
    )}>
      <Icon className={clsx('w-5 h-5 mr-3 flex-shrink-0', colors[type])} />
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
        {message}
      </p>
      <button
        onClick={onDismiss}
        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast utility functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="success"
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: 4000,
        ...options
      }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="error"
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: 6000,
        ...options
      }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="warning"
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: 5000,
        ...options
      }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="info"
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration: 4000,
        ...options
      }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error
      },
      options
    );
  }
};

// Toast provider component
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName="z-50"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0
        }
      }}
    />
  );
};