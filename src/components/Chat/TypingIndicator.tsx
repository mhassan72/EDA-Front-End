import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../UI/Card';

export interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-4 justify-start ${className || ''}`}
    >
      <div className="flex max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-3 animate-pulse">
          🤖
        </div>

        {/* Typing Animation */}
        <Card className="flex-1 p-3 sm:p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              AI is typing
            </span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};