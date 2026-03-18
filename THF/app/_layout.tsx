import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome/LanguageSelect" />
      <Stack.Screen name="welcome/MobileLogin" />
      <Stack.Screen name="welcome/OTP" />
      <Stack.Screen name="kyc/Details" />
      <Stack.Screen name="kyc/Experience" />
      <Stack.Screen name="kyc/Aadhar" />
      <Stack.Screen name="kyc/Selfie" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
