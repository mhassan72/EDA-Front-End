import { apiService } from './api';
import { webSocketService, ConnectionStatus } from './websocket';
import { Conversation, Message as MessageType } from '../types';

export interface StreamingChatOptions {
  onMessageChunk?: (chunk: string, messageId: string) => void;
  onMessageComplete?: (message: MessageType) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onError?: (error: string) => void;
}

export interface SendMessageOptions {
  conversationId: string;
  content: string;
  streaming?: boolean;
}

export class ChatService {
  private static instance: ChatService;
  private streamingOptions: StreamingChatOptions = {};
  private activeStreams: Set<string> = new Set();

  private constructor() {
    this.setupWebSocketListeners();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Initialize chat service and connect WebSocket
   */
  public async initialize(): Promise<void> {
    try {
      await webSocketService.connect();
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      throw error;
    }
  }

  /**
   * Set streaming options for real-time features
   */
  public setStreamingOptions(options: StreamingChatOptions): void {
    this.streamingOptions = { ...this.streamingOptions, ...options };
  }

  /**
   * Send a message with optional streaming
   */
  public async sendMessage(options: SendMessageOptions): Promise<MessageType> {
    const { conversationId, content, streaming = true } = options;

    try {
      // Create user message first
      const userMessage: MessageType = {
        id: `temp-user-${Date.now()}`,
        conversationId,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      if (streaming && webSocketService.isConnected()) {
        // Send via WebSocket for streaming response
        return await this.sendStreamingMessage(userMessage);
      } else {
        // Fallback to HTTP API
        return await this.sendHttpMessage(userMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      this.streamingOptions.onError?.('Failed to send message');
      throw error;
    }
  }

  /**
   * Load conversation history
   */
  public async loadConversation(conversationId: string): Promise<Conversation> {
    try {
      return await apiService.get<Conversation>(`/v1/chat/conversations/${conversationId}`);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      throw error;
    }
  }

  /**
   * Load more messages for a conversation
   */
  public async loadMoreMessages(
    conversationId: string, 
    before?: string, 
    limit: number = 20
  ): Promise<MessageType[]> {
    try {
      return await apiService.get<MessageType[]>(
        `/v1/chat/conversations/${conversationId}/messages`,
        {
          params: { before, limit },
        }
      );
    } catch (error) {
      console.error('Failed to load more messages:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  public async createConversation(
    title: string, 
    type: 'general' | 'image' | 'educational' = 'general'
  ): Promise<Conversation> {
    try {
      return await apiService.post<Conversation>('/v1/chat/conversations', {
        title,
        type,
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  public async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiService.delete(`/v1/chat/conversations/${conversationId}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return webSocketService.getConnectionStatus();
  }

  /**
   * Subscribe to connection status changes
   */
  public onConnectionStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    return webSocketService.onConnectionStatusChange(callback);
  }

  /**
   * Disconnect from chat service
   */
  public disconnect(): void {
    webSocketService.disconnect();
    this.activeStreams.clear();
  }

  // Private methods

  private async sendStreamingMessage(userMessage: MessageType): Promise<MessageType> {
    return new Promise((resolve, reject) => {
      const messageId = `stream-${Date.now()}`;
      this.activeStreams.add(messageId);

      let assistantMessage: MessageType | null = null;
      let streamContent = '';

      // Set up one-time listeners for this message
      const unsubscribeStream = webSocketService.on('message_stream', (data) => {
        if (data.messageId === messageId) {
          streamContent += data.chunk;
          this.streamingOptions.onMessageChunk?.(data.chunk, messageId);
        }
      });

      const unsubscribeComplete = webSocketService.on('message_complete', (data) => {
        if (data.messageId === messageId) {
          assistantMessage = data.message;
          this.activeStreams.delete(messageId);
          this.streamingOptions.onMessageComplete?.(assistantMessage);
          
          // Clean up listeners
          unsubscribeStream();
          unsubscribeComplete();
          unsubscribeError();
          
          resolve(assistantMessage);
        }
      });

      const unsubscribeError = webSocketService.on('error', (data) => {
        if (data.messageId === messageId) {
          this.activeStreams.delete(messageId);
          this.streamingOptions.onError?.(data.error);
          
          // Clean up listeners
          unsubscribeStream();
          unsubscribeComplete();
          unsubscribeError();
          
          reject(new Error(data.error));
        }
      });

      // Send the message via WebSocket
      webSocketService.send('message_stream', {
        messageId,
        conversationId: userMessage.conversationId,
        content: userMessage.content,
      }, userMessage.conversationId);

      // Set timeout for streaming
      setTimeout(() => {
        if (this.activeStreams.has(messageId)) {
          this.activeStreams.delete(messageId);
          unsubscribeStream();
          unsubscribeComplete();
          unsubscribeError();
          reject(new Error('Streaming timeout'));
        }
      }, 60000); // 60 second timeout
    });
  }

  private async sendHttpMessage(userMessage: MessageType): Promise<MessageType> {
    try {
      // Send user message first
      const savedUserMessage = await apiService.post<MessageType>('/v1/chat/messages', {
        conversationId: userMessage.conversationId,
        role: 'user',
        content: userMessage.content,
      });

      // Get AI response
      const assistantMessage = await apiService.post<MessageType>('/v1/chat/messages', {
        conversationId: userMessage.conversationId,
        role: 'assistant',
        generateResponse: true,
      });

      return assistantMessage;
    } catch (error) {
      console.error('HTTP message send failed:', error);
      throw error;
    }
  }

  private setupWebSocketListeners(): void {
    // Handle typing indicators
    webSocketService.on('typing_start', () => {
      this.streamingOptions.onTypingStart?.();
    });

    webSocketService.on('typing_stop', () => {
      this.streamingOptions.onTypingStop?.();
    });

    // Handle general errors
    webSocketService.on('error', (data) => {
      if (!data.messageId) { // General errors, not message-specific
        this.streamingOptions.onError?.(data.error);
      }
    });
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();