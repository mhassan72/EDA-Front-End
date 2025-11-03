import { useEffect, useCallback, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { chatService } from '../services/chat';
import { ConnectionStatus } from '../services/websocket';
import { Message as MessageType } from '../types';

export interface UseRealTimeChatOptions {
  autoConnect?: boolean;
  enableStreaming?: boolean;
}

export interface UseRealTimeChatReturn {
  connectionStatus: ConnectionStatus;
  isStreaming: boolean;
  streamingMessageId: string | null;
  sendMessage: (content: string, conversationId?: string) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useRealTimeChat = (options: UseRealTimeChatOptions = {}): UseRealTimeChatReturn => {
  const { autoConnect = true, enableStreaming = true } = options;
  const { state, getCurrentConversation } = useChat();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Initialize chat service and set up listeners
  useEffect(() => {
    const setupChatService = async () => {
      // Set up streaming options
      chatService.setStreamingOptions({
        onMessageChunk: (chunk: string, messageId: string) => {
          setStreamingMessageId(messageId);
          setIsStreaming(true);
          // The chunk will be handled by the ChatContext
        },
        onMessageComplete: (message: MessageType) => {
          setIsStreaming(false);
          setStreamingMessageId(null);
          // The complete message will be handled by the ChatContext
        },
        onTypingStart: () => {
          setIsStreaming(true);
        },
        onTypingStop: () => {
          setIsStreaming(false);
        },
        onError: (error: string) => {
          console.error('Real-time chat error:', error);
          setIsStreaming(false);
          setStreamingMessageId(null);
        },
      });

      // Subscribe to connection status changes
      const unsubscribe = chatService.onConnectionStatusChange((status) => {
        setConnectionStatus(status);
      });

      // Auto-connect if enabled
      if (autoConnect) {
        try {
          await chatService.initialize();
        } catch (error) {
          console.error('Failed to auto-connect to chat service:', error);
        }
      }

      return unsubscribe;
    };

    const unsubscribe = setupChatService();

    // Cleanup on unmount
    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, [autoConnect]);

  // Connect to real-time chat
  const connect = useCallback(async () => {
    try {
      await chatService.initialize();
    } catch (error) {
      console.error('Failed to connect to real-time chat:', error);
      throw error;
    }
  }, []);

  // Disconnect from real-time chat
  const disconnect = useCallback(() => {
    chatService.disconnect();
    setIsStreaming(false);
    setStreamingMessageId(null);
  }, []);

  // Send message with real-time streaming
  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    const targetConversationId = conversationId || state.currentConversationId;
    
    if (!targetConversationId) {
      throw new Error('No conversation selected');
    }

    try {
      setIsStreaming(true);
      
      await chatService.sendMessage({
        conversationId: targetConversationId,
        content,
        streaming: enableStreaming && connectionStatus === 'connected',
      });

    } catch (error) {
      console.error('Failed to send real-time message:', error);
      setIsStreaming(false);
      setStreamingMessageId(null);
      throw error;
    }
  }, [state.currentConversationId, enableStreaming, connectionStatus]);

  return {
    connectionStatus,
    isStreaming,
    streamingMessageId,
    sendMessage,
    connect,
    disconnect,
  };
};