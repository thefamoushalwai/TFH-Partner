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

// ──────────────────────────────────────────────────────────────
// Dashboard Analytics – powers /dashboard with live Firestore data
// ──────────────────────────────────────────────────────────────

interface MonthlyBooking {
  label: string;
  value: number;
}

interface BreakdownItem {
  label: string;
  count: number;
  pct: number;
}

interface ActivityItem {
  text: string;
  time: string;
}

interface MemberStats {
  addedThisMonth: number;
  onHold: number;
  suspended: number;
  activeTotal: number;
}

export interface DashboardAnalytics {
  totalRevenue: number;
  activeChefs: number;
  totalChefs: number;
  avgBookingValue: number;
  pendingApproval: number;
  monthlyBookings: MonthlyBooking[];
  peakMonth: string;
  avgPerMonth: number;
  ytdTotal: number;
  cuisineBreakdown: BreakdownItem[];
  locationBreakdown: BreakdownItem[];
  memberStats: MemberStats;
  recentActivity: ActivityItem[];
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hrs ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getDashboardAnalytics(): Promise<{
  success: boolean;
  data?: DashboardAnalytics;
  error?: string;
}> {
  try {
    // ── Fetch users ──
    const usersSnap = await adminDb.collection("users").get();
    const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    const totalChefs = allUsers.length;
    const activeChefs = allUsers.filter(
      (u) => u.kycStatus === "approved" || u.kycStatus === "verified"
    ).length;
    const pendingApproval = allUsers.filter(
      (u) => u.kycStatus === "pending_verification"
    ).length;
    const onHold = allUsers.filter((u) => u.status === "hold" || u.status === "suspended").length;

    // Added this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const addedThisMonth = allUsers.filter((u) => {
      const created = u.createdAt ? new Date(u.createdAt) : null;
      return created && created >= startOfMonth;
    }).length;

    // ── Fetch bookings ──
    const bookingsSnap = await adminDb.collection("bookings").get();
    const allBookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    let totalRevenue = 0;
    const monthCounts: Record<number, number> = {};
    const cuisineCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    for (const b of allBookings) {
      // Revenue
      const amount = Number(b.amount) || 0;
      totalRevenue += amount;

      // Monthly
      let bDate: Date | null = null;
      if (b.createdAt?.toDate) bDate = b.createdAt.toDate();
      else if (b.createdAt) bDate = new Date(b.createdAt);
      if (b.date?.toDate) bDate = b.date.toDate();
      else if (b.date && !bDate) bDate = new Date(b.date);

      if (bDate && bDate.getFullYear() === now.getFullYear()) {
        const m = bDate.getMonth();
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      }

      // Cuisine / Event type
      const cuisine = b.eventType || b.cuisineType || b.occasion || "Others";
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;

      // Location
      const loc = b.location || b.city || "Others";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }

    const avgBookingValue = allBookings.length > 0 ? Math.round(totalRevenue / allBookings.length) : 0;

    // Build monthly array (current year)
    const monthlyBookings: MonthlyBooking[] = MONTH_LABELS.map((label, idx) => ({
      label,
      value: monthCounts[idx] || 0,
    }));

    const ytdTotal = monthlyBookings.reduce((s, m) => s + m.value, 0);
    const monthsWithData = monthlyBookings.filter((m) => m.value > 0);
    const avgPerMonth = monthsWithData.length > 0 ? Math.round(ytdTotal / monthsWithData.length) : 0;
    const peakEntry = monthlyBookings.reduce((p, c) => (c.value > p.value ? c : p), { label: "-", value: 0 });

    // Top 6 cuisines
    const cuisineBreakdown = buildBreakdown(cuisineCounts, allBookings.length);
    const locationBreakdown = buildBreakdown(locationCounts, allBookings.length);

    // ── Recent activity (derived from bookings + users) ──
    const recentActivity: ActivityItem[] = [];

    // Recent bookings as activity
    const sortedBookings = [...allBookings]
      .map((b) => {
        let d: Date | null = null;
        if (b.createdAt?.toDate) d = b.createdAt.toDate();
        else if (b.createdAt) d = new Date(b.createdAt);
        return { ...b, _date: d };
      })
      .filter((b) => b._date)
      .sort((a, b) => b._date!.getTime() - a._date!.getTime())
      .slice(0, 5);

    for (const b of sortedBookings) {
      recentActivity.push({
        text: `New ${b.eventType || "booking"} for ${b.guests || "?"} guests at ${b.location || b.city || "Unknown"}`,
        time: timeAgo(b._date!),
      });
    }

    // Recent user signups
    const recentUsers = [...allUsers]
      .map((u) => {
        let d: Date | null = null;
        if (u.createdAt?.toDate) d = u.createdAt.toDate();
        else if (u.createdAt) d = new Date(u.createdAt);
        return { ...u, _date: d };
      })
      .filter((u) => u._date)
      .sort((a, b) => b._date!.getTime() - a._date!.getTime())
      .slice(0, 3);

    for (const u of recentUsers) {
      recentActivity.push({
        text: `New chef ${u.name || "Unknown"} onboarded`,
        time: timeAgo(u._date!),
      });
    }

    // Sort all activity by time
    recentActivity.sort((a, b) => {
      const order = (t: string) => {
        if (t.includes("Just now")) return 0;
        const num = parseInt(t) || 999;
        if (t.includes("min")) return num;
        if (t.includes("hr")) return num * 60;
        if (t.includes("day")) return num * 1440;
        return 9999;
      };
      return order(a.time) - order(b.time);
    });

    return {
      success: true,
      data: {
        totalRevenue,
        activeChefs,
        totalChefs,
        avgBookingValue,
        pendingApproval,
        monthlyBookings,
        peakMonth: peakEntry.label,
        avgPerMonth,
        ytdTotal,
        cuisineBreakdown,
        locationBreakdown,
        memberStats: {
          addedThisMonth,
          onHold,
          suspended: onHold, // same field for now
          activeTotal: activeChefs,
        },
        recentActivity: recentActivity.slice(0, 7),
      },
    };
  } catch (error: any) {
    console.error("Error fetching dashboard analytics:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch analytics.",
    };
  }
}

function buildBreakdown(counts: Record<string, number>, total: number): BreakdownItem[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}
