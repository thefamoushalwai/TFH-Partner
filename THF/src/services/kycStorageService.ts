import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { getStorage, ref, getDownloadURL } from '@react-native-firebase/storage';

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
  const uid = getAuth().currentUser?.uid ?? 'anonymous';
  const extension = getFileExtension(localUri);
  const filePath = `kyc/${uid}/${docType}_${Date.now()}.${extension}`;

  const storageRef = ref(getStorage(), filePath);
  // putFile is an RN-specific method on the reference object
  await (storageRef as any).putFile(localUri);

  return getDownloadURL(storageRef);
};

export interface KycDocumentUrls {
  selfieUrl: string;
  aadharFrontUrl: string;
  aadharBackUrl: string;
  panUrl: string;
  aadharNumber?: string;
}

export const linkKycToUser = async (kycData: KycDocumentUrls): Promise<void> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    throw new Error('User not authenticated');
  }

  await setDoc(
    doc(getFirestore(), 'users', uid),
    {
      kycDocuments: kycData,
      aadharNumber: kycData.aadharNumber || '',
      kycStatus: 'pending_verification',
      kycSubmittedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};
