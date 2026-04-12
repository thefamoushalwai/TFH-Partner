/**
 * src/utils/profileUtils.ts
 *
 * Single source of truth for profile completion checks.
 * Replaces the 3 inconsistent local definitions in MobileLogin, OTP, and password screens.
 *
 * Decision: We match the index.tsx approach — if a profile document exists at all
 * in Firestore, the user has already gone through onboarding.
 * The strict field-by-field check was causing routing loops because not every
 * onboarding path fills all fields (e.g. email, emergencyPhone can be empty
 * if the user skipped certain steps).
 */

import type { UserProfile } from '@/src/services/userService';

/**
 * Returns `true` when the user's Firestore profile indicates they have
 * completed the initial onboarding flow and should land on the Dashboard.
 *
 * A `null` profile means the user has never started onboarding.
 */
export function hasCompletedProfile(
  profile: UserProfile | null | undefined,
): boolean {
  return profile !== null && profile !== undefined;
}
