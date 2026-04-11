"use client";

import { BookingRow } from "@/app/actions/bookings";
import { Eye } from "lucide-react";
import { useState } from "react";
import DeleteBookingButton from "./DeleteBookingButton";
import BookingDetailsModal from "./BookingDetailsModal";

interface BookingActionButtonsProps {
  booking: BookingRow;
}

export default function BookingActionButtons({ booking }: BookingActionButtonsProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 text-gray-400">
        <button 
          onClick={() => setShowModal(true)}
          className="hover:text-gray-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <DeleteBookingButton bookingId={booking.fullId} />
      </div>

      {showModal && (
        <BookingDetailsModal 
          booking={booking} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
