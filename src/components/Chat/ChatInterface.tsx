import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Message as MessageType, Conversation } from '../../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConnectionStatus, ConnectionState } from './ConnectionStatus';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export interface ChatInterfaceProps {
  conversation?: Conversation;
  onSendMessage: (message: string) => Promise<void>;
  onLoadMoreMessages?: () => Promise<void>;
  isLoading?: boolean;
  isTyping?: boolean;
  connectionStatus?: ConnectionState;
  streamingMessageId?: string;
  hasMoreMessages?: boolean;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  onSendMessage,
  onLoadMoreMessages,
  isLoading = false,
  isTyping = false,
  connectionStatus = 'connected',
  streamingMessageId,
  hasMoreMessages = false,
  className
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = useCallback(async (message: string) => {
    if (isSending) return;
    
    setIsSending(true);
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling will be managed by the parent component
    } finally {
      setIsSending(false);
    }
  }, [onSendMessage, isSending]);

  const messages = conversation?.messages || [];
  const isInputDisabled = isSending || isTyping || connectionStatus === 'disconnected';

  return (
    <div className={clsx('flex flex-col h-full bg-gray-50 dark:bg-gray-900', className)}>
      {/* Connection Status */}
      <ConnectionStatus status={connectionStatus} />

      {/* Chat Header */}
      {conversation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {conversation.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {messages.length} messages • {conversation.totalCreditsUsed || 0} credits used
              </p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-2">
              {isLoading && <LoadingSpinner size="sm" />}
              <div className={clsx(
                'w-2 h-2 rounded-full',
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-500' :
                'bg-red-500'
              )} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isTyping={isTyping}
          streamingMessageId={streamingMessageId}
          onLoadMore={onLoadMoreMessages}
          hasMore={hasMoreMessages}
          className="flex-1"
        />

        {/* Message Input */}
        <div className="flex-shrink-0">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isInputDisabled}
            placeholder={
              connectionStatus === 'disconnected' 
                ? 'Reconnecting...' 
                : isTyping 
                ? 'AI is responding...' 
                : 'Type your message...'
            }
          />
        </div>
      </div>
    </div>
  );
};