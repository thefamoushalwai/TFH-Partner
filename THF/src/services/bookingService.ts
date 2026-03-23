/**
 * src/services/bookingService.ts
 *
 * Firestore service layer for the `bookings` collection.
 *
 * Collection:
 *   - bookings  (Document ID = auto-generated bookingId)
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  onSnapshot,
  type Timestamp,
  type PartialWithFieldValue,
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

// ---------------------------------------------------------------------------
// TypeScript Interface
// ---------------------------------------------------------------------------

export interface Booking {
  /** Auto-generated Firestore document ID */
  bookingId: string;
  /** Firebase Auth UID of the partner */
  partnerId: string;
  clientName: string;
  phone?: string;
  eventType: string;
  /** Date/time of the event */
  date: Timestamp;
  location: string;
  guests: number;
  /** Booking fee in INR */
  amount: number;
  status: 'broadcasted' | 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
}

// ---------------------------------------------------------------------------
// Booking helpers
// ---------------------------------------------------------------------------

/**
 * Create a new booking document in the `bookings` collection.
 * Returns the auto-generated Firestore document ID (bookingId).
 */
export async function createBooking(
  data: Omit<Booking, 'bookingId' | 'status'>,
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'bookings'), {
      ...data,
      status: 'pending',
    });
    return ref.id;
  } catch (error) {
    console.error('[bookingService] createBooking error:', error);
    throw error;
  }
}

/**
 * Fetch a single booking by its document ID.
 * Returns `null` when no document is found.
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  try {
    const ref = doc(db, 'bookings', bookingId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { bookingId: snap.id, ...snap.data() } as Booking;
  } catch (error) {
    console.error('[bookingService] getBooking error:', error);
    throw error;
  }
}

/**
 * Fetch all bookings for a given partner, ordered by date descending.
 */
export async function getPartnerBookings(partnerId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('partnerId', '==', partnerId),
      orderBy('date', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      bookingId: d.id,
      ...d.data(),
    })) as Booking[];
  } catch (error) {
    console.error('[bookingService] getPartnerBookings error:', error);
    throw error;
  }
}

/**
 * Update the status (and optionally other fields) of an existing booking.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
  extra?: PartialWithFieldValue<Omit<Booking, 'bookingId' | 'status'>>,
): Promise<void> {
  try {
    const ref = doc(db, 'bookings', bookingId);
    await updateDoc(ref, { status, ...(extra ?? {}) });
  } catch (error) {
    console.error('[bookingService] updateBookingStatus error:', error);
    throw error;
  }
}

/**
 * Listen to broadcasted bookings (status: 'broadcasted')
 */
export function listenToBroadcastedBookings(callback: (bookings: Booking[]) => void): () => void {
  console.log('[bookingService] Setting up broadcast listener, uid:', auth.currentUser?.uid);
  
  const q = query(collection(db, 'bookings'), where('status', '==', 'broadcasted'));
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map((d) => ({
      bookingId: d.id,
      ...d.data(),
    })) as Booking[];
    console.log('[bookingService] Broadcast bookings received:', bookings.length);
    callback(bookings);
  }, (error) => {
    console.error('[bookingService] broadcast listener error:', error.code, error.message);
    // Log the error for debugging
    if (error.code === 'permission-denied') {
      console.warn('[bookingService] Permission denied - check Firestore rules in Firebase Console');
    }
  });
}

/**
 * Try to accept a broadcasted booking via transaction to ensure only one partner succeeds.
 * @throws Error if already accepted by someone else.
 */
export async function acceptBroadcastedBooking(bookingId: string, partnerId: string): Promise<void> {
  try {
    const ref = doc(db, 'bookings', bookingId);
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(ref);
      if (!sfDoc.exists()) {
        throw new Error("Booking does not exist!");
      }
      const data = sfDoc.data() as Booking;
      if (data.status !== "broadcasted") {
        throw new Error("This booking has already been claimed.");
      }
      transaction.update(ref, { status: "active", partnerId });
    });
  } catch (error) {
    console.error('[bookingService] acceptBroadcastedBooking error:', error);
    throw error;
  }
}
