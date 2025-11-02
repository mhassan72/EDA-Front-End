import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentMethodManager } from '../PaymentMethodManager';
import { creditService } from '@/services/credit';

// Mock the credit service
vi.mock('@/services/credit', () => ({
  creditService: {
    getPaymentMethods: vi.fn(),
    addPaymentMethod: vi.fn(),
    removePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
  }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
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

const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'credit_card' as const,
    name: 'My Visa Card',
    isDefault: true,
    metadata: { last4: '4242' }
  },
  {
    id: 'pm_2', 
    type: 'paypal' as const,
    name: 'PayPal Account',
    isDefault: false,
    metadata: { email: 'user@example.com' }
  }
];

describe('PaymentMethodManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment method manager when open', () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue(mockPaymentMethods);

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Manage your payment methods for credit purchases')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PaymentMethodManager isOpen={false} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Payment Methods')).not.toBeInTheDocument();
  });

  it('displays existing payment methods', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue(mockPaymentMethods);

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('My Visa Card')).toBeInTheDocument();
      expect(screen.getByText('PayPal Account')).toBeInTheDocument();
    });

    // Check default indicator
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('shows add payment method form when button clicked', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue([]);

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    const addButton = screen.getByText('Add Payment Method');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Payment Method')).toBeInTheDocument();
      expect(screen.getByText('Payment Type')).toBeInTheDocument();
      expect(screen.getByText('Display Name')).toBeInTheDocument();
    });
  });

  it('validates payment method form submission', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue([]);
    const mockAddMethod = vi.mocked(creditService.addPaymentMethod);

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    // Open add form
    fireEvent.click(screen.getByText('Add Payment Method'));

    await waitFor(() => {
      expect(screen.getByText('Add New Payment Method')).toBeInTheDocument();
    });

    // Try to submit without name
    const submitButton = screen.getByRole('button', { name: /add method/i });
    fireEvent.click(submitButton);

    // Should not call the service without a name
    expect(mockAddMethod).not.toHaveBeenCalled();
  });

  it('adds new payment method successfully', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue([]);
    const mockAddMethod = vi.mocked(creditService.addPaymentMethod).mockResolvedValue({
      id: 'pm_new',
      type: 'credit_card',
      name: 'New Card',
      isDefault: true,
      metadata: {}
    });

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    // Open add form
    fireEvent.click(screen.getByText('Add Payment Method'));

    await waitFor(() => {
      expect(screen.getByText('Add New Payment Method')).toBeInTheDocument();
    });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('e.g., My Visa Card, PayPal Account');
    fireEvent.change(nameInput, { target: { value: 'New Card' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add method/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddMethod).toHaveBeenCalledWith({
        type: 'credit_card',
        name: 'New Card',
        isDefault: true,
        metadata: {}
      });
    });
  });

  it('removes payment method when delete clicked', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue(mockPaymentMethods);
    const mockRemoveMethod = vi.mocked(creditService.removePaymentMethod).mockResolvedValue();

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('My Visa Card')).toBeInTheDocument();
    });

    // Find and click delete button (trash icon)
    const deleteButtons = screen.getAllByTitle('Remove method');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockRemoveMethod).toHaveBeenCalledWith('pm_1');
    });
  });

  it('sets default payment method when star clicked', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue(mockPaymentMethods);
    const mockSetDefault = vi.mocked(creditService.setDefaultPaymentMethod).mockResolvedValue();

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('PayPal Account')).toBeInTheDocument();
    });

    // Find and click set default button for non-default method
    const setDefaultButtons = screen.getAllByTitle('Set as default');
    fireEvent.click(setDefaultButtons[0]);

    await waitFor(() => {
      expect(mockSetDefault).toHaveBeenCalledWith('pm_2');
    });
  });

  it('displays security information', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue(mockPaymentMethods);

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Your payment information is secure')).toBeInTheDocument();
      expect(screen.getByText(/We use industry-standard encryption/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no payment methods', async () => {
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue([]);

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('No Payment Methods')).toBeInTheDocument();
      expect(screen.getByText('Add a payment method to purchase credits easily')).toBeInTheDocument();
    });
  });

  it('closes modal when close button clicked', () => {
    const mockOnClose = vi.fn();
    vi.mocked(creditService.getPaymentMethods).mockResolvedValue([]);

    render(
      <PaymentMethodManager isOpen={true} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state while fetching payment methods', () => {
    vi.mocked(creditService.getPaymentMethods).mockImplementation(
      () => new Promise<any>(() => {}) // Never resolves
    );

    render(
      <PaymentMethodManager isOpen={true} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    // Should show loading skeletons
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});