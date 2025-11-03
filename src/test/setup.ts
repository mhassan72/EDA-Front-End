import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('@/config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  firestore: {},
  realtimeDB: {},
}));

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, _callback) => {
    // Return unsubscribe function
    return () => {};
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  getIdToken: vi.fn(),
}));

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    img: 'img',
    input: 'input',
    form: 'form',
    section: 'section',
    article: 'article',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
  useTransform: (value: any, _input: any, _output: any) => value,
  useSpring: (value: any) => value,
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
  takeRecords() {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock services
vi.mock('@/services/auth', () => ({
  authService: {
    getCurrentUser: vi.fn(() => null),
    getIdToken: vi.fn(() => Promise.resolve('mock-token')),
    onAuthStateChanged: vi.fn(() => () => {}),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock('@/services/api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    stream: vi.fn(),
  },
}));

vi.mock('@/services/chat', () => ({
  chatService: {
    initialize: vi.fn(() => Promise.resolve()),
    sendMessage: vi.fn(),
    loadConversation: vi.fn(),
    loadMoreMessages: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
    getConnectionStatus: vi.fn(() => 'connected'),
    onConnectionStatusChange: vi.fn(() => () => {}),
    disconnect: vi.fn(),
    setStreamingOptions: vi.fn(),
  },
}));

vi.mock('@/services/websocket', () => ({
  webSocketService: {
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(),
    send: vi.fn(),
    on: vi.fn(() => () => {}),
    onConnectionStatusChange: vi.fn(() => () => {}),
    getConnectionStatus: vi.fn(() => 'connected'),
    isConnected: vi.fn(() => true),
  },
}));

vi.mock('@/services/image', () => ({
  imageService: {
    getImageModels: vi.fn(() => Promise.resolve([])),
    getUserImages: vi.fn(() => Promise.resolve({ images: [], total: 0, hasMore: false })),
    estimateCost: vi.fn(() => Promise.resolve(50)),
    generateImages: vi.fn(() => Promise.resolve({ taskId: 'mock-task-id' })),
    getTaskStatus: vi.fn(),
    getTaskResults: vi.fn(),
    deleteImage: vi.fn(),
    downloadImage: vi.fn(),
    subscribeToTaskUpdates: vi.fn(() => () => {}),
  },
}));