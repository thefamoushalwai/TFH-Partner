/**
 * src/services/firebaseConfig.ts
 *
 * Central Firebase initialization for the THF Partner App.
 * Uses @react-native-firebase (Native SDK) exclusively.
 *
 * The native SDK auto-initializes from google-services.json (Android)
 * and GoogleService-Info.plist (iOS), so no manual config object is needed.
 *
 * Usage:
 *   import { db, auth, storage } from '@/src/services/firebaseConfig';
 */

import firestore from '@react-native-firebase/firestore';
import authModule from '@react-native-firebase/auth';
import storageModule from '@react-native-firebase/storage';

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------
const db = firestore();

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const auth = authModule();

// ---------------------------------------------------------------------------
// Firebase Storage
// ---------------------------------------------------------------------------
const storage = storageModule();

export { db, auth, storage };
