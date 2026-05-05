import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function normaliseStatus(raw: string = ""): string {
  const s = raw.toLowerCase().trim();
  if (s === "completed" || s === "done") return "Completed";
  if (s === "in_progress" || s === "inprogress" || s === "in progress" || s === "active") return "In progress";
  if (s === "broadcasted" || s === "broadcast") return "Broadcasted";
  if (s === "scheduled" || s === "confirmed" || s === "pending") return "Scheduled";
  if (s === "cancelled" || s === "canceled" || s === "rejected") return "Cancelled";
  if (s === "hold" || s === "on hold" || s === "on_hold") return "Hold";
  return "Scheduled";
}

function formatDate(raw: any): { date: string; time: string; timestamp: number } {
  let d: Date | null = null;
  if (raw?.toDate) d = raw.toDate();
  else if (raw) d = new Date(raw);
  if (!d || isNaN(d.getTime())) return { date: "—", time: "—", timestamp: 0 };
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time, timestamp: d.getTime() };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get("start"); // YYYY-MM-DD
    const endStr = searchParams.get("end");     // YYYY-MM-DD

    const startMs = startStr ? new Date(`${startStr}T00:00:00+05:30`).getTime() : 0;
    const endMs   = endStr   ? new Date(`${endStr}T23:59:59.999+05:30`).getTime() : Infinity;

    const [bookingsSnap, usersSnap] = await Promise.all([
      adminDb.collection("bookings").orderBy("createdAt", "desc").get(),
      adminDb.collection("users").get(),
    ]);

    // Build name lookup
    const nameMap: Record<string, string> = {};
    for (const doc of usersSnap.docs) {
      const d = doc.data();
      const email = d.email && d.email !== "" ? d.email : null;
      nameMap[doc.id] = d.name || d.displayName || email || "Unknown";
    }

    const rows: Record<string, any>[] = [];

    for (const doc of bookingsSnap.docs) {
      const b = doc.data();

      // Resolve date
      const hasNullDate = b.date === null || b.date === undefined;
      const rawForDate = hasNullDate ? null : (b.date ?? b.createdAt);
      const { date: resolvedDate, time, timestamp } = hasNullDate
        ? { date: "Date TBD", time: "—", timestamp: 0 }
        : formatDate(rawForDate);

      // Date filter
      if (startMs > 0 || endMs < Infinity) {
        if (timestamp === 0 || timestamp < startMs || timestamp > endMs) continue;
      }

      const status = normaliseStatus(b.status);

      let chefName: string;
      if (b.partnerId === "generic-booking" || status === "Broadcasted") {
        const broadcastCount = Array.isArray(b.broadcastedTo) ? b.broadcastedTo.length : null;
        chefName = broadcastCount ? `Broadcast (${broadcastCount} chefs)` : "Broadcast";
      } else {
        chefName = nameMap[b.partnerId] || nameMap[b.chefId] || b.chefName || "Unknown Chef";
      }

      const client = nameMap[b.clientId] || b.clientName || b.userName || "Unknown Client";
      const amountValue = Number(b.amount) || 0;

      rows.push({
        "Booking ID": `#${doc.id.slice(0, 5).toUpperCase()}`,
        "Full ID": doc.id,
        "Chef Name": chefName,
        "Client Name": client,
        "Phone": b.phone || "",
        "Event Type": b.eventType || b.occasion || "Event",
        "Date": resolvedDate,
        "Time": time,
        "Guests": Number(b.guests) || 0,
        "Amount (₹)": amountValue,
        "Status": status,
        "Location": b.location || "",
        "Zone": b.zone || "",
        "Address": b.address || "",
        "Requirements": b.requirements || "",
      });
    }

    return NextResponse.json({ success: true, data: rows, count: rows.length });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
