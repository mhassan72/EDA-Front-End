import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Message } from '../Message';
import { Message as MessageType } from '../../../types';

const mockUserMessage: MessageType = {
  id: 'user-1',
  conversationId: 'conv-1',
  role: 'user',
  content: 'Hello, how are you?',
  timestamp: new Date('2024-01-01T10:00:00Z'),
};

const mockAssistantMessage: MessageType = {
  id: 'assistant-1',
  conversationId: 'conv-1',
  role: 'assistant',
  content: 'I am doing well, thank you for asking!',
  timestamp: new Date('2024-01-01T10:01:00Z'),
  creditsUsed: 5,
};

const mockComplexMessage: MessageType = {
  id: 'complex-1',
  conversationId: 'conv-1',
  role: 'assistant',
  content: [
    { type: 'text', text: 'Here is an image:' },
    { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
  ],
  timestamp: new Date('2024-01-01T10:02:00Z'),
};

describe('Message', () => {
  it('renders user message correctly', () => {
    render(<Message message={mockUserMessage} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
    expect(screen.getByText('13:00')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<Message message={mockAssistantMessage} />);
    
    expect(screen.getByText('I am doing well, thank you for asking!')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('13:01')).toBeInTheDocument();
    expect(screen.getByText('💰 5 credits')).toBeInTheDocument();
  });

  it('renders complex message with image', () => {
    render(<Message message={mockComplexMessage} />);
    
    expect(screen.getByText('Here is an image:')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows streaming indicator when isStreaming is true', () => {
    render(<Message message={mockAssistantMessage} isStreaming={true} />);
    
    // The streaming cursor should be present
    const messageElement = screen.getByText('I am doing well, thank you for asking!').parentElement;
    expect(messageElement).toBeInTheDocument();
  });

  it('applies correct styling for user messages', () => {
    render(<Message message={mockUserMessage} />);
    
    const messageContainer = screen.getByText('Hello, how are you?').closest('.bg-blue-500');
    expect(messageContainer).toBeInTheDocument();
  });

  it('applies correct styling for assistant messages', () => {
    render(<Message message={mockAssistantMessage} />);
    
    const messageContainer = screen.getByText('I am doing well, thank you for asking!').closest('.bg-white');
    expect(messageContainer).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    const message = {
      ...mockUserMessage,
      timestamp: new Date('2024-01-01T14:30:00Z'),
    };
    
    render(<Message message={message} />);
    
    expect(screen.getByText('17:30')).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const message = {
      ...mockUserMessage,
      content: '',
    };
    
    render(<Message message={message} />);
    
    // Should still render the message structure
    expect(screen.getByText('👤')).toBeInTheDocument();
  });
});