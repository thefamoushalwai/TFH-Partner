import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface DocumentItem {
  id: string;
  label: string;
  uploaded: boolean;
}

interface UploadDocumentsScreenProps {
  docs?: DocumentItem[];
  onBack?: () => void;
  onContinue?: (docs: DocumentItem[]) => void;
  onDocumentPress?: (doc: DocumentItem) => void;
  onSkip?: () => void;
}

const DEFAULT_DOCS: DocumentItem[] = [
  { id: 'selfie', label: 'Upload profile picture (Selfie)', uploaded: false },
];

export default function UploadDocumentsScreen({
  docs: initialDocs = DEFAULT_DOCS,
  onBack,
  onContinue,
  onDocumentPress,
  onSkip,
}: UploadDocumentsScreenProps) {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentItem[]>(initialDocs);

  const allUploaded = docs.every((d) => d.uploaded);

  const handleDocPress = (doc: DocumentItem) => {
    onDocumentPress?.(doc);
    // Toggle for demo — replace with real camera/picker logic
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, uploaded: !d.uploaded } : d))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.heading}>Upload documents</Text>
          <Text style={styles.subheading}>
            Please submit the below documents for verification & upload originals to avoid rejection
          </Text>

          <View style={styles.docList}>
            {docs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docRow}
                onPress={() => {
                  handleDocPress(doc);
                  router.push('/kyc/SelfieScreen');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.docLabel}>{doc.label}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, allUploaded && styles.continueBtnActive]}
            onPress={() => allUploaded && onContinue?.(docs)}
            activeOpacity={allUploaded ? 0.85 : 1}
            disabled={!allUploaded}
          >
            <Text style={[styles.continueText, allUploaded && styles.continueTextActive]}>
              Continue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip, I'll do it letter</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },

  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  heading: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 8 },
  subheading: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 28 },

  docList: { gap: 12 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  docLabel: { fontSize: 15, color: '#333', fontWeight: '400', flex: 1 },
  chevron: { fontSize: 22, color: '#aaa' },

  footer: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 14 },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  continueBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: { fontSize: 16, fontWeight: '600', color: '#aaa', letterSpacing: 0.3 },
  continueTextActive: { color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { fontSize: 14, color: '#E8304A', fontWeight: '500' },
});
