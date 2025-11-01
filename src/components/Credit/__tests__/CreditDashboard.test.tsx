import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { CreditDashboard } from '../CreditDashboard';
import { CreditBalance } from '@/types';

// Mock the credit service
vi.mock('@/services/credit', () => ({
  creditService: {
    getUsageAnalytics: vi.fn(() => Promise.resolve({
      totalSpent: 1000,
      totalEarned: 2000,
      dailyUsage: [],
      categoryBreakdown: [],
      modelUsage: []
    })),
    getNotifications: vi.fn(() => Promise.resolve({
      notifications: [],
      total: 0,
      unreadCount: 0
    }))
  }
}));

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />
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

describe('CreditDashboard', () => {
  const mockBalance: CreditBalance = {
    userId: 'test-user',
    currentBalance: 1000,
    reservedCredits: 100,
    availableBalance: 900,
    lastUpdated: new Date(),
    accountStatus: 'active',
    lifetimeCreditsEarned: 2000,
    lifetimeCreditsSpent: 1000
  };

  const mockProps = {
    balance: mockBalance,
    onTopUp: vi.fn(),
    onViewHistory: vi.fn(),
    onManageNotifications: vi.fn()
  };

  it('renders the credit dashboard', () => {
    render(<CreditDashboard {...mockProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Credit Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor your AI assistant credit usage and manage payments')).toBeInTheDocument();
  });

  it('displays balance information', () => {
    render(<CreditDashboard {...mockProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('900')).toBeInTheDocument(); // Available balance
    expect(screen.getByText('100')).toBeInTheDocument(); // Reserved credits
    expect(screen.getByText('2,000')).toBeInTheDocument(); // Lifetime earned
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Lifetime spent
  });

  it('shows loading state when balance is undefined', () => {
    const propsWithoutBalance = {
      ...mockProps,
      balance: undefined
    };

    render(<CreditDashboard {...propsWithoutBalance} />, {
      wrapper: createWrapper(),
    });

    // Should show loading skeleton - check for skeleton elements instead
    expect(screen.queryByText('Credit Dashboard')).not.toBeInTheDocument();
    // Check for loading skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays account status', () => {
    render(<CreditDashboard {...mockProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Account Status')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});