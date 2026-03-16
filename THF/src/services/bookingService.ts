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
  type Timestamp,
  type PartialWithFieldValue,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ---------------------------------------------------------------------------
// TypeScript Interface
// ---------------------------------------------------------------------------

export interface Booking {
  /** Auto-generated Firestore document ID */
  bookingId: string;
  /** Firebase Auth UID of the partner */
  partnerId: string;
  clientName: string;
  eventType: string;
  /** Date/time of the event */
  date: Timestamp;
  location: string;
  guests: number;
  /** Booking fee in INR */
  amount: number;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
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
