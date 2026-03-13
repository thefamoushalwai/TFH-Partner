// lib/firebase.ts
// Central Firebase initialization — import { app, db, auth } from '@/lib/firebase'

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore – available at runtime in React-Native
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
 * Firebase configuration extracted from google-services.json
 * Project: tfh-partner-app
 */
const firebaseConfig = {
  apiKey: 'AIzaSyARaozx4Pum4IKrO6FruKCfKSKzHfAZzGM',
  authDomain: 'tfh-partner-app.firebaseapp.com',
  projectId: 'tfh-partner-app',
  storageBucket: 'tfh-partner-app.firebasestorage.app',
  messagingSenderId: '632168932860',
  appId: '1:632168932860:android:aed5011264e6fb30417e79',
};

/* ── Initialise (singleton-safe) ── */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* ── Firestore ── */
const db = getFirestore(app);

/* ── Auth (with AsyncStorage persistence for React Native) ── */
let auth: ReturnType<typeof initializeAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Auth was already initialised (hot reload / fast-refresh)
  auth = getAuth(app);
}

export { app, db, auth };
