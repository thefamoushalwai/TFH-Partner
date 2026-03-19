import * as admin from 'firebase-admin';

// Path to the service account key file in the same or parent directory
import serviceAccount from '../tfh-partner-app-firebase-adminsdk-fbsvc-238c3dff75.json';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
