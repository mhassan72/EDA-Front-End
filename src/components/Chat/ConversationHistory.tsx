import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Conversation } from '../../types';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewConversation: (type: 'general' | 'image' | 'educational') => void;
  isLoading?: boolean;
  className?: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  isLoading = false,
  className
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(conversationId);
    try {
      await onDeleteConversation(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'image': return '🎨';
      case 'educational': return '📚';
      default: return '💬';
    }
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conversation) => {
    const date = new Date(conversation.lastMessageAt || conversation.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Older';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Conversations
        </h3>
        
        {/* New Conversation Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => onNewConversation('general')}
            size="sm"
            className="w-full justify-start text-left"
            variant="ghost"
          >
            💬 New Chat
          </Button>
          <Button
            onClick={() => onNewConversation('image')}
            size="sm"
            className="w-full justify-start text-left"
            variant="ghost"
          >
            🎨 Generate Images
          </Button>
          <Button
            onClick={() => onNewConversation('educational')}
            size="sm"
            className="w-full justify-start text-left"
            variant="ghost"
          >
            📚 Learn & Study
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedConversations).map(([groupName, groupConversations]) => (
              <div key={groupName} className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 mb-2">
                  {groupName}
                </h4>
                <AnimatePresence>
                  {groupConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className={clsx(
                        'group relative rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        currentConversationId === conversation.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'border border-transparent'
                      )}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-lg">
                          {getConversationIcon(conversation.status || 'general')}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {conversation.title}
                          </h5>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {conversation.messages.length} messages
                            </p>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(new Date(conversation.lastMessageAt || conversation.createdAt))}
                            </span>
                          </div>
                          
                          {/* Last message preview */}
                          {conversation.messages.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                              {typeof conversation.messages[conversation.messages.length - 1].content === 'string'
                                ? conversation.messages[conversation.messages.length - 1].content
                                : 'Media message'
                              }
                            </p>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(conversation.id, e)}
                          disabled={deletingId === conversation.id}
                          className={clsx(
                            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                            'p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                            deletingId === conversation.id && 'opacity-100'
                          )}
                          aria-label="Delete conversation"
                        >
                          {deletingId === conversation.id ? (
                            <LoadingSpinner size="xs" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};