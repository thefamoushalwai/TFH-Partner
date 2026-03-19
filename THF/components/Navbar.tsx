import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface NavbarProps {
  onHelp?: () => void;
}

export default function Navbar({ onHelp }: NavbarProps) {
  return (
    <View style={styles.navbar}>
      <Image source={require('../assets/THF/tfh-logo.svg')} style={{ width: 100.5, height: 36 }} />
      <TouchableOpacity style={styles.helpBtn} onPress={onHelp} activeOpacity={0.8}>
      <Text style={styles.helpIcon}>📞</Text>
      <Text style={styles.helpText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  brandLine1: { fontSize: 11, color: '#333', fontWeight: '600', lineHeight: 14 },
  brandLine2: { fontSize: 11, color: '#333', fontWeight: '400', lineHeight: 14 },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  helpIcon: { fontSize: 13 },
  helpText: { fontSize: 14, color: '#333', fontWeight: '500' },
});
