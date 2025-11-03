import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface ConnectionStatusProps {
  status: ConnectionState;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  className
}) => {
  const statusConfig = {
    connected: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: '🟢',
      text: 'Connected',
      show: false // Don't show when connected
    },
    connecting: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: '🟡',
      text: 'Connecting...',
      show: true
    },
    disconnected: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: '🔴',
      text: 'Disconnected',
      show: true
    },
    reconnecting: {
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: '🔄',
      text: 'Reconnecting...',
      show: true
    }
  };

  const config = statusConfig[status];

  return (
    <AnimatePresence>
      {config.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            'fixed top-20 left-1/2 transform -translate-x-1/2 z-50',
            'px-4 py-2 rounded-full border shadow-lg',
            'flex items-center space-x-2 text-sm font-medium',
            config.bgColor,
            config.borderColor,
            config.color,
            className
          )}
        >
          <motion.span
            animate={
              status === 'connecting' || status === 'reconnecting'
                ? { rotate: 360 }
                : {}
            }
            transition={
              status === 'connecting' || status === 'reconnecting'
                ? { duration: 1, repeat: Infinity, ease: 'linear' }
                : {}
            }
          >
            {config.icon}
          </motion.span>
          <span>{config.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};