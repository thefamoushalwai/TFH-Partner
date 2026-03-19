import { savePhonePassword } from '@/lib/auth';
import { auth } from '@/src/services/firebaseConfig';
import { saveSession } from '@/src/services/sessionStorage';
import { getUserProfile } from '@/src/services/userService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple SVG-like icons using Text (for portability without extra deps)


const CheckCircleIcon = ({ checked }: { checked: boolean }) => (
  <View
    style={[
      styles.checkIcon,
      checked ? styles.checkIconActive : styles.checkIconInactive,
    ]}
  >
    {checked && <Text style={styles.checkMark}>✓</Text>}
  </View>
);

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  {
    label: 'Upper & lowercase characters',
    test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw),
  },
  { label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
];

const getStrengthWidth = (password: string): number => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  return (passed / PASSWORD_RULES.length) * 100;
};

const getStrengthColor = (password: string): string => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return '#EF4444';
  if (passed === 1) return '#EF4444';
  if (passed === 2) return '#F59E0B';
  return '#22C55E';
};

export default function CreatePasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber?: string }>();
  const phoneNumber = params.phoneNumber ?? auth.currentUser?.phoneNumber ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canContinue = allRulesPassed && passwordsMatch;

  const strengthWidth = password.length > 0 ? getStrengthWidth(password) : 0;
  const strengthColor = getStrengthColor(password);

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

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is missing. Please retry signup.');
      return;
    }

    setLoading(true);
    try {
      await savePhonePassword(phoneNumber, password);

      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert('Error', 'Session expired. Please signup again.');
        return;
      }

      await saveSession({ uid, phoneNumber });

      const profile = await getUserProfile(uid);
      if (hasCompletedProfile(profile)) router.replace('/(tabs)/Dashboard');
      else router.replace('/kyc/Experience');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not save password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Create Password</Text>

        {/* Password Field */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>

        {/* Strength Bar */}
        <View style={styles.strengthBarContainer}>
          <View
            style={[
              styles.strengthBarFill,
              {
                width: `${strengthWidth}%` as any,
                backgroundColor: strengthColor,
              },
            ]}
          />
        </View>

        {/* Password Rules */}
        <Text style={styles.rulesTitle}>Your password must have:</Text>
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <View key={rule.label} style={styles.ruleRow}>
              <CheckCircleIcon checked={passed} />
              <Text
                style={[
                  styles.ruleText,
                  passed ? styles.ruleTextActive : styles.ruleTextInactive,
                ]}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}

        {/* Confirm Password Field */}
        <View style={[styles.inputWrapper, styles.inputWrapperMarginTop]}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => setShowConfirm((v) => !v)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>

        {/* Mismatch hint */}
        {confirmPassword.length > 0 && !passwordsMatch && (
          <Text style={styles.mismatchText}>Passwords do not match</Text>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, canContinue && styles.continueButtonActive]}
          activeOpacity={canContinue && !loading ? 0.8 : 1}
          disabled={!canContinue || loading}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text
              style={[
                styles.continueText,
                canContinue && styles.continueTextActive,
              ]}
            >
              Continue
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          By Clicking "Sign up", you are agree with the{'\n'}
          Tracto Healthcare{' '}
          <Text style={styles.footerLink}>Terms & conditions</Text>,{' '}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 22,
    color: '#2563EB',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 28,
    letterSpacing: -0.3,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#FAFAFA',
  },
  inputWrapperMarginTop: {
    marginTop: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
    opacity: 0.6,
  },

  // Strength bar
  strengthBarContainer: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 14,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Rules
  rulesTitle: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkIconActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkIconInactive: {
    backgroundColor: 'transparent',
    borderColor: '#D1D5DB',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  ruleText: {
    fontSize: 13,
  },
  ruleTextActive: {
    color: '#16A34A',
    fontWeight: '500',
  },
  ruleTextInactive: {
    color: '#6B7280',
  },

  // Mismatch
  mismatchText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },

  // Continue Button
  continueButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  continueButtonActive: {
    backgroundColor: '#E8304A',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueTextActive: {
    color: '#FFFFFF',
  },

  // Footer
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  footerLink: {
    color: '#E8304A',
    fontWeight: '500',
  },
});