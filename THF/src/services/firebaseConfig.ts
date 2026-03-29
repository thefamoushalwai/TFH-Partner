/**
 * src/services/firebaseConfig.ts
 *
 * Central Firebase initialization for the THF Partner App.
 * Initialises Firebase Auth, Firestore, and Firebase Storage
 * using the modular SDK (firebase v9+).
 *
 * Usage:
 *   import { app, db, auth, storage } from '@/src/services/firebaseConfig';
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore – getReactNativePersistence is available at runtime in React Native
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Firebase project configuration
// Extracted from google-services.json (project: tfh-partner-app)
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: 'AIzaSyARaozx4Pum4IKrO6FruKCfKSKzHfAZzGM',
  authDomain: 'tfh-partner-app.firebaseapp.com',
  projectId: 'tfh-partner-app',
  storageBucket: 'tfh-partner-app.firebasestorage.app',
  messagingSenderId: '632168932860',
  appId: '1:632168932860:android:4fdbfd531e961b95417e79',
};

// ---------------------------------------------------------------------------
// Singleton-safe app initialisation
// ---------------------------------------------------------------------------
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------
const db: Firestore = getFirestore(app);

// ---------------------------------------------------------------------------
// Auth  (with AsyncStorage persistence so tokens survive app restarts)
// ---------------------------------------------------------------------------
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Already initialised (e.g. hot-reload / fast-refresh)
  auth = getAuth(app);
}

// ---------------------------------------------------------------------------
// Firebase Storage
// ---------------------------------------------------------------------------
const storage: FirebaseStorage = getStorage(app);

export { app, db, auth, storage };
