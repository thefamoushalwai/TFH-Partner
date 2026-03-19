/**
 * src/services/userService.ts
 *
 * Firestore service layer for the `users` and `kyc` collections.
 *
 * Collections:
 *   - users  (Document ID = userId / Firebase Auth UID)
 *   - kyc    (Document ID = userId / Firebase Auth UID)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  type PartialWithFieldValue,
  type Timestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface UserProfile {
  /** Firebase Auth UID — also the Firestore document ID */
  userId: string;
  name: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  gender: 'male' | 'female' | 'other';
  city: string;
  address: string;
  /** List of experience tags, e.g. ["Wedding", "Corporate"] */
  experience: string[];
  language: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface KycDocument {
  /** Firebase Auth UID — also the Firestore document ID */
  userId: string;
  /** Download URL of the uploaded Aadhaar image */
  aadharUrl: string;
  /** Download URL of the uploaded selfie image */
  selfieUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  verifiedAt: Timestamp | null;
}

// ---------------------------------------------------------------------------
// User helpers
// ---------------------------------------------------------------------------

/**
 * Create a new user profile document in the `users` collection.
 * Throws if the document already exists (use updateUserProfile to patch).
 */
export async function createUserProfile(
  userId: string,
  data: Omit<UserProfile, 'userId' | 'createdAt' | 'kycStatus'>,
): Promise<void> {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, {
    ...data,
    userId,
    kycStatus: 'pending',
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch a user profile from the `users` collection.
 * Returns `null` when no document is found.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { userId: snap.id, ...snap.data() } as UserProfile;
  } catch (error) {
    console.error('[userService] getUserProfile error:', error);
    throw error;
  }
}

/**
 * Find user profile by phone number (E.164), e.g. +919205394233.
 * Returns the first matching profile or null.
 */
export async function getUserProfileByPhone(phone: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const docSnap = snap.docs[0];
    return { userId: docSnap.id, ...docSnap.data() } as UserProfile;
  } catch (error) {
    console.error('[userService] getUserProfileByPhone error:', error);
    throw error;
  }
}

/**
 * Partially update an existing user profile.
 * Only the provided fields are written; all others remain unchanged.
 */
export async function updateUserProfile(
  userId: string,
  data: PartialWithFieldValue<
    Omit<UserProfile, 'userId' | 'createdAt'>
  >,
): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, data as Record<string, unknown>, { merge: true });
  } catch (error) {
    console.error('[userService] updateUserProfile error:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// KYC helpers
// ---------------------------------------------------------------------------

/**
 * Submit a KYC document for a partner.
 * Creates or overwrites the `kyc/{userId}` document and resets
 * the partner's `kycStatus` to "pending".
 */
export async function submitKYC(
  userId: string,
  data: Pick<KycDocument, 'aadharUrl' | 'selfieUrl'>,
): Promise<void> {
  try {
    // Write KYC document
    const kycRef = doc(db, 'kyc', userId);
    await setDoc(kycRef, {
      ...data,
      userId,
      status: 'pending',
      submittedAt: serverTimestamp(),
      verifiedAt: null,
    });

    // Reset partner's kycStatus to "pending"
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { kycStatus: 'pending' }, { merge: true });
  } catch (error) {
    console.error('[userService] submitKYC error:', error);
    throw error;
  }
}

/**
 * Fetch a KYC document for the given user.
 * Returns `null` when no document is found.
 */
export async function getKYC(userId: string): Promise<KycDocument | null> {
  try {
    const ref = doc(db, 'kyc', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { userId: snap.id, ...snap.data() } as KycDocument;
  } catch (error) {
    console.error('[userService] getKYC error:', error);
    throw error;
  }
}
