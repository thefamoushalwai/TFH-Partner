// lib/auth.ts
// Firebase Phone-Auth helpers for OTP login
// Uses Firebase Identity Toolkit REST API directly — no reCAPTCHA UI needed.

import {
  PhoneAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

// Firebase Web API key
const FIREBASE_API_KEY = 'AIzaSyARaozx4Pum4IKrO6FruKCfKSKzHfAZzGM';

// Android package name (from app.json) — tells Firebase to verify via SMS,
// bypassing browser-based reCAPTCHA entirely.
const ANDROID_PACKAGE_NAME = 'com.tfh.app';

/**
 * Send an OTP to the given phone number.
 * Calls Firebase Identity Toolkit REST API directly — no reCAPTCHA needed.
 *
 * @param phoneNumber – full E.164 format, e.g. "+919205394233"
 * @returns verificationId (sessionInfo) needed later to confirm the OTP
 */
export async function sendOtp(phoneNumber: string): Promise<string> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber,
      androidPackageName: ANDROID_PACKAGE_NAME,
      androidInstallApp: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message ?? 'Failed to send OTP';
    throw new Error(msg);
  }

  // sessionInfo is used as the verificationId
  return data.sessionInfo as string;
}

/**
 * Verify the 6-digit OTP the user entered.
 *
 * @param verificationId – returned by `sendOtp`
 * @param otp            – the 6-digit code entered by the user
 * @returns the signed-in Firebase User
 */
export async function verifyOtp(
  verificationId: string,
  otp: string,
): Promise<User> {
  const credential = PhoneAuthProvider.credential(verificationId, otp);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

/**
 * Subscribe to auth-state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  return firebaseSignOut(auth);
}
