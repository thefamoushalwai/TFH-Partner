"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function createBookingForChef(
  partnerId: string,
  data: {
    clientName: string;
    phone: string;
    eventType: string;
    date: Date;
    location: string;
    guests: number;
    amount: number;
  }
) {
  try {
    const bookingRef = await adminDb.collection("bookings").add({
      partnerId,
      clientName: data.clientName,
      phone: data.phone,
      eventType: data.eventType,
      date: data.date,
      location: data.location,
      guests: data.guests,
      amount: data.amount,
      status: "pending",
      createdAt: new Date(),
    });

    return { success: true, bookingId: bookingRef.id };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}
