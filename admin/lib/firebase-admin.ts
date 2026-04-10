import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error.message);
    }
  } else {
    console.warn(
      "Firebase Admin credentials not found — skipping initialization. " +
      "This is expected during build. Set FIREBASE_ADMIN_PROJECT_ID, " +
      "FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in env."
    );
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
