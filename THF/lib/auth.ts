// lib/auth.ts
// Firebase Phone-Auth helpers for OTP signup + password login.
//
// Strategy: "Email/Password provider linking"
//   Signup → After OTP, link an EmailAuthProvider credential to the Phone user.
//   Login  → signInWithEmailAndPassword using a hidden derived email.
//
// Uses @react-native-firebase/auth exclusively (Native SDK).
//
// IMPORTANT: Enable "Email/Password" sign-in provider in Firebase Console:
//   Authentication → Sign-in method → Email/Password → Enable → Save
//   (Disable "Email link / passwordless" — only classic email+password is needed)

import * as SecureStore from 'expo-secure-store';
import { auth } from '@/src/services/firebaseConfig';
import { firebase } from '@react-native-firebase/auth';

// ─── OTP helpers ─────────────────────────────────────────────────────────────

/**
 * Send an OTP to the given phone number using the native Firebase SDK.
 * Uses @react-native-firebase/auth which handles SafetyNet/Play Integrity automatically.
 * @param phoneNumber – E.164 format, e.g. "+919205394233"
 * @returns verificationId
 */
export async function sendOtp(phoneNumber: string): Promise<string> {
  const confirmation = await auth.signInWithPhoneNumber(phoneNumber);
  if (!confirmation.verificationId) {
    throw new Error('Failed to get verification ID. Please try again.');
  }
  return confirmation.verificationId;
}

/**
 * Verify the 6-digit OTP and sign in with Firebase Phone Auth.
 * Uses only the Native SDK — no more Web SDK syncing needed.
 */
export async function verifyOtp(verificationId: string, otp: string) {
  const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
  const result = await auth.signInWithCredential(credential);
  return result.user;
}

// ─── Auth state ───────────────────────────────────────────────────────────────

export function onAuthChange(callback: (user: FirebaseAuthTypes.User | null) => void) {
  return auth.onAuthStateChanged(callback);
}

export async function signOut() {
  return auth.signOut();
}

// ─── Phone ↔ Email mapping ────────────────────────────────────────────────────

function normalizePhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

/** Derives a hidden email from the phone number, e.g. "919205394233@tfh-partner.app" */
function getHiddenEmail(phoneNumber: string): string {
  return `${normalizePhone(phoneNumber)}@tfh-partner.app`;
}

function getLocalPasswordKey(phoneNumber: string): string {
  return `auth_pw_${normalizePhone(phoneNumber)}`;
}

// ─── Signup: link email+password to the existing Phone Auth user ─────────────

/**
 * Called after OTP signup to create a password.
 * Links an Email/Password credential to the already signed-in Phone user.
 * This allows future cross-device logins without OTP.
 *
 * Requires "Email/Password" provider to be enabled in Firebase Console.
 *
 * @param phoneNumber – E.164 phone number
 * @param password    – plaintext password chosen by user
 */
export async function savePhonePassword(
  phoneNumber: string,
  password: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated. Please complete OTP verification first.');

  const email = getHiddenEmail(phoneNumber);
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);

  try {
    await user.linkWithCredential(credential);
  } catch (error: any) {
    // auth/provider-already-linked or auth/email-already-in-use means
    // user already set a password before — treat as success so they can
    // update their password via the profile settings screen later.
    if (
      error.code === 'auth/provider-already-linked' ||
      error.code === 'auth/email-already-in-use'
    ) {
      // Already linked, which is fine.
    } else {
      throw error;
    }
  }

  // Cache locally for fast same-device checks
  await SecureStore.setItemAsync(getLocalPasswordKey(phoneNumber), password);
}

// ─── Login: signIn with derived email + password ──────────────────────────────

/**
 * Login using phone + password.
 * No prior Firebase Auth session needed — works on any device.
 * Uses the hidden email derived from the phone number.
 *
 * Requires "Email/Password" provider to be enabled in Firebase Console.
 */
export async function loginWithPhonePassword(
  phoneNumber: string,
  password: string,
): Promise<{ uid: string; phoneNumber: string }> {
  const email = getHiddenEmail(phoneNumber);

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);

    // Refresh local cache
    await SecureStore.setItemAsync(getLocalPasswordKey(phoneNumber), password);

    return {
      uid: cred.user.uid,
      phoneNumber: cred.user.phoneNumber || phoneNumber,
    };
  } catch (error: any) {
    console.error('Email sign-in failed:', error.code, error.message);
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Invalid mobile number or password.');
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Login with password is not configured yet. Please contact support.',
      );
    }
    throw new Error('Login failed. Please try again.');
  }
}

// Re-export the FirebaseAuthTypes namespace for use elsewhere
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
export type { FirebaseAuthTypes };
