import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 4000,
  className
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      adjustTextareaHeight();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={clsx('p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800', className)}>
      <Card className="p-3 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
        <div className="flex items-end space-x-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={clsx(
                'w-full resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                'focus:outline-none focus:ring-0',
                'text-sm sm:text-base leading-6',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            
            {/* Character Count */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute -top-6 right-0 text-xs text-gray-500 dark:text-gray-400">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send Button */}
          <motion.div
            animate={{
              scale: canSend ? 1 : 0.9,
              opacity: canSend ? 1 : 0.5
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleSend}
              disabled={!canSend}
              size="sm"
              className={clsx(
                'px-4 py-2 rounded-lg transition-all duration-200',
                canSend
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </motion.div>
        </div>

        {/* Input Hints */}
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400"
          >
            Press Enter to send, Shift+Enter for new line
          </motion.div>
        )}
      </Card>
    </div>
  );
};