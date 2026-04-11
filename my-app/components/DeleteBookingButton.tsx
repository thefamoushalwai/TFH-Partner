"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBooking } from "@/app/actions/bookings";

interface DeleteBookingButtonProps {
  bookingId: string;
}

export default function DeleteBookingButton({ bookingId }: DeleteBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteBooking(bookingId);
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hover:text-red-500 transition-colors"
        title="Delete Booking"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Confirmation</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-8 px-2">
                Do you want to delete this booking?
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#E11D48] text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
