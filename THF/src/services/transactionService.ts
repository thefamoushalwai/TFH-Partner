/**
 * src/services/transactionService.ts
 *
 * Firestore service layer for the `transactions` collection.
 *
 * Collection:
 *   - transactions  (Document ID = auto-generated transactionId)
 */

import {
  collection,
  addDoc,
  getDocs,
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
  createdAt: Timestamp;
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
    const ref = await addDoc(collection(db, 'transactions'), {
      ...data,
      createdAt: serverTimestamp(),
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
    const q = query(
      collection(db, 'transactions'),
      where('partnerId', '==', partnerId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
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
    const q = query(
      collection(db, 'transactions'),
      where('bookingId', '==', bookingId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      transactionId: d.id,
      ...d.data(),
    })) as Transaction[];
  } catch (error) {
    console.error('[transactionService] getBookingTransactions error:', error);
    throw error;
  }
}
