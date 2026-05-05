import { onAuthChange } from '@/lib/auth';
import { auth } from '@/src/services/firebaseConfig';
import { clearSession, getSession } from '@/src/services/sessionStorage';
import { getUserProfile } from '@/src/services/userService';
import { hasCompletedProfile } from '@/src/utils/profileUtils';
import {
  getActiveTimerBookingId,
  loadTimerJobParams,
} from '@/src/utils/timerStorage';
import { useRouter } from 'expo-router';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const waitForAuthUser = async () => {
      if (auth.currentUser) return auth.currentUser;

      return await new Promise<FirebaseAuthTypes.User | null>((resolve) => {
        let settled = false;
        const unsubscribe = onAuthChange((user) => {
          if (!settled) {
            settled = true;
            unsubscribe();
            resolve(user);
          }
        });

        setTimeout(() => {
          if (!settled) {
            settled = true;
            unsubscribe();
            resolve(auth.currentUser);
          }
        }, 1500); // Wait up to 1.5s for auth state to resolve
      });
    };

    const resolveNextRoute = async () => {
      try {
        const session = await getSession();
        if (!session?.isLoggedIn) {
          if (mounted) router.replace('/welcome/LanguageSelect');
          return;
        }

        const user = await waitForAuthUser();
        if (!user || user.uid !== session.uid) {
          await clearSession();
          if (mounted) router.replace('/welcome/LanguageSelect');
          return;
        }

        const profile = await getUserProfile(user.uid);
        // Only route to Dashboard when ALL mandatory onboarding fields are filled.
        if (!hasCompletedProfile(profile)) {
          if (mounted) router.replace('/kyc/JobPreference');
          return;
        }

        // Timer resume logic
        const activeBookingId = await getActiveTimerBookingId();
        if (activeBookingId) {
          const jobParams = await loadTimerJobParams(activeBookingId);
          if (mounted) router.replace({
            pathname: '/edit/JobTimer' as any,
            params: {
              bookingId: activeBookingId,
              title: jobParams?.title ?? '',
              time: jobParams?.time ?? '',
              location: jobParams?.location ?? '',
              guests: jobParams?.guests ?? '0',
              cuisine: jobParams?.cuisine ?? '',
            },
          });
          return;
        }

        if (mounted) router.replace('/(tabs)/Dashboard');
      } catch {
        await clearSession();
        if (mounted) router.replace('/welcome/LanguageSelect');
      }
    };

    resolveNextRoute();

    return () => {
      mounted = false;
    };
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EA243F', // Matches the brand color while transitioning
  },
});
