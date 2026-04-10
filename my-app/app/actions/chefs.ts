"use server";

import { adminDb } from "@/lib/firebase-admin";

export interface ChefRow {
  uid: string;
  name: string;
  initials: string;
  city: string;
  profilePct: number;
  bookings: number;
  ratings: number;
  earnings: number;
  docsStatus: "Approved" | string;
  status: "Active" | "Hold" | "Pending" | "Suspended" | "Inactive";
}

export interface ChefStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
}

export interface ChefsListResult {
  stats: ChefStats;
  chefs: ChefRow[];
}

function getInitials(name: string): string {
  if (!name || name === "Unknown User") return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function computeProfileCompletion(data: any): number {
  const fields = ["name", "email", "phone", "city", "kycStatus", "kycDocuments"];
  let filled = 0;
  for (const f of fields) {
    if (data[f] && data[f] !== "" && data[f] !== "unsubmitted") filled++;
  }
  return Math.round((filled / fields.length) * 100);
}

function mapStatus(data: any): ChefRow["status"] {
  if (data.status === "hold" || data.status === "suspended") return "Hold";
  if (data.status === "suspended") return "Suspended";
  if (data.status === "inactive") return "Inactive";
  if (data.kycStatus === "pending_verification") return "Pending";
  if (data.kycStatus === "approved" || data.kycStatus === "verified") return "Active";
  return "Inactive";
}

export async function getChefsList(
  filter: "all" | "active" | "pending" | "suspended" | "inactive" = "all"
): Promise<{ success: boolean; data?: ChefsListResult; error?: string }> {
  try {
    // ── Fetch all users ──
    const usersSnap = await adminDb.collection("users").get();
    const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    // ── Fetch bookings for per-chef aggregation ──
    const bookingsSnap = await adminDb.collection("bookings").get();
    const allBookings = bookingsSnap.docs.map((d) => d.data()) as any[];

    // Build per-partner aggregates
    const bookingsByPartner: Record<string, { count: number; totalAmount: number }> = {};
    for (const b of allBookings) {
      const pid = b.partnerId;
      if (!pid) continue;
      if (!bookingsByPartner[pid]) bookingsByPartner[pid] = { count: 0, totalAmount: 0 };
      bookingsByPartner[pid].count += 1;
      bookingsByPartner[pid].totalAmount += Number(b.amount) || 0;
    }

    // Stats counters
    const stats: ChefStats = { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 };
    const chefs: ChefRow[] = [];

    for (const user of allUsers) {
      const status = mapStatus(user);
      stats.total++;

      switch (status) {
        case "Active": stats.active++; break;
        case "Pending": stats.pending++; break;
        case "Hold":
        case "Suspended": stats.suspended++; break;
        case "Inactive": stats.inactive++; break;
      }

      // Apply tab filter
      if (filter !== "all") {
        const filterMap: Record<string, string[]> = {
          active: ["Active"],
          pending: ["Pending"],
          suspended: ["Hold", "Suspended"],
          inactive: ["Inactive"],
        };
        if (!filterMap[filter]?.includes(status)) continue;
      }

      const partnerAgg = bookingsByPartner[user.id] || { count: 0, totalAmount: 0 };
      const docsApproved =
        user.kycStatus === "approved" || user.kycStatus === "verified";

      chefs.push({
        uid: user.id,
        name: user.name || "Unknown User",
        initials: getInitials(user.name || ""),
        city: user.city || "Unknown City",
        profilePct: computeProfileCompletion(user),
        bookings: partnerAgg.count,
        ratings: Number(user.ratings) || 0,
        earnings: partnerAgg.totalAmount,
        docsStatus: docsApproved ? "Approved" : `${docsApproved ? 0 : "Pending"}`,
        status,
      });
    }

    // Sort by name
    chefs.sort((a, b) => a.name.localeCompare(b.name));

    return { success: true, data: { stats, chefs } };
  } catch (error: any) {
    console.error("Error fetching chefs list:", error);
    return { success: false, error: error.message || "Failed to fetch chefs." };
  }
}
