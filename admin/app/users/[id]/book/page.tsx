"use client";

import { createBookingForChef } from "@/app/actions/booking";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, User, Tag, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function CreateBookingPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      clientName: formData.get("clientName") as string,
      phone: formData.get("phone") as string,
      eventType: formData.get("eventType") as string,
      date: new Date(formData.get("date") as string),
      location: formData.get("location") as string,
      guests: parseInt(formData.get("guests") as string, 10),
      amount: parseFloat(formData.get("amount") as string),
    };

    const result = await createBookingForChef(partnerId, data);
    setLoading(false);

    if (result.success) {
      router.push(`/users/${partnerId}`);
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="flex items-center space-x-4">
        <Link href={`/users/${partnerId}`} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create Booking</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Assign a new event to this partner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <User className="w-4 h-4 mr-2 text-zinc-400" /> Client Name
            </label>
            <input
              required
              name="clientName"
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-zinc-400" /> Phone Number
            </label>
            <input
              required
              type="tel"
              name="phone"
              placeholder="e.g. +91 9876543210"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-zinc-400" /> Event Type
            </label>
            <input
              required
              name="eventType"
              placeholder="e.g. Birthday Brunch"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-zinc-400" /> Date & Time
            </label>
            <input
              required
              type="datetime-local"
              name="date"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-zinc-400" /> Location
            </label>
            <input
              required
              name="location"
              placeholder="e.g. Lajpat Nagar, Delhi"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <Users className="w-4 h-4 mr-2 text-zinc-400" /> Number of Guests
            </label>
            <input
              required
              type="number"
              name="guests"
              min="1"
              placeholder="e.g. 5"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-zinc-400" /> Total Fee (₹)
            </label>
            <input
              required
              type="number"
              name="amount"
              min="0"
              placeholder="e.g. 2000"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? "Assigning..." : "Assign Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
