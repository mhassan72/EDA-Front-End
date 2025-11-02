import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('react-hot-toast');

const mockUseAuth = {
  signIn: vi.fn(),
  loading: false,
};

describe('LoginForm', () => {
  const mockOnSwitchToRegister = vi.fn();
  const mockOnForgotPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockUseAuth as any);
  });

  it('renders login form with all fields', () => {
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(mockUseAuth.signIn).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText('Password');
    
    // Type invalid email and valid password
    await user.type(emailInput, 'notanemail');
    await user.type(passwordInput, 'password123');
    
    // Submit the form directly to bypass HTML5 validation
    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Wait for validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Ensure signIn was not called due to validation failure
    expect(mockUseAuth.signIn).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(mockUseAuth.signIn).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockUseAuth.signIn.mockResolvedValue({});
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUseAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    expect(toast.success).toHaveBeenCalledWith('Welcome back!');
  });

  it('handles sign in error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockUseAuth.signIn.mockRejectedValue(new Error(errorMessage));
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('calls onForgotPassword when forgot password link is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const forgotPasswordLink = screen.getByText(/forgot your password/i);
    await user.click(forgotPasswordLink);

    expect(mockOnForgotPassword).toHaveBeenCalled();
  });

  it('calls onSwitchToRegister when register link is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const registerLink = screen.getByText(/don't have an account/i);
    await user.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('disables form when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockUseAuth,
      loading: true,
    } as any);
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: '' })).toBeDisabled();
  });

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup();
    
    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onForgotPassword={mockOnForgotPassword}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Trigger validation error
    await user.click(submitButton);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Start typing to clear error
    await user.type(emailInput, 'test');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });
});