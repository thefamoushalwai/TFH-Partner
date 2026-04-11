"use client";

import { BookingRow, updateBooking } from "@/app/actions/bookings";
import { X, ChevronDown, CheckCircle, Send } from "lucide-react";
import { useState } from "react";

interface BookingDetailsModalProps {
  booking: BookingRow;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [amount, setAmount] = useState(booking.rawAmount.toString());
  const [zone, setZone] = useState(booking.zone);
  const [status, setStatus] = useState(booking.status);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const res = await updateBooking(booking.fullId, {
      rawAmount: parseFloat(amount) || 0,
      zone,
      status,
    });
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onClose(); // Optional: close on save
    } else {
      setError(res.error || "Update failed");
    }
  };

  const fieldClass = "bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-1";
  const labelClass = "text-[10px] font-semibold text-gray-400 uppercase tracking-tight";
  const valueClass = "text-[14px] font-bold text-[#374151]";
  const inputClass = "bg-transparent border-none p-0 text-[14px] font-bold text-[#374151] focus:ring-0 w-full";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[540px] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold text-[#111827]">
            Booking Id: <span className="text-gray-500 font-bold">{booking.id}</span>
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-2 space-y-4 custom-scrollbar">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 mb-2">
              {error}
            </div>
          )}

          {/* Row 1: Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <span className={labelClass}>Chef name</span>
              <span className={valueClass}>{booking.chefName}</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>Client name</span>
              <span className={valueClass}>{booking.client}</span>
            </div>
          </div>

          {/* Row 2: Event & Guests */}
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <span className={labelClass}>Event type</span>
              <span className={valueClass}>{booking.eventType}</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>No. of Guest</span>
              <span className={valueClass}>{booking.guests}</span>
            </div>
          </div>

          {/* Row 3: Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <span className={labelClass}>Date</span>
              <span className={valueClass}>{booking.date}</span>
            </div>
            <div className={fieldClass}>
              <span className={labelClass}>Time</span>
              <span className={valueClass}>{booking.time}</span>
            </div>
          </div>

          {/* Row 4: Address (Full Width) */}
          <div className={fieldClass}>
            <span className={labelClass}>Address</span>
            <span className={valueClass + " leading-relaxed"}>{booking.address}</span>
          </div>

          {/* Row 5: Additional Notes (Full Width) */}
          <div className={fieldClass}>
            <span className={labelClass}>Additional notes</span>
            <span className={valueClass}>{booking.requirements || "—"}</span>
          </div>

          {/* Row 6: Amounts & Zone */}
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <span className={labelClass}>Amount</span>
              <span className={valueClass}>{booking.amount}</span>
            </div>
            <div className={fieldClass}>
              <div className="flex justify-between items-center">
                <span className={labelClass}>Select Zone</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <select 
                value={zone} 
                onChange={(e) => setZone(e.target.value)}
                className={inputClass + " mt-1 -ml-1 cursor-pointer appearance-none outline-none"}
              >
                <option value="">No Zone</option>
                <option value="north">North Zone</option>
                <option value="south">South Zone</option>
                <option value="east">East Zone</option>
                <option value="west">West Zone</option>
              </select>
            </div>
          </div>

          {/* Row 7: Edit Amount & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <div className="flex justify-between items-center">
                <span className={labelClass}>Update status</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass + " mt-1 -ml-1 cursor-pointer appearance-none outline-none"}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-4 flex gap-4">
          <button 
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#E11D48] py-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send invite
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#E11D48] hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100 disabled:opacity-70"
          >
            {loading ? "Saving..." : (success ? <CheckCircle className="w-5 h-5" /> : "Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
