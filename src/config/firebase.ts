import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo-app-id",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com"
};





// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDB = getDatabase(app);

// Connect to emulators in development
console.log('Environment check:', {
  DEV: import.meta.env.DEV,
  USE_EMULATORS: import.meta.env.VITE_USE_EMULATORS,
  PROJECT_ID: firebaseConfig.projectId
});

if (import.meta.env.DEV || import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    console.log('✅ Connected to Auth emulator at http://127.0.0.1:9099');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    console.log('✅ Connected to Firestore emulator at 127.0.0.1:8080');
    
    // Connect to Realtime Database emulator
    connectDatabaseEmulator(realtimeDB, '127.0.0.1', 9000);
    console.log('✅ Connected to Realtime Database emulator at 127.0.0.1:9000');
  } catch (error) {
    // Emulators might already be connected, ignore the error
    console.error('❌ Firebase emulators connection error:', error);
  }
} else {
  console.log('🔴 Not connecting to emulators - production mode');
}

export default app;