import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Conversation, Message as MessageType } from '../types';
import { apiService } from '../services/api';
import { chatService } from '../services/chat';

// Chat State Types
export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isTyping: boolean;
  streamingMessageId: string | null;
  error: string | null;
}

// Chat Actions
export type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_STREAMING_MESSAGE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: MessageType } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; updates: Partial<MessageType> } }
  | { type: 'LOAD_MORE_MESSAGES'; payload: { conversationId: string; messages: MessageType[] } };

// Initial State
const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  isTyping: false,
  streamingMessageId: null,
  error: null,
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_STREAMING_MESSAGE':
      return { ...state, streamingMessageId: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversationId: action.payload };
    
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        currentConversationId: action.payload.id,
      };
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        ),
      };
    
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        currentConversationId: state.currentConversationId === action.payload ? null : state.currentConversationId,
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: [...conv.messages, action.payload.message],
                lastMessageAt: action.payload.message.timestamp,
                totalCreditsUsed: (conv.totalCreditsUsed || 0) + (action.payload.message.creditsUsed || 0),
              }
            : conv
        ),
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, ...action.payload.updates }
                    : msg
                ),
              }
            : conv
        ),
      };
    
    case 'LOAD_MORE_MESSAGES':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: [...action.payload.messages, ...conv.messages],
              }
            : conv
        ),
      };
    
    default:
      return state;
  }
}

// Context Types
export interface ChatContextValue {
  state: ChatState;
  
  // Conversation Management
  loadConversations: () => Promise<void>;
  createConversation: (title: string, type?: 'general' | 'image' | 'educational') => Promise<Conversation>;
  selectConversation: (conversationId: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Message Management
  sendMessage: (content: string, conversationId?: string) => Promise<void>;
  loadMoreMessages: (conversationId: string, before?: string) => Promise<void>;
  
  // Utility
  getCurrentConversation: () => Conversation | null;
  clearError: () => void;
}

// Create Context
const ChatContext = createContext<ChatContextValue | null>(null);

// Provider Component
export interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const conversations = await apiService.get<Conversation[]>('/v1/chat/conversations');
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title: string, type: 'general' | 'image' | 'educational' = 'general') => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const conversation = await apiService.post<Conversation>('/v1/chat/conversations', {
        title,
        type,
      });
      
      dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create conversation' });
      throw error;
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Check if conversation is already loaded
      const existingConversation = state.conversations.find(conv => conv.id === conversationId);
      
      if (!existingConversation) {
        // Load conversation from API
        dispatch({ type: 'SET_LOADING', payload: true });
        const conversation = await apiService.get<Conversation>(`/v1/chat/conversations/${conversationId}`);
        dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
      }
      
      dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationId });
    } catch (error) {
      console.error('Failed to select conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversation' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.conversations]);

  // Update conversation
  const updateConversation = useCallback(async (conversationId: string, updates: Partial<Conversation>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedConversation = await apiService.put<Conversation>(
        `/v1/chat/conversations/${conversationId}`,
        updates
      );
      
      dispatch({ 
        type: 'UPDATE_CONVERSATION', 
        payload: { id: conversationId, updates: updatedConversation } 
      });
    } catch (error) {
      console.error('Failed to update conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update conversation' });
      throw error;
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await apiService.delete(`/v1/chat/conversations/${conversationId}`);
      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete conversation' });
      throw error;
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    const targetConversationId = conversationId || state.currentConversationId;
    
    if (!targetConversationId) {
      throw new Error('No conversation selected');
    }

    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_TYPING', payload: true });

      // Create user message
      const userMessage: MessageType = {
        id: `temp-${Date.now()}`,
        conversationId: targetConversationId,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      // Add user message immediately
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { conversationId: targetConversationId, message: userMessage } 
      });

      // Try to send via real-time service first, fallback to HTTP
      try {
        const response = await chatService.sendMessage({
          conversationId: targetConversationId,
          content,
          streaming: true,
        });

        // Update user message with server response
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId: targetConversationId,
            messageId: userMessage.id,
            updates: response,
          },
        });

      } catch (realtimeError) {
        console.warn('Real-time send failed, falling back to HTTP:', realtimeError);
        
        // Fallback to HTTP API
        const response = await apiService.post<MessageType>('/v1/chat/messages', {
          conversationId: targetConversationId,
          content,
        });

        // Update user message with server response
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId: targetConversationId,
            messageId: userMessage.id,
            updates: response,
          },
        });
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      throw error;
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  }, [state.currentConversationId]);

  // Load more messages
  const loadMoreMessages = useCallback(async (conversationId: string, before?: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_LOADING', payload: true });

      const messages = await apiService.get<MessageType[]>(
        `/v1/chat/conversations/${conversationId}/messages`,
        {
          params: { before, limit: 20 },
        }
      );

      dispatch({
        type: 'LOAD_MORE_MESSAGES',
        payload: { conversationId, messages },
      });
    } catch (error) {
      console.error('Failed to load more messages:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get current conversation
  const getCurrentConversation = useCallback(() => {
    if (!state.currentConversationId) return null;
    return state.conversations.find(conv => conv.id === state.currentConversationId) || null;
  }, [state.currentConversationId, state.conversations]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: ChatContextValue = {
    state,
    loadConversations,
    createConversation,
    selectConversation,
    updateConversation,
    deleteConversation,
    sendMessage,
    loadMoreMessages,
    getCurrentConversation,
    clearError,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use chat context
export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};