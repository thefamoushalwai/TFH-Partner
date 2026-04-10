"use server";

import { adminDb } from "@/lib/firebase-admin";

export interface BookingRow {
  id: string;
  chefName: string;
  client: string;
  eventType: string;
  date: string;
  time: string;
  guests: number;
  amount: string;
  status: string;
}

export interface BookingStats {
  completed: number;
  inProgress: number;
  scheduled: number;
  cancelled: number;
  total: number;
}

export interface BookingsData {
  stats: BookingStats;
  bookings: BookingRow[];
}

function formatDate(raw: any): { date: string; time: string } {
  let d: Date | null = null;
  if (raw?.toDate) d = raw.toDate();
  else if (raw) d = new Date(raw);
  if (!d || isNaN(d.getTime())) return { date: "—", time: "—" };
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

function normaliseStatus(raw: string = ""): string {
  const s = raw.toLowerCase().trim();
  if (s === "completed" || s === "done") return "Completed";
  if (s === "in_progress" || s === "inprogress" || s === "in progress" || s === "active") return "In progress";
  if (s === "scheduled" || s === "confirmed" || s === "pending") return "Scheduled";
  if (s === "cancelled" || s === "canceled" || s === "rejected") return "Cancelled";
  return "Scheduled"; // default
}

export async function getBookingsData(): Promise<{
  success: boolean;
  data?: BookingsData;
  error?: string;
}> {
  try {
    const [bookingsSnap, usersSnap] = await Promise.all([
      adminDb.collection("bookings").orderBy("createdAt", "desc").limit(100).get(),
      adminDb.collection("users").get(),
    ]);

    // Build a name lookup map: uid -> name
    const nameMap: Record<string, string> = {};
    for (const doc of usersSnap.docs) {
      const d = doc.data();
      nameMap[doc.id] = d.name || d.displayName || d.email || "Unknown";
    }

    const stats: BookingStats = { completed: 0, inProgress: 0, scheduled: 0, cancelled: 0, total: 0 };
    const bookings: BookingRow[] = [];

    for (const doc of bookingsSnap.docs) {
      const b = doc.data();
      const status = normaliseStatus(b.status);
      stats.total++;
      if (status === "Completed") stats.completed++;
      else if (status === "In progress") stats.inProgress++;
      else if (status === "Scheduled") stats.scheduled++;
      else if (status === "Cancelled") stats.cancelled++;

      // Resolve names
      const chefName =
        nameMap[b.partnerId] ||
        nameMap[b.chefId] ||
        b.chefName ||
        "Unknown Chef";
      const client =
        nameMap[b.clientId] ||
        b.clientName ||
        b.userName ||
        "Unknown Client";

      const { date, time } = formatDate(b.date ?? b.createdAt);
      const amount = b.amount ? `₹${Number(b.amount).toLocaleString("en-IN")}` : "—";

      bookings.push({
        id: `#${doc.id.slice(0, 5).toUpperCase()}`,
        chefName,
        client,
        eventType: b.eventType || b.occasion || "Event",
        date,
        time,
        guests: Number(b.guests) || 0,
        amount,
        status,
      });
    }

    return { success: true, data: { stats, bookings } };
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return { success: false, error: error.message || "Failed to fetch bookings." };
  }
}
