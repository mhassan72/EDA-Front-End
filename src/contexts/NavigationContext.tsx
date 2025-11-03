import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export type ChatMode = 'general' | 'image' | 'educational';

export interface ChatSession {
  id: string;
  title: string;
  type: ChatMode;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface NavigationState {
  currentMode: ChatMode;
  currentSessionId: string | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  navigationHistory: string[];
}

export type NavigationAction =
  | { type: 'SET_MODE'; payload: ChatMode }
  | { type: 'SET_SESSION'; payload: string }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'SET_NAVIGATION_HISTORY'; payload: string[] }
  | { type: 'CLEAR_HISTORY' };

const initialState: NavigationState = {
  currentMode: 'general',
  currentSessionId: null,
  sessions: [],
  isLoading: false,
  error: null,
  navigationHistory: []
};

const navigationReducer = (state: NavigationState, action: NavigationAction): NavigationState => {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        currentMode: action.payload,
        error: null
      };

    case 'SET_SESSION':
      return {
        ...state,
        currentSessionId: action.payload,
        sessions: state.sessions.map(session => ({
          ...session,
          isActive: session.id === action.payload
        })),
        error: null
      };

    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSessionId: action.payload.id,
        error: null
      };

    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        ),
        error: null
      };

    case 'DELETE_SESSION':
      const filteredSessions = state.sessions.filter(session => session.id !== action.payload);
      const newCurrentSessionId = state.currentSessionId === action.payload 
        ? (filteredSessions.length > 0 ? filteredSessions[0].id : null)
        : state.currentSessionId;

      return {
        ...state,
        sessions: filteredSessions,
        currentSessionId: newCurrentSessionId,
        error: null
      };

    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        navigationHistory: [
          action.payload,
          ...state.navigationHistory.filter(item => item !== action.payload)
        ].slice(0, 10) // Keep only last 10 items
      };

    case 'SET_NAVIGATION_HISTORY':
      return {
        ...state,
        navigationHistory: action.payload
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        navigationHistory: []
      };

    default:
      return state;
  }
};

export interface NavigationContextValue {
  state: NavigationState;
  setMode: (mode: ChatMode) => void;
  setSession: (sessionId: string) => void;
  addSession: (session: Omit<ChatSession, 'id' | 'timestamp'>) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  deleteSession: (id: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentSession: () => ChatSession | null;
  getSessionsByType: (type: ChatMode) => ChatSession[];
  createNewSession: (type: ChatMode) => void;
  canGoBack: () => boolean;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export interface NavigationProviderProps {
  children: React.ReactNode;
  persistKey?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  persistKey = 'navigation-state'
}) => {
  const [state, dispatch] = useReducer(navigationReducer, initialState, (initial) => {
    // Load persisted state from localStorage
    if (typeof window !== 'undefined') {
      try {
        const persisted = localStorage.getItem(persistKey);
        if (persisted) {
          const parsed = JSON.parse(persisted);
          return {
            ...initial,
            ...parsed,
            sessions: parsed.sessions?.map((session: any) => ({
              ...session,
              timestamp: new Date(session.timestamp)
            })) || [],
            isLoading: false,
            error: null
          };
        }
      } catch (error) {
        console.warn('Failed to load persisted navigation state:', error);
      }
    }
    return initial;
  });

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stateToPersist = {
          currentMode: state.currentMode,
          currentSessionId: state.currentSessionId,
          sessions: state.sessions,
          navigationHistory: state.navigationHistory
        };
        localStorage.setItem(persistKey, JSON.stringify(stateToPersist));
      } catch (error) {
        console.warn('Failed to persist navigation state:', error);
      }
    }
  }, [state.currentMode, state.currentSessionId, state.sessions, state.navigationHistory, persistKey]);

  const setMode = useCallback((mode: ChatMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    dispatch({ type: 'ADD_TO_HISTORY', payload: `mode:${mode}` });
  }, []);

  const setSession = useCallback((sessionId: string) => {
    dispatch({ type: 'SET_SESSION', payload: sessionId });
    dispatch({ type: 'ADD_TO_HISTORY', payload: `session:${sessionId}` });
  }, []);

  const addSession = useCallback((sessionData: Omit<ChatSession, 'id' | 'timestamp'>) => {
    const newSession: ChatSession = {
      ...sessionData,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isActive: true
    };
    dispatch({ type: 'ADD_SESSION', payload: newSession });
    dispatch({ type: 'ADD_TO_HISTORY', payload: `session:${newSession.id}` });
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    dispatch({ type: 'UPDATE_SESSION', payload: { id, updates } });
  }, []);

  const deleteSession = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: id });
  }, []);

  const setSessions = useCallback((sessions: ChatSession[]) => {
    dispatch({ type: 'SET_SESSIONS', payload: sessions });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const getCurrentSession = useCallback(() => {
    return state.sessions.find(session => session.id === state.currentSessionId) || null;
  }, [state.sessions, state.currentSessionId]);

  const getSessionsByType = useCallback((type: ChatMode) => {
    return state.sessions.filter(session => session.type === type);
  }, [state.sessions]);

  const createNewSession = useCallback((type: ChatMode) => {
    const modeLabels = {
      general: 'General Chat',
      image: 'Image Generation',
      educational: 'Educational Session'
    };

    addSession({
      title: `New ${modeLabels[type]}`,
      type,
      lastMessage: 'Start a new conversation...'
    });
    
    setMode(type);
  }, [addSession, setMode]);

  const canGoBack = useCallback(() => {
    return state.navigationHistory.length > 0;
  }, [state.navigationHistory]);

  const goBack = useCallback(() => {
    if (state.navigationHistory.length > 0) {
      // Remove current item and get the previous one
      const newHistory = [...state.navigationHistory];
      newHistory.shift(); // Remove current
      
      if (newHistory.length > 0) {
        const previous = newHistory[0];
        const [type, id] = previous.split(':');
        
        // Update history first to avoid infinite loop
        dispatch({ type: 'SET_NAVIGATION_HISTORY', payload: newHistory });
        
        if (type === 'mode') {
          dispatch({ type: 'SET_MODE', payload: id as ChatMode });
        } else if (type === 'session') {
          dispatch({ type: 'SET_SESSION', payload: id });
        }
      }
    }
  }, [state.navigationHistory]);

  const contextValue: NavigationContextValue = {
    state,
    setMode,
    setSession,
    addSession,
    updateSession,
    deleteSession,
    setSessions,
    setLoading,
    setError,
    getCurrentSession,
    getSessionsByType,
    createNewSession,
    canGoBack,
    goBack
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};