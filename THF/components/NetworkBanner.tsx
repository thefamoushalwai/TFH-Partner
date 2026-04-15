import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Platform,  } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "../src/hooks/useNetworkStatus";
import { Fonts } from "../src/theme/fonts";
import { CustomText as Text } from './CustomText';

/**
 * NetworkBanner
 *
 * Renders a slim, animated banner at the top of the screen whenever
 * the device is offline or on a weak connection.
 *
 * - Slides down from behind the status bar when a problem is detected
 * - Slides back up and disappears when the connection recovers
 * - No user interaction required – purely informational
 */
export default function NetworkBanner() {
  const { isOnline, isWeak } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  const showBanner = !isOnline || isWeak;

  // Decide copy and colour
  const message = !isOnline
    ? "No internet connection"
    : "Slow connection – things may take longer";

  const bannerColor = !isOnline ? "#D32F2F" : "#E65100";

  // Animated position: 0 = fully visible, -BANNER_H = hidden above screen
  const BANNER_H = 36;
  const slideY = useRef(new Animated.Value(-BANNER_H)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: showBanner ? 0 : -BANNER_H,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
  }, [showBanner]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: bannerColor,
          // Sit just below the OS status bar
          paddingTop: Platform.OS === "ios" ? insets.top : 6,
          top: 0,
          transform: [{ translateY: slideY }],
        },
      ]}
      pointerEvents="none" // Taps pass through to the app
    >
      <View style={styles.row}>
        <Text style={styles.icon}>{!isOnline ? "📵" : "📶"}</Text>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 99,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Fonts.medium,
    letterSpacing: 0.2,
  },
});
