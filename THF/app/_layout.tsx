import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useCallback } from "react";
import type { EventSubscription } from "expo-modules-core";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { View } from "react-native";
import NetworkBanner from "../components/NetworkBanner";

// ── Keep the splash screen visible until fonts are ready ──
SplashScreen.preventAutoHideAsync();

// ── Configure how notifications appear when app is in the FOREGROUND ──
// This MUST be at the top level so it runs as soon as the app loads,
// regardless of which screen the user is on.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // When a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[layout] Notification received:', notification.request.content);
      }
    );

    // When user taps a notification, navigate to Dashboard
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[layout] Notification tapped, data:', data);
        router.push("/(tabs)/Dashboard");
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Don't render anything until fonts are loaded (or errored)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* ── Global network banner – overlays every screen ── */}
      <NetworkBanner />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome/LanguageSelect" />
        <Stack.Screen name="welcome/MobileLogin" />
        <Stack.Screen name="welcome/OTP" />
        <Stack.Screen name="welcome/password" />
        <Stack.Screen name="welcome/ForgotPassword" />
        <Stack.Screen name="kyc/Details" />
        <Stack.Screen name="kyc/Experience" />
        <Stack.Screen name="kyc/Aadhar" />
        <Stack.Screen name="kyc/Selfie" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
