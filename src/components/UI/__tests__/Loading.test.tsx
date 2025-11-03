import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, Loading } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6', 'text-purple-600');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('w-12', 'h-12');
  });

  it('renders different colors correctly', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-purple-600');

    rerender(<LoadingSpinner color="secondary" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-gray-600');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-white');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);
    const container = screen.getByTestId('loading-spinner').parentElement;
    expect(container).toHaveClass('custom-spinner');
  });
});

describe('Loading', () => {
  it('renders spinner variant by default', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<Loading text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders dots variant correctly', () => {
    render(<Loading variant="dots" text="Loading data" />);
    expect(screen.getByText('Loading data')).toBeInTheDocument();
    // Check for animated dots
    const container = screen.getByText('Loading data').parentElement;
    expect(container?.querySelectorAll('.bg-purple-600')).toHaveLength(3);
  });

  it('renders skeleton variant correctly', () => {
    render(<Loading variant="skeleton" />);
    const container = screen.getByTestId('skeleton-loading');
    expect(container).toHaveClass('animate-pulse');
    expect(container.querySelectorAll('.bg-gray-300')).toHaveLength(3);
  });

  it('applies custom className', () => {
    render(<Loading className="custom-loading" />);
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('custom-loading');
  });

  it('renders without text when text is empty', () => {
    render(<Loading text="" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});