import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendOtp } from '@/lib/auth';

const { height } = Dimensions.get('window');

interface MobileLoginScreenProps {
  onGetStarted?: (mobile: string) => void;
}

export default function MobileLoginScreen({ onGetStarted }: MobileLoginScreenProps) {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = mobile.trim().length >= 10;

  const handleGetStarted = async () => {
    if (!isValid) return;

    if (onGetStarted) {
      onGetStarted(mobile.trim());
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${mobile.trim()}`;
      const verificationId = await sendOtp(phoneNumber);

      // Navigate to OTP screen with the verificationId & phone number
      router.push({
        pathname: '/welcome/OTP',
        params: {
          verificationId,
          phoneNumber,
        },
      });
    } catch (error: any) {
      console.error('OTP send error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to send OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Hero Image */}


        {/* Bottom Content */}
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>Please enter mobile number</Text>

          {/* Mobile Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor="#b0b0b0"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              returnKeyType="done"
              onSubmitEditing={handleGetStarted}
              editable={!loading}
            />
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={[styles.button, isValid && !loading ? styles.buttonActive : styles.buttonDisabled]}
            onPress={handleGetStarted}
            activeOpacity={isValid && !loading ? 0.85 : 1}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, isValid ? styles.buttonTextActive : styles.buttonTextDisabled]}>
                Get Started
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },

  /* ── Hero Image ── */
  imageContainer: {
    width: '100%',
    height: height * 0.65,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  /* ── Bottom Sheet ── */
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    marginTop: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 20,
    letterSpacing: 0.1,
  },

  /* ── Input ── */
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },

  /* ── Button ── */
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#e8e8e8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonTextActive: {
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#aaa',
  },
});
