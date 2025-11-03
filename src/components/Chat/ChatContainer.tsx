import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChatInterface } from './ChatInterface';
import { ConversationHistory } from './ConversationHistory';
import { useChat } from '../hooks/useChat';
import { useRealTimeChat } from '../hooks/useRealTimeChat';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { Button } from '../UI/Button';

export interface ChatContainerProps {
  mode?: 'general' | 'image' | 'educational';
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  mode = 'general',
  className
}) => {
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Chat management
  const {
    conversations,
    currentConversation,
    isLoading,
    error,
    createNewConversation,
    selectConversation,
    deleteConversation,
    loadMoreMessages,
    hasMoreMessages,
    clearError,
  } = useChat({
    autoCreateConversation: true,
    conversationType: mode,
    defaultTitle: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat`,
  });

  // Real-time communication
  const {
    connectionStatus,
    isStreaming,
    streamingMessageId,
    sendMessage,
    connect,
    disconnect,
  } = useRealTimeChat({
    autoConnect: true,
    enableStreaming: true,
  });

  // Auto-connect on mount
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      connect().catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Handle sending messages
  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error will be handled by the chat context
    }
  };

  // Handle loading more messages
  const handleLoadMoreMessages = async () => {
    if (currentConversation && hasMoreMessages) {
      try {
        await loadMoreMessages();
      } catch (error) {
        console.error('Failed to load more messages:', error);
      }
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversationId: string) => {
    try {
      await selectConversation(conversationId);
    } catch (error) {
      console.error('Failed to select conversation:', error);
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  // Handle creating new conversation
  const handleNewConversation = async (type: 'general' | 'image' | 'educational') => {
    try {
      await createNewConversation(undefined, type);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  // Handle retry connection
  const handleRetryConnection = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  };

  return (
    <div className={clsx('flex h-full bg-gray-50 dark:bg-gray-900', className)}>
      {/* Sidebar */}
      <motion.div
        animate={{
          width: showSidebar ? 320 : 0,
          opacity: showSidebar ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversation?.id || null}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="ghost"
                size="sm"
                className="lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} Chat
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
                </p>
              </div>
            </div>

            {/* Connection Actions */}
            {connectionStatus === 'disconnected' && (
              <Button
                onClick={handleRetryConnection}
                size="sm"
                variant="outline"
              >
                Reconnect
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
              <Button
                onClick={clearError}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          {isLoading && !currentConversation ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <ChatInterface
              conversation={currentConversation}
              onSendMessage={handleSendMessage}
              onLoadMoreMessages={handleLoadMoreMessages}
              isLoading={isLoading}
              isTyping={isStreaming}
              connectionStatus={connectionStatus}
              streamingMessageId={streamingMessageId}
              hasMoreMessages={hasMoreMessages}
            />
          )}
        </div>
      </div>
    </div>
  );
};