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

interface DocumentItem {
  id: string;
  label: string;
  uploaded: boolean;
}

interface UploadDocumentsScreenProps {
  onBack?: () => void;
  onContinue?: (docs: DocumentItem[]) => void;
  onDocumentPress?: (doc: DocumentItem) => void;
}

const INITIAL_DOCS: DocumentItem[] = [
  { id: 'selfie', label: 'Upload profile picture (Selfie)', uploaded: true },
  { id: 'aadhar', label: 'Upload Aadhar card front & back', uploaded: true },
  { id: 'pan', label: 'Upload PAN number', uploaded: true },
];

export default function UploadDocumentsScreen({
  onBack,
  onContinue,
  onDocumentPress,
}: UploadDocumentsScreenProps) {
  const [docs, setDocs] = useState<DocumentItem[]>(INITIAL_DOCS);

  const allUploaded = docs.every((d) => d.uploaded);

  const handleDocPress = (doc: DocumentItem) => {
    // Toggle uploaded state for demo; in real app open picker
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, uploaded: !d.uploaded } : d))
    );
    onDocumentPress?.(doc);
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
          {/* Heading */}
          <Text style={styles.heading}>Upload documents</Text>
          <Text style={styles.subheading}>
            Please submit the below documents for verification & upload originals to avoid rejection
          </Text>

          {/* Document Rows */}
          <View style={styles.docList}>
            {docs.map((doc, index) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.docRow,
                  index < docs.length - 1 && styles.docRowWithMargin,
                ]}
                onPress={() => handleDocPress(doc)}
                activeOpacity={0.7}
              >
                <Text style={styles.docLabel}>{doc.label}</Text>
                <View style={[styles.checkCircle, doc.uploaded && styles.checkCircleActive]}>
                  {doc.uploaded && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
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

  /* Doc List */
  docList: { gap: 0 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  docRowWithMargin: { marginBottom: 12 },
  docLabel: { fontSize: 15, color: '#333', fontWeight: '400', flex: 1, paddingRight: 12 },

  /* Check Circle */
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkCircleActive: {
    backgroundColor: '#22a75a',
    borderColor: '#22a75a',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Footer */
  footer: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12 },
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
});
