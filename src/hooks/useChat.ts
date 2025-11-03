import { useCallback, useEffect, useState } from 'react';
import { useChat as useChatContext } from '../contexts/ChatContext';
import { Conversation } from '../types';

export interface UseChatOptions {
  autoCreateConversation?: boolean;
  conversationType?: 'general' | 'image' | 'educational';
  defaultTitle?: string;
}

export interface UseChatReturn {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Actions
  createNewConversation: (title?: string, type?: 'general' | 'image' | 'educational') => Promise<Conversation>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  hasMoreMessages: boolean;
  canSendMessage: boolean;
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const {
    autoCreateConversation = false,
    conversationType = 'general',
    defaultTitle = 'New Conversation',
  } = options;

  const chatContext = useChatContext();
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  const {
    state,
    createConversation,
    selectConversation: selectConv,
    sendMessage: sendMsg,
    deleteConversation: deleteConv,
    loadMoreMessages: loadMore,
    getCurrentConversation,
    clearError,
  } = chatContext;

  // Auto-create conversation if needed
  useEffect(() => {
    if (autoCreateConversation && state.conversations.length === 0 && !state.isLoading) {
      createNewConversation(defaultTitle, conversationType);
    }
  }, [autoCreateConversation, state.conversations.length, state.isLoading, defaultTitle, conversationType]);

  // Create new conversation
  const createNewConversation = useCallback(async (
    title?: string, 
    type: 'general' | 'image' | 'educational' = conversationType
  ) => {
    const conversationTitle = title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chat - ${new Date().toLocaleDateString()}`;
    return await createConversation(conversationTitle, type);
  }, [createConversation, conversationType]);

  // Select conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    await selectConv(conversationId);
    // Reset hasMoreMessages when switching conversations
    setHasMoreMessages(true);
  }, [selectConv]);

  // Send message
  const sendMessage = useCallback(async (message: string) => {
    const currentConv = getCurrentConversation();
    
    if (!currentConv) {
      // Auto-create conversation if none exists
      const newConv = await createNewConversation();
      await sendMsg(message, newConv.id);
    } else {
      await sendMsg(message);
    }
  }, [sendMsg, getCurrentConversation, createNewConversation]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    await deleteConv(conversationId);
  }, [deleteConv]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    const currentConv = getCurrentConversation();
    if (!currentConv || currentConv.messages.length === 0) return;

    const oldestMessage = currentConv.messages[0];
    try {
      await loadMore(currentConv.id, oldestMessage.id);
    } catch (error) {
      // If no more messages, set hasMoreMessages to false
      setHasMoreMessages(false);
    }
  }, [loadMore, getCurrentConversation]);

  // Computed values
  const currentConversation = getCurrentConversation();
  const canSendMessage = !state.isLoading && !state.isTyping && state.error === null;

  return {
    // State
    conversations: state.conversations,
    currentConversation,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    
    // Actions
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    loadMoreMessages,
    clearError,
    
    // Utilities
    hasMoreMessages,
    canSendMessage,
  };
};