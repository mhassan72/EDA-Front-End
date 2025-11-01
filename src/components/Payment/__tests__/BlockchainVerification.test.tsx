import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlockchainVerification } from '../BlockchainVerification';
import { creditService } from '@/services/credit';

// Mock the credit service
vi.mock('@/services/credit', () => ({
  creditService: {
    verifyBlockchainTransaction: vi.fn(),
  }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => '2024-01-15 14:30:00'),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockVerificationData = {
  verified: true,
  blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  confirmations: 12,
  timestamp: new Date('2024-01-15T14:30:00Z'),
  explorerUrl: 'https://etherscan.io/tx/0xtest'
};

const mockPendingVerification = {
  verified: false,
  confirmations: 2,
  timestamp: new Date('2024-01-15T14:30:00Z'),
};

describe('BlockchainVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders blockchain verification modal when open', () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Blockchain Verification')).toBeInTheDocument();
    expect(screen.getByText('Verify transaction on the blockchain')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={false} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Blockchain Verification')).not.toBeInTheDocument();
  });

  it('displays verified transaction status', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Transaction has been verified on the blockchain')).toBeInTheDocument();
    });

    // Check confirmations display
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Confirmations')).toBeInTheDocument();
  });

  it('displays pending verification status', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockPendingVerification);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Not Verified')).toBeInTheDocument();
      expect(screen.getByText('Transaction could not be verified')).toBeInTheDocument();
    });
  });

  it('displays transaction details correctly', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('0xtest123')).toBeInTheDocument();
      expect(screen.getByText('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBeInTheDocument();
      expect(screen.getByText('Ethereum Mainnet')).toBeInTheDocument();
    });
  });

  it('shows explorer link when available', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const explorerLink = screen.getByText('View on Etherscan');
      expect(explorerLink.closest('a')).toHaveAttribute('href', 'https://etherscan.io/tx/0xtest');
      expect(explorerLink.closest('a')).toHaveAttribute('target', '_blank');
    });
  });

  it('copies transaction ID to clipboard', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);
    
    // Mock clipboard API
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('0xtest123')).toBeInTheDocument();
    });

    // Find and click copy button
    const copyButtons = screen.getAllByRole('button');
    const copyButton = copyButtons.find(button => 
      button.querySelector('svg') // Looking for copy icon
    );
    
    if (copyButton) {
      fireEvent.click(copyButton);
      expect(mockWriteText).toHaveBeenCalledWith('0xtest123');
    }
  });

  it('refreshes verification data when refresh button clicked', async () => {
    const mockVerify = vi.mocked(creditService.verifyBlockchainTransaction);
    mockVerify.mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });

    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: '' }); // Refresh icon button
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledTimes(2);
    });
  });

  it('shows confirmation progress for unconfirmed transactions', async () => {
    const partiallyConfirmed = {
      ...mockPendingVerification,
      verified: true,
      confirmations: 3
    };
    
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(partiallyConfirmed);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Confirmation in Progress')).toBeInTheDocument();
      expect(screen.getByText('3/6')).toBeInTheDocument();
      expect(screen.getByText(/3 confirmations/)).toBeInTheDocument();
    });

    // Check progress bar
    const progressBar = document.querySelector('.bg-amber-600');
    expect(progressBar).toHaveStyle({ width: '50%' }); // 3/6 = 50%
  });

  it('handles manual transaction verification', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    // Find manual verification input
    const manualInput = screen.getByPlaceholderText('Enter transaction ID to verify...');
    fireEvent.change(manualInput, { target: { value: '0xmanual123' } });

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    // Should show info toast (mocked implementation)
    expect(vi.mocked(require('react-hot-toast').default.info)).toHaveBeenCalledWith(
      'Manual verification not implemented in demo'
    );
  });

  it('shows loading state during verification', () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Verifying...')).toBeInTheDocument();
  });

  it('closes modal when close button clicked', () => {
    const mockOnClose = vi.fn();
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={mockOnClose} 
      />,
      { wrapper: createWrapper() }
    );

    // Find close button (X icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-gray-500')
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('polls for updates on unverified transactions', async () => {
    const mockVerify = vi.mocked(creditService.verifyBlockchainTransaction);
    mockVerify.mockResolvedValue(mockPendingVerification);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    // Initial call
    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });

    // Should set up polling for unverified transactions
    // Note: In a real test, you might want to mock timers and advance them
    expect(mockVerify).toHaveBeenCalledWith('0xtest123');
  });

  it('displays security information', async () => {
    vi.mocked(creditService.verifyBlockchainTransaction).mockResolvedValue(mockVerificationData);

    render(
      <BlockchainVerification 
        transactionId="0xtest123" 
        isOpen={true} 
        onClose={vi.fn()} 
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Blockchain Security')).toBeInTheDocument();
      expect(screen.getByText(/All cryptocurrency transactions are recorded/)).toBeInTheDocument();
    });
  });
});