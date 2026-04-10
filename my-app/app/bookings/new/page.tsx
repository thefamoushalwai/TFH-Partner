"use client";

import { createBookingForChef } from "@/app/actions/booking";
import { X, Calendar, ChevronDown, MapPin, Users, Clock, FileText, Phone, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

const inputBase =
  "w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eb243e]/20 focus:border-[#eb243e] transition-all";

const selectBase =
  "w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#eb243e]/20 focus:border-[#eb243e] transition-all";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

type FormValues = {
  clientName: string;
  phone: string;
  eventType: string;
  location: string;
  date: string;
  time: string;
  guests: string;
  zone: string;
  address: string;
  requirements: string;
};

export default function CreateBookingPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<FormValues | null>(null);

  // Step 1: collect form data and show confirmation
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingData({
      clientName: formData.get("clientName") as string,
      phone: formData.get("phone") as string,
      eventType: formData.get("eventType") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      guests: formData.get("guests") as string,
      zone: formData.get("zone") as string,
      address: formData.get("address") as string,
      requirements: formData.get("requirements") as string,
    });
    setShowConfirm(true);
  };

  // Step 2: user confirmed — broadcast and reset
  const handleConfirm = async () => {
    if (!pendingData) return;
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    const dateTime = pendingData.date && pendingData.time
      ? new Date(`${pendingData.date}T${pendingData.time}`)
      : new Date(pendingData.date || Date.now());

    const result = await createBookingForChef("generic-booking", {
      clientName: pendingData.clientName,
      phone: pendingData.phone,
      eventType: pendingData.eventType,
      date: dateTime,
      location: pendingData.address || pendingData.location,
      guests: parseInt(pendingData.guests, 10),
      amount: 0,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setPendingData(null);
      formRef.current?.reset();
      // Auto-hide success banner after 4s
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#eb243e]/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#eb243e]" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-gray-900 leading-tight">New Booking</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">Fill in the details to broadcast to all chefs</p>
              </div>
            </div>
            <Link
              href="/bookings"
              className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </Link>
          </div>

          {/* Form Body */}
          <form ref={formRef} onSubmit={handleSubmit} className="px-7 py-6 space-y-5 max-h-[75vh] overflow-y-auto">

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-600 rounded-lg text-[13px] border border-red-100">
                <X className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 p-3.5 bg-green-50 text-green-700 rounded-lg text-[13px] border border-green-100">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Booking broadcasted to all available chefs! You can create another one below.
              </div>
            )}

            {/* Row 1: Location + Occasion */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select name="location" required className={selectBase + " pl-9"}>
                    <option value="">Select city</option>
                    <option value="delhi">Delhi</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="chennai">Chennai</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label>Occasion</Label>
                <div className="relative">
                  <select name="eventType" required className={selectBase}>
                    <option value="">Select occasion</option>
                    <option value="birthday">Birthday</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="housewarming">Housewarming</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Client Name + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    required
                    name="clientName"
                    placeholder="Full name"
                    className={inputBase + " pl-9"}
                  />
                </div>
              </div>
              <div>
                <Label>Contact Number</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    required
                    name="phone"
                    type="tel"
                    placeholder="+91 00000 00000"
                    className={inputBase + " pl-9"}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Guests + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>No. of Guests</Label>
                <div className="relative">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    required
                    type="number"
                    min={1}
                    name="guests"
                    placeholder="e.g. 50"
                    className={inputBase + " pl-9"}
                  />
                </div>
              </div>
              <div>
                <Label>Event Date</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    required
                    type="date"
                    name="date"
                    className={inputBase + " pl-9"}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Time + Zone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Time</Label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    required
                    type="time"
                    name="time"
                    className={inputBase + " pl-9"}
                  />
                </div>
              </div>
              <div>
                <Label>Zone</Label>
                <div className="relative">
                  <select name="zone" className={selectBase}>
                    <option value="">Select zone</option>
                    <option value="zone1">Zone 1 — North</option>
                    <option value="zone2">Zone 2 — South</option>
                    <option value="zone3">Zone 3 — East</option>
                    <option value="zone4">Zone 4 — West</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 5: Full Address */}
            <div>
              <Label>Full Address</Label>
              <textarea
                required
                name="address"
                placeholder="House no., street, locality, city, pincode"
                rows={3}
                className={inputBase + " resize-none"}
              />
            </div>

            {/* Row 6: Special Requirements */}
            <div>
              <Label>Special Requirements <span className="normal-case font-normal text-gray-400">(optional)</span></Label>
              <input
                name="requirements"
                placeholder="Dietary needs, cuisine preference, setup instructions…"
                className={inputBase}
              />
            </div>

            {/* Submit */}
            <div className="pt-1 flex gap-3">
              <Link
                href="/bookings"
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[14px] font-medium text-gray-600 text-center hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#eb243e] hover:bg-[#c8102e] text-white py-2.5 rounded-lg font-semibold text-[14px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Broadcasting…
                  </span>
                ) : (
                  "Create Booking"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Confirmation Dialog ── */}
      {showConfirm && pendingData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#eb243e]/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#eb243e]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">Confirm Broadcast</h3>
                <p className="text-[12px] text-gray-400">This will notify all available chefs.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-[13px] text-gray-700 mb-5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Client</span>
                <span className="font-semibold">{pendingData.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Phone</span>
                <span>{pendingData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Occasion</span>
                <span className="capitalize">{pendingData.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Date & Time</span>
                <span>{pendingData.date} {pendingData.time && `at ${pendingData.time}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Guests</span>
                <span>{pendingData.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">City</span>
                <span className="capitalize">{pendingData.location}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#eb243e] hover:bg-[#c8102e] text-white text-[14px] font-semibold transition-colors"
              >
                Yes, Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
