import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  getIdToken
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User } from '@/types';

export class AuthService {
  private static instance: AuthService;
  private currentUser: FirebaseUser | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      this.currentUser = firebaseUser;
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Attempting sign in with:', { email, authConfig: auth.config });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful:', userCredential.user.uid);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('❌ Sign in error:', { code: error.code, message: error.message, error });
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign in with email and password (alias for compatibility)
   */
  async signIn(email: string, password: string): Promise<User> {
    return this.signInWithEmail(email, password);
  }

  /**
   * Create account with email and password (alias for compatibility)
   */
  async signUp(email: string, password: string, name?: string): Promise<User> {
    return this.createAccount(email, password, name || '');
  }

  /**
   * Create account with email and password
   */
  async createAccount(email: string, password: string, name: string): Promise<User> {
    try {
      console.log('📝 Attempting sign up with:', { email, name, authConfig: auth.config });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name });
      
      console.log('✅ Sign up successful:', userCredential.user.uid);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('❌ Sign up error:', { code: error.code, message: error.message, error });
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser ? this.mapFirebaseUser(this.currentUser) : null;
  }

  /**
   * Get Firebase ID token for API calls
   */
  async getIdToken(): Promise<string | null> {
    if (!this.currentUser) return null;
    
    try {
      return await getIdToken(this.currentUser);
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to auth state changes (alias for compatibility)
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Map Firebase user to our User type
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      name: firebaseUser.displayName || undefined,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      preferences: {
        defaultTextModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        defaultVisionModel: 'google/gemma-3-27b-it',
        defaultImageModel: 'black-forest-labs/flux-schnell',
        defaultEmbeddingModel: 'BAAI/bge-en-icl',
        preferredQuality: 'standard',
        autoSelectModel: true,
        budgetLimits: {
          dailyLimit: 500,
          weeklyLimit: 2000,
          monthlyLimit: 5000,
          perRequestLimit: 100,
          alertThresholds: {
            daily: 400,
            weekly: 1600,
            monthly: 4000,
          },
        },
        modelPreferences: {
          prioritizeSpeed: true,
          prioritizeCost: false,
          prioritizeQuality: false,
        },
      },
    };
  }

  /**
   * Get user-friendly error messages
   */
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();