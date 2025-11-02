import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '@/services/auth';
import { User } from '@/types';

// Mock the auth service
vi.mock('@/services/auth');

const mockUser: User = {
  uid: 'test-uid',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  preferences: {
    defaultTextModel: 'test-model',
    defaultVisionModel: 'test-vision',
    defaultImageModel: 'test-image',
    defaultEmbeddingModel: 'test-embedding',
    preferredQuality: 'standard',
    autoSelectModel: true,
    budgetLimits: {
      dailyLimit: 100,
      weeklyLimit: 500,
      monthlyLimit: 2000,
      perRequestLimit: 50,
      alertThresholds: {
        daily: 80,
        weekly: 400,
        monthly: 1600,
      },
    },
    modelPreferences: {
      prioritizeSpeed: true,
      prioritizeCost: false,
      prioritizeQuality: false,
    },
  },
};

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, isAuthenticated, signIn, signUp, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial auth state', async () => {
    const mockOnAuthStateChange = vi.fn((callback) => {
      callback(null);
      return () => {};
    });
    
    vi.mocked(authService.onAuthStateChange).mockImplementation(mockOnAuthStateChange);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('updates state when user signs in', async () => {
    const mockOnAuthStateChange = vi.fn((callback) => {
      callback(mockUser);
      return () => {};
    });
    
    vi.mocked(authService.onAuthStateChange).mockImplementation(mockOnAuthStateChange);
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('calls authService.signInWithEmail when signIn is called', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(mockUser);
    vi.mocked(authService.signInWithEmail).mockImplementation(mockSignIn);
    
    const mockOnAuthStateChange = vi.fn((callback) => {
      callback(null);
      return () => {};
    });
    vi.mocked(authService.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    signInButton.click();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  it('calls authService.createAccount when signUp is called', async () => {
    const mockSignUp = vi.fn().mockResolvedValue(mockUser);
    vi.mocked(authService.createAccount).mockImplementation(mockSignUp);
    
    const mockOnAuthStateChange = vi.fn((callback) => {
      callback(null);
      return () => {};
    });
    vi.mocked(authService.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = screen.getByText('Sign Up');
    signUpButton.click();

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User');
    });
  });

  it('calls authService.signOut when signOut is called', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authService.signOut).mockImplementation(mockSignOut);
    
    const mockOnAuthStateChange = vi.fn((callback) => {
      callback(mockUser);
      return () => {};
    });
    vi.mocked(authService.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByText('Sign Out');
    signOutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});