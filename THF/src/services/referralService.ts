/**
 * src/services/referralService.ts
 *
 * Firestore service layer for the `referrals` collection.
 *
 * Collection:
 *   - referrals  (Document ID = auto-generated referralId)
 */

import {
  collection,
  addDoc,
  getDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ---------------------------------------------------------------------------
// TypeScript Interface
// ---------------------------------------------------------------------------

export interface Referral {
  /** Auto-generated Firestore document ID */
  referralId: string;
  /** Firebase Auth UID of the partner who made the referral */
  referrerId: string;
  /** Phone number of the person who was referred */
  referredPhone: string;
  /** Lifecycle state of the referral */
  status: 'pending' | 'joined' | 'rewarded';
  /** Reward amount in INR — 0 until the referral is rewarded */
  reward: number;
  createdAt: Timestamp;
}

// ---------------------------------------------------------------------------
// Referral helpers
// ---------------------------------------------------------------------------

/**
 * Create a new referral document in the `referrals` collection.
 * Status defaults to "pending" and reward to 0.
 * Returns the auto-generated Firestore document ID (referralId).
 */
export async function createReferral(
  data: Pick<Referral, 'referrerId' | 'referredPhone'>,
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'referrals'), {
      ...data,
      status: 'pending',
      reward: 0,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error('[referralService] createReferral error:', error);
    throw error;
  }
}

/**
 * Fetch a single referral document by its ID.
 * Returns `null` when no document is found.
 */
export async function getReferral(referralId: string): Promise<Referral | null> {
  try {
    const ref = doc(db, 'referrals', referralId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { referralId: snap.id, ...snap.data() } as Referral;
  } catch (error) {
    console.error('[referralService] getReferral error:', error);
    throw error;
  }
}

/**
 * Fetch all referrals created by a specific partner, ordered by creation time descending.
 */
export async function getPartnerReferrals(referrerId: string): Promise<Referral[]> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referrerId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      referralId: d.id,
      ...d.data(),
    })) as Referral[];
  } catch (error) {
    console.error('[referralService] getPartnerReferrals error:', error);
    throw error;
  }
}

/**
 * Update the status and reward amount for a referral.
 * Typically called by a backend/Cloud Function, but exposed here for admin flows.
 */
export async function updateReferralStatus(
  referralId: string,
  status: Referral['status'],
  reward?: number,
): Promise<void> {
  try {
    const ref = doc(db, 'referrals', referralId);
    await updateDoc(ref, {
      status,
      ...(reward !== undefined ? { reward } : {}),
    });
  } catch (error) {
    console.error('[referralService] updateReferralStatus error:', error);
    throw error;
  }
}

/**
 * Check whether a phone number has already been referred (any status).
 * Useful for preventing duplicate referrals.
 */
export async function isPhoneAlreadyReferred(
  referredPhone: string,
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referredPhone', '==', referredPhone),
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error('[referralService] isPhoneAlreadyReferred error:', error);
    throw error;
  }
}
