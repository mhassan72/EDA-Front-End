import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationProvider, useNavigation } from '../NavigationContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the navigation context
const TestComponent = () => {
  const {
    state,
    setMode,
    setSession,

    updateSession,
    deleteSession,
    getCurrentSession,
    getSessionsByType,
    createNewSession,
    canGoBack,
    goBack
  } = useNavigation();
  
  return (
    <div>
      <div data-testid="current-mode">{state.currentMode}</div>
      <div data-testid="current-session">{state.currentSessionId || 'none'}</div>
      <div data-testid="sessions-count">{state.sessions.length}</div>
      <div data-testid="loading">{state.isLoading.toString()}</div>
      <div data-testid="error">{state.error || 'none'}</div>
      <div data-testid="can-go-back">{canGoBack().toString()}</div>
      
      <button onClick={() => setMode('general')}>Set General</button>
      <button onClick={() => setMode('image')}>Set Image</button>
      <button onClick={() => setMode('educational')}>Set Educational</button>
      
      <button onClick={() => createNewSession('general')}>New General Session</button>
      <button onClick={() => createNewSession('image')}>New Image Session</button>
      <button onClick={() => createNewSession('educational')}>New Educational Session</button>
      
      <button onClick={() => {
        if (state.sessions.length > 0) {
          setSession(state.sessions[0].id);
        }
      }}>Select First Session</button>
      
      <button onClick={() => {
        if (state.sessions.length > 0) {
          updateSession(state.sessions[0].id, { title: 'Updated Title' });
        }
      }}>Update First Session</button>
      
      <button onClick={() => {
        if (state.sessions.length > 0) {
          deleteSession(state.sessions[0].id);
        }
      }}>Delete First Session</button>
      
      <button onClick={goBack}>Go Back</button>
      
      <div data-testid="current-session-data">
        {getCurrentSession()?.title || 'none'}
      </div>
      
      <div data-testid="general-sessions-count">
        {getSessionsByType('general').length}
      </div>
    </div>
  );
};

describe('NavigationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides initial navigation state', () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('general');
    expect(screen.getByTestId('current-session')).toHaveTextContent('none');
    expect(screen.getByTestId('sessions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false');
  });

  it('loads persisted state from localStorage', () => {
    const persistedState = {
      currentMode: 'image',
      currentSessionId: 'session-1',
      sessions: [
        {
          id: 'session-1',
          title: 'Test Session',
          type: 'image',
          lastMessage: 'Hello',
          timestamp: '2023-01-01T00:00:00.000Z',
          isActive: true
        }
      ],
      navigationHistory: ['mode:image']
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('image');
    expect(screen.getByTestId('current-session')).toHaveTextContent('session-1');
    expect(screen.getByTestId('sessions-count')).toHaveTextContent('1');
  });

  it('changes mode and persists to localStorage', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const setImageButton = screen.getByText('Set Image');
    fireEvent.click(setImageButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('image');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'navigation-state',
      expect.stringContaining('"currentMode":"image"')
    );
  });

  it('creates new session and sets it as current', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const newGeneralButton = screen.getByText('New General Session');
    fireEvent.click(newGeneralButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('1');
      expect(screen.getByTestId('current-mode')).toHaveTextContent('general');
    });

    // Should have created a session and set it as current
    expect(screen.getByTestId('current-session')).not.toHaveTextContent('none');
    expect(screen.getByTestId('current-session-data')).toHaveTextContent('New General Chat');
  });

  it('selects existing session', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Create a session first
    const newGeneralButton = screen.getByText('New General Session');
    fireEvent.click(newGeneralButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('1');
    });

    // Create another session
    fireEvent.click(newGeneralButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('2');
    });

    // Select the first session
    const selectFirstButton = screen.getByText('Select First Session');
    fireEvent.click(selectFirstButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-session')).not.toHaveTextContent('none');
    });
  });

  it('updates session data', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Create a session first
    const newGeneralButton = screen.getByText('New General Session');
    fireEvent.click(newGeneralButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('1');
    });

    // Update the session
    const updateButton = screen.getByText('Update First Session');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-session-data')).toHaveTextContent('Updated Title');
    });
  });

  it('deletes session and updates current session', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Create two sessions
    const newGeneralButton = screen.getByText('New General Session');
    fireEvent.click(newGeneralButton);
    fireEvent.click(newGeneralButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('2');
    });

    // Delete the first session
    const deleteButton = screen.getByText('Delete First Session');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('1');
    });
  });

  it('filters sessions by type', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Create sessions of different types
    const newGeneralButton = screen.getByText('New General Session');
    const newImageButton = screen.getByText('New Image Session');
    
    fireEvent.click(newGeneralButton);
    fireEvent.click(newGeneralButton);
    fireEvent.click(newImageButton);

    await waitFor(() => {
      expect(screen.getByTestId('sessions-count')).toHaveTextContent('3');
      expect(screen.getByTestId('general-sessions-count')).toHaveTextContent('2');
    });
  });

  it('handles navigation history and back functionality', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Initially should not be able to go back
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false');

    // Change mode to create history
    const setImageButton = screen.getByText('Set Image');
    fireEvent.click(setImageButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('image');
      expect(screen.getByTestId('can-go-back')).toHaveTextContent('true');
    });

    // Go back should not work yet since we need to prevent going back to the same state
    // Let's change to educational first to create more history
    const setEducationalButton = screen.getByText('Set Educational');
    fireEvent.click(setEducationalButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('educational');
    });

    // Now go back should work
    const goBackButton = screen.getByText('Go Back');
    fireEvent.click(goBackButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('image');
    });
  });

  it('creates sessions with different types correctly', async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Create educational session
    const newEducationalButton = screen.getByText('New Educational Session');
    fireEvent.click(newEducationalButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('educational');
      expect(screen.getByTestId('current-session-data')).toHaveTextContent('New Educational Session');
    });
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    // Should not crash and should use default state
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('general');
    expect(screen.getByTestId('sessions-count')).toHaveTextContent('0');
  });

  it('throws error when useNavigation is used outside NavigationProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNavigation must be used within a NavigationProvider');
    
    consoleSpy.mockRestore();
  });
});