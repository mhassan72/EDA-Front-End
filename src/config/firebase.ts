import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDB = getDatabase(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    
    // Check if Firestore emulator is not already connected
    if (!(firestore as any)._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
    
    // Check if Realtime Database emulator is not already connected
    if (!realtimeDB.app.options.databaseURL?.includes('localhost')) {
      connectDatabaseEmulator(realtimeDB, 'localhost', 9000);
    }
  } catch (error) {
    // Emulators might already be connected, ignore the error
    console.log('Firebase emulators already connected or not available');
  }
}

export default app;