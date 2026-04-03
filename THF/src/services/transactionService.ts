/**
 * src/services/transactionService.ts
 *
 * Firestore service layer for the `transactions` collection.
 * Uses @react-native-firebase/firestore (Native SDK).
 *
 * Collection:
 *   - transactions  (Document ID = auto-generated transactionId)
 */

import { db } from './firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ---------------------------------------------------------------------------
// TypeScript Interface
// ---------------------------------------------------------------------------

export interface Transaction {
  /** Auto-generated Firestore document ID */
  transactionId: string;
  /** Firebase Auth UID of the partner who received the payment */
  partnerId: string;
  /** Reference to the associated booking */
  bookingId: string;
  /** Amount in INR */
  amount: number;
  /** Transaction category — currently only "booking" */
  type: 'booking';
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

// ---------------------------------------------------------------------------
// Transaction helpers
// ---------------------------------------------------------------------------

/**
 * Record a new transaction document in the `transactions` collection.
 * Uses serverTimestamp() for `createdAt` — never rely on client clocks.
 * Returns the auto-generated Firestore document ID (transactionId).
 */
export async function addTransaction(
  data: Omit<Transaction, 'transactionId' | 'createdAt'>,
): Promise<string> {
  try {
    const ref = await db.collection('transactions').add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error('[transactionService] addTransaction error:', error);
    throw error;
  }
}

/**
 * Fetch all transactions for a given partner, ordered by creation time descending.
 */
export async function getPartnerTransactions(
  partnerId: string,
): Promise<Transaction[]> {
  try {
    const snap = await db
      .collection('transactions')
      .where('partnerId', '==', partnerId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map((d) => ({
      transactionId: d.id,
      ...d.data(),
    })) as Transaction[];
  } catch (error) {
    console.error('[transactionService] getPartnerTransactions error:', error);
    throw error;
  }
}

/**
 * Fetch all transactions linked to a specific booking.
 * Useful when you need to verify payment history for a booking.
 */
export async function getBookingTransactions(
  bookingId: string,
): Promise<Transaction[]> {
  try {
    const snap = await db
      .collection('transactions')
      .where('bookingId', '==', bookingId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map((d) => ({
      transactionId: d.id,
      ...d.data(),
    })) as Transaction[];
  } catch (error) {
    console.error('[transactionService] getBookingTransactions error:', error);
    throw error;
  }
}
