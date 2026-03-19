"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function getDashboardStats() {
  try {
    // Fetch users directly from Firestore
    const usersSnapshot = await adminDb.collection("users").limit(100).get();
    
    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name || "Unknown User",
        email: data.email || null,
        phone: data.phone || data.emergencyPhone || "No Phone",
        city: data.city || "Unknown City",
        kycStatus: data.kycStatus || "unsubmitted",
        kycSubmittedAt: data.kycSubmittedAt || null,
        selfieUrl: data.kycDocuments?.selfieUrl || null,
      };
    });

    // Compute stats
    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.kycStatus === "approved" || u.kycStatus === "verified").length;
    
    const recentSignups = users.filter((u) => {
      if (!u.kycSubmittedAt) return false;
      const created = new Date(u.kycSubmittedAt);
      const now = new Date();
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }).length;

    // Sort by recent submissions
    users.sort((a, b) => {
      if (!a.kycSubmittedAt) return 1;
      if (!b.kycSubmittedAt) return -1;
      return new Date(b.kycSubmittedAt).getTime() - new Date(a.kycSubmittedAt).getTime();
    });

    return {
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        recentSignups,
        pendingKyc: users.filter((u) => u.kycStatus === "pending_verification").length,
        users,
      }
    };
  } catch (error: any) {
    console.error("Error fetching Firestore stats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch data from Firestore.",
    };
  }
}
