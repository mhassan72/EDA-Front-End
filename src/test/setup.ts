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
  onAuthStateChanged: vi.fn((auth, callback) => {
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
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