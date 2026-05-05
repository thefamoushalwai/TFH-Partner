"use server";

import admin, { adminDb } from "@/lib/firebase-admin";

export interface ReferralRow {
  referralId: string;
  referrerId: string;
  referrerName: string;
  referredPhone: string;
  status: "pending" | "joined" | "rewarded";
  reward: number;
  createdAt: string;
}

export interface ReferralStats {
  total: number;
  pending: number;
  joined: number;
  rewarded: number;
  totalRewardsPaid: number;
}

export interface ReferralsResult {
  stats: ReferralStats;
  referrals: ReferralRow[];
}

export async function getReferralsList(): Promise<{
  success: boolean;
  data?: ReferralsResult;
  error?: string;
}> {
  try {
    // Fetch all referrals ordered by createdAt desc
    const referralsSnap = await adminDb
      .collection("referrals")
      .orderBy("createdAt", "desc")
      .get();
    const rawReferrals = referralsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];

    // Collect unique referrer UIDs to batch-lookup names
    const referrerIds = [
      ...new Set(rawReferrals.map((r) => r.referrerId).filter(Boolean)),
    ] as string[];

    // Batch-fetch referrer names from users collection (max 30 per in-query)
    const nameMap: Record<string, string> = {};
    for (let i = 0; i < referrerIds.length; i += 30) {
      const chunk = referrerIds.slice(i, i + 30);
      const usersSnap = await adminDb
        .collection("users")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();
      usersSnap.docs.forEach((d) => {
        const data = d.data() as any;
        nameMap[d.id] = data.name || "Unknown Partner";
      });
    }

    const stats: ReferralStats = {
      total: 0,
      pending: 0,
      joined: 0,
      rewarded: 0,
      totalRewardsPaid: 0,
    };

    const referrals: ReferralRow[] = rawReferrals.map((r) => {
      stats.total++;
      const status: ReferralRow["status"] = r.status || "pending";
      if (status === "pending") stats.pending++;
      else if (status === "joined") stats.joined++;
      else if (status === "rewarded") {
        stats.rewarded++;
        stats.totalRewardsPaid += Number(r.reward) || 0;
      }

      let createdAt = "";
      if (r.createdAt) {
        if (typeof r.createdAt.toDate === "function") {
          createdAt = r.createdAt.toDate().toISOString();
        } else {
          createdAt = String(r.createdAt);
        }
      }

      return {
        referralId: r.id,
        referrerId: r.referrerId || "",
        referrerName: nameMap[r.referrerId] || "Unknown Partner",
        referredPhone: r.referredPhone || "",
        status,
        reward: Number(r.reward) || 0,
        createdAt,
      };
    });

    return { success: true, data: { stats, referrals } };
  } catch (error: any) {
    console.error("Error fetching referrals:", error);
    return { success: false, error: error.message || "Failed to fetch referrals." };
  }
}

export async function updateReferral(
  referralId: string,
  status: "pending" | "joined" | "rewarded",
  reward?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const update: Record<string, any> = { status };
    if (reward !== undefined) update.reward = reward;
    await adminDb.collection("referrals").doc(referralId).update(update);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating referral:", error);
    return { success: false, error: error.message || "Failed to update referral." };
  }
}
