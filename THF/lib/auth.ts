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

import { auth } from '@/src/services/firebaseConfig';
import { firebase } from '@react-native-firebase/auth';
import * as SecureStore from 'expo-secure-store';

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

// ─── Reset password (forgot password flow) ───────────────────────────────────

/**
 * Called in the forgot-password flow after OTP verification.
 * Re-authenticates the user with the phone credential, then updates the
 * email/password provider's password.
 *
 * @param phoneNumber    – E.164 phone number
 * @param password       – new plaintext password
 * @param verificationId – from the sendOtp() call
 * @param otp            – the 6-digit code the user entered
 */
export async function resetPasswordWithOtp(
  phoneNumber: string,
  password: string,
  verificationId: string,
  otp: string,
): Promise<void> {
  // Re-authenticate current user with the phone credential so Firebase
  // considers this a "recent" sign-in, allowing password changes.
  const phoneCredential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found. Please try again.');

  await user.reauthenticateWithCredential(phoneCredential);

  // Now update or link the email/password provider.
  const email = getHiddenEmail(phoneNumber);
  const emailCredential = firebase.auth.EmailAuthProvider.credential(email, password);

  try {
    await user.linkWithCredential(emailCredential);
  } catch (error: any) {
    if (
      error.code === 'auth/provider-already-linked' ||
      error.code === 'auth/email-already-in-use' ||
      // React Native Firebase sometimes returns auth/unknown for this case
      (error.code === 'auth/unknown' && error.message?.includes('already been linked'))
    ) {
      // Email provider exists — update the password directly.
      await user.updatePassword(password);
    } else {
      throw error;
    }
  }

  // Cache locally for fast same-device logins.
  await SecureStore.setItemAsync(getLocalPasswordKey(phoneNumber), password);
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
    // user already set a password before — update the password instead.
    // Note: React Native Firebase sometimes returns auth/unknown for this case.
    if (
      error.code === 'auth/provider-already-linked' ||
      error.code === 'auth/email-already-in-use' ||
      (error.code === 'auth/unknown' && error.message?.includes('already been linked'))
    ) {
      // Update the existing password to the new one
      await user.updatePassword(password);
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
