import * as admin from "firebase-admin";

function initializeFirebaseAdmin() {
  if (admin.apps.length) return;

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

// Lazy getters — only call admin.firestore()/auth() at request time, not at import time.
// This prevents the build from crashing when env vars aren't available.
export function getAdminDb() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

// Keep these for backward compatibility, but they're now lazy via getter
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (getAdminDb() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return (getAdminAuth() as any)[prop];
  },
});

export default admin;
