import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../MessageInput';
import { beforeEach } from 'node:test';

describe('MessageInput', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field with placeholder', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <MessageInput 
        onSendMessage={mockOnSendMessage} 
        placeholder="Custom placeholder" 
      />
    );
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('sends message when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await user.type(input, 'Hello world');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
  });

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Hello world');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
  });

  it('adds new line when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Line 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(input, 'Line 2');
    
    expect(input).toHaveValue('Line 1\nLine 2');
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Hello world');
    await user.keyboard('{Enter}');
    
    expect(input).toHaveValue('');
  });

  it('disables input and button when disabled prop is true', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('trims whitespace from messages', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, '  Hello world  ');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
  });

  it('respects maxLength prop', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} maxLength={10} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'This is a very long message that exceeds the limit');
    
    expect(input).toHaveValue('This is a ');
  });

  it('shows character count when approaching limit', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} maxLength={10} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Test msgs');
    
    // Should show character count when over 80% of limit (9 > 8)
    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('shows input hints when focused', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.click(input);
    
    await waitFor(() => {
      expect(screen.getByText('Press Enter to send, Shift+Enter for new line')).toBeInTheDocument();
    });
  });

  it('auto-resizes textarea as content grows', async () => {
    const user = userEvent.setup();
    render(<MessageInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    
    await user.type(input, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    
    // The textarea should have grown in height
    expect(input.style.height).not.toBe('auto');
  });
});