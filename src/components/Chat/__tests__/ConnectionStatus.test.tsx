import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from '../ConnectionStatus';

describe('ConnectionStatus', () => {
  it('does not render when status is connected', () => {
    render(<ConnectionStatus status="connected" />);
    
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
  });

  it('renders connecting status', () => {
    render(<ConnectionStatus status="connecting" />);
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('renders disconnected status', () => {
    render(<ConnectionStatus status="disconnected" />);
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('renders reconnecting status', () => {
    render(<ConnectionStatus status="reconnecting" />);
    
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { rerender } = render(<ConnectionStatus status="connecting" />);
    
    let statusElement = screen.getByText('Connecting...').parentElement;
    expect(statusElement).toHaveClass('bg-yellow-50');
    expect(statusElement).toHaveClass('text-yellow-600');
    
    rerender(<ConnectionStatus status="disconnected" />);
    
    statusElement = screen.getByText('Disconnected').parentElement;
    expect(statusElement).toHaveClass('bg-red-50');
    expect(statusElement).toHaveClass('text-red-600');
    
    rerender(<ConnectionStatus status="reconnecting" />);
    
    statusElement = screen.getByText('Reconnecting...').parentElement;
    expect(statusElement).toHaveClass('bg-blue-50');
    expect(statusElement).toHaveClass('text-blue-600');
  });

  it('applies custom className', () => {
    render(<ConnectionStatus status="connecting" className="custom-class" />);
    
    const statusElement = screen.getByText('Connecting...').parentElement;
    expect(statusElement).toHaveClass('custom-class');
  });
});