import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('shows error state correctly', () => {
    render(<Input error="This field is required" />);
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText('This field is required');
    
    expect(input).toHaveClass('border-red-300');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    expect(screen.getByTestId('error-icon')).toBeInTheDocument(); // Error icon
  });

  it('shows success state correctly', () => {
    render(<Input success="Valid input" />);
    const input = screen.getByRole('textbox');
    const successMessage = screen.getByText('Valid input');
    
    expect(input).toHaveClass('border-green-300');
    expect(successMessage).toBeInTheDocument();
    expect(successMessage).toHaveClass('text-green-600');
    expect(screen.getByTestId('success-icon')).toBeInTheDocument(); // Success icon
  });

  it('shows helper text', () => {
    render(<Input helperText="Enter your email address" />);
    const helperText = screen.getByText('Enter your email address');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');
  });

  it('applies fullWidth correctly', () => {
    render(<Input fullWidth />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full');
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('prioritizes error over success', () => {
    render(<Input error="Error message" success="Success message" />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('border-red-300');
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });
});