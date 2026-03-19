import { onAuthChange } from '@/lib/auth';
import { auth } from '@/src/services/firebaseConfig';
import { clearSession, getSession } from '@/src/services/sessionStorage';
import { getUserProfile } from '@/src/services/userService';
import { useRouter } from 'expo-router';
import type { User } from 'firebase/auth';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const hasCompletedProfile = (profile: Awaited<ReturnType<typeof getUserProfile>>): boolean => {
    if (!profile) return false;
    return Boolean(
      profile.name?.trim() &&
      profile.email?.trim() &&
      profile.phone?.trim() &&
      profile.emergencyPhone?.trim() &&
      profile.gender?.trim() &&
      profile.city?.trim() &&
      profile.address?.trim() &&
      Array.isArray(profile.experience) &&
      profile.experience.length > 0,
    );
  };

  useEffect(() => {
    let mounted = true;

    const waitForAuthUser = async () => {
      if (auth.currentUser) return auth.currentUser;

      return await new Promise<User | null>((resolve) => {
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
        }, 1500);
      });
    };

    const resolveNextRoute = async () => {
      try {
        const session = await getSession();
        if (!session?.isLoggedIn) {
          router.replace('/welcome/LanguageSelect');
          return;
        }

        const user = await waitForAuthUser();
        if (!user || user.uid !== session.uid) {
          await clearSession();
          router.replace('/welcome/LanguageSelect');
          return;
        }

        const profile = await getUserProfile(user.uid);
        if (hasCompletedProfile(profile)) {
          router.replace('/(tabs)/Dashboard');
        } else {
          router.replace('/kyc/Experience');
        }
      } catch {
        await clearSession();
        router.replace('/welcome/LanguageSelect');
      }
    };

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!mounted) return;
      resolveNextRoute();
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Hero Image — takes up top ~65% */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/THF/spash_screen.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Bottom Curved Card */}
      <Image
        source={require('../assets/THF/spash_bottom.png')}
        style={[
          styles.bottomCard,
        ]}
      />
      {/* Brand Row */}
      <View style={styles.brandRow}>
        <Image
          source={require('../assets/THF/t_logo.png')}
          style={styles.logoImage}
          resizeMode="cover"
        />
        <Text style={styles.tagline}>
          Welcome to TFH partner app,{'\n'}complete your detail & join our family
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  imageContainer: {
    width: '100%',
    height: height * 0.72,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottomCard: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  brandRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  logoImage: {
    width: 122,
    height: 44,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
