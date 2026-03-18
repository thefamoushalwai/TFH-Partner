import { auth, storage } from '@/src/services/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

type KycDocumentType = 'selfie' | 'aadhar-front' | 'aadhar-back' | 'pan';

const getFileExtension = (uri: string): string => {
  const cleanUri = uri.split('?')[0];
  const parts = cleanUri.split('.');
  if (parts.length < 2) {
    return 'jpg';
  }
  return parts[parts.length - 1].toLowerCase();
};

export const uploadKycImage = async (
  localUri: string,
  docType: KycDocumentType
): Promise<string> => {
  const uid = auth.currentUser?.uid ?? 'anonymous';
  const extension = getFileExtension(localUri);
  const filePath = `kyc/${uid}/${docType}_${Date.now()}.${extension}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });

  return getDownloadURL(storageRef);
};
