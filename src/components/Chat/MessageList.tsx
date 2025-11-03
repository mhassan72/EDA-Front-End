import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Message as MessageType } from '../../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  isTyping?: boolean;
  streamingMessageId?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  isTyping = false,
  streamingMessageId,
  onLoadMore,
  hasMore = false,
  className
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (isAutoScrolling.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Handle scroll events for infinite loading and auto-scroll detection
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Update auto-scroll flag based on user scroll position
    isAutoScrolling.current = isNearBottom;

    // Trigger load more when scrolled to top
    if (scrollTop === 0 && hasMore && onLoadMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, isLoading]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={clsx(
        'flex-1 overflow-y-auto px-4 py-6 space-y-4',
        'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
        'scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500',
        className
      )}
    >
      {/* Load More Indicator */}
      {hasMore && (
        <div className="flex justify-center py-4">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Load older messages
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center py-12"
        >
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Send a message to begin chatting with the AI assistant. Ask questions, 
            request help, or just have a friendly conversation.
          </p>
        </motion.div>
      )}

      {/* Messages */}
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isStreaming={streamingMessageId === message.id}
          />
        ))}
      </AnimatePresence>

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <TypingIndicator />
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};