import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ChatProvider, useChat } from '../../../contexts/ChatContext';
import { apiService } from '../../../services/api';
import { chatService } from '../../../services/chat';
import { Conversation, Message as MessageType } from '../../../types';

// Mock services
vi.mock('../../../services/api');
vi.mock('../../../services/chat');

const mockConversation: Conversation = {
  id: 'conv-1',
  userId: 'user-1',
  title: 'Test Conversation',
  messages: [],
  createdAt: new Date('2024-01-01T10:00:00Z'),
  lastMessageAt: new Date('2024-01-01T10:00:00Z'),
  totalCreditsUsed: 0,
  status: 'active',
};

const mockMessage: MessageType = {
  id: 'msg-1',
  conversationId: 'conv-1',
  role: 'user',
  content: 'Hello',
  timestamp: new Date('2024-01-01T10:01:00Z'),
};

// Test component that uses the chat context
const TestComponent = () => {
  const {
    state,
    loadConversations,
    createConversation,
    selectConversation,
    sendMessage,
    getCurrentConversation,
  } = useChat();
  
  return (
    <div>
      <div data-testid="loading">{state.isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="typing">{state.isTyping ? 'typing' : 'not-typing'}</div>
      <div data-testid="error">{state.error || 'no-error'}</div>
      <div data-testid="conversations-count">{state.conversations.length}</div>
      <div data-testid="current-conversation">
        {state.currentConversationId || 'none'}
      </div>
      <div data-testid="current-conversation-title">
        {getCurrentConversation()?.title || 'no-title'}
      </div>
      
      <button onClick={() => loadConversations()}>Load Conversations</button>
      <button onClick={() => createConversation('New Chat')}>Create Conversation</button>
      <button onClick={() => selectConversation('conv-1')}>Select Conversation</button>
      <button onClick={() => sendMessage('Hello')}>Send Message</button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial chat state', async () => {
    vi.mocked(apiService.get).mockResolvedValue([]);

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('typing')).toHaveTextContent('not-typing');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('conversations-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-conversation')).toHaveTextContent('none');
  });

  it('loads conversations on mount', async () => {
    vi.mocked(apiService.get).mockResolvedValue([mockConversation]);

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('conversations-count')).toHaveTextContent('1');
    });

    expect(apiService.get).toHaveBeenCalledWith('/v1/chat/conversations');
  });

  it('creates new conversation', async () => {
    vi.mocked(apiService.get).mockResolvedValue([]);
    vi.mocked(apiService.post).mockResolvedValue(mockConversation);

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const createButton = screen.getByText('Create Conversation');
    
    await act(async () => {
      createButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('conversations-count')).toHaveTextContent('1');
      expect(screen.getByTestId('current-conversation')).toHaveTextContent('conv-1');
    });

    expect(apiService.post).toHaveBeenCalledWith('/v1/chat/conversations', {
      title: 'New Chat',
      type: 'general',
    });
  });

  it('selects conversation', async () => {
    vi.mocked(apiService.get)
      .mockResolvedValueOnce([]) // Initial load
      .mockResolvedValueOnce(mockConversation); // Select conversation

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const selectButton = screen.getByText('Select Conversation');
    
    await act(async () => {
      selectButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-conversation')).toHaveTextContent('conv-1');
      expect(screen.getByTestId('current-conversation-title')).toHaveTextContent('Test Conversation');
    });

    expect(apiService.get).toHaveBeenCalledWith('/v1/chat/conversations/conv-1');
  });

  it('sends message via chat service', async () => {
    const conversationWithMessages = {
      ...mockConversation,
      messages: [mockMessage],
    };

    vi.mocked(apiService.get).mockResolvedValue([conversationWithMessages]);
    vi.mocked(chatService.sendMessage).mockResolvedValue(mockMessage);

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Wait for initial load and select conversation
    await waitFor(() => {
      expect(screen.getByTestId('conversations-count')).toHaveTextContent('1');
    });

    await act(async () => {
      screen.getByText('Select Conversation').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-conversation')).toHaveTextContent('conv-1');
    });

    // Send message
    await act(async () => {
      screen.getByText('Send Message').click();
    });

    expect(chatService.sendMessage).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      content: 'Hello',
      streaming: true,
    });
  });

  it('falls back to HTTP API when real-time fails', async () => {
    const conversationWithMessages = {
      ...mockConversation,
      messages: [mockMessage],
    };

    vi.mocked(apiService.get).mockResolvedValue([conversationWithMessages]);
    vi.mocked(chatService.sendMessage).mockRejectedValue(new Error('WebSocket failed'));
    vi.mocked(apiService.post).mockResolvedValue(mockMessage);

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Wait for initial load and select conversation
    await waitFor(() => {
      expect(screen.getByTestId('conversations-count')).toHaveTextContent('1');
    });

    await act(async () => {
      screen.getByText('Select Conversation').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-conversation')).toHaveTextContent('conv-1');
    });

    // Send message
    await act(async () => {
      screen.getByText('Send Message').click();
    });

    // Should try real-time first, then fall back to HTTP
    expect(chatService.sendMessage).toHaveBeenCalled();
    expect(apiService.post).toHaveBeenCalledWith('/v1/chat/messages', {
      conversationId: 'conv-1',
      content: 'Hello',
    });
  });

  it('handles errors gracefully', async () => {
    vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load conversations');
    });
  });

  it('throws error when useChat is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useChat must be used within a ChatProvider');
    
    consoleSpy.mockRestore();
  });
});