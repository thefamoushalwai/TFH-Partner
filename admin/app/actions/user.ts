"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function getUserById(uid: string) {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) {
      return { success: false, error: "User not found" };
    }
    const data = doc.data();
    return {
      success: true,
      data: {
        uid: doc.id,
        ...data,
      }
    };
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch user details",
    };
  }
}

export async function updateKycStatus(uid: string, status: "approved" | "rejected") {
  try {
    await adminDb.collection("users").doc(uid).update({
      kycStatus: status,
      kycVerifiedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating KYC status:", error);
    return {
      success: false,
      error: error.message || "Failed to update KYC status",
    };
  }
}
