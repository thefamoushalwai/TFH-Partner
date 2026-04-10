"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const isChefsPage = pathname === "/chef" || pathname === "/chefs";
  const isBookingsPage = pathname === "/booking" || pathname === "/bookings";

  return (
    <header className="h-[60px] flex items-center justify-end px-6 flex-shrink-0 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        {isChefsPage ? (
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by name, city" 
                className="pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-gray-300 w-64 shadow-sm"
              />
            </div>
            <button className="px-5 py-2 bg-white border border-[#E5E7EB] text-[13px] font-medium rounded-md text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
              Filter
            </button>
            <button className="px-5 py-2 bg-[#E11D48] text-white text-[13px] font-medium rounded-md hover:bg-[#BE123C] transition-colors shadow-sm">
              + Add Chef
            </button>
          </>
        ) : isBookingsPage ? (
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search booking" 
                className="pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-gray-300 w-72 shadow-sm"
              />
            </div>
            <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[13px] font-medium rounded-md text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
              Export
            </button>
            <Link href="/bookings/new">
              <button className="px-4 py-2 bg-[#E11D48] text-white text-[13px] font-medium rounded-md hover:bg-[#BE123C] transition-colors shadow-sm">
                + New Booking
              </button>
            </Link>
          </>
        ) : (
          <>
            <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[13px] font-medium rounded-md text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
              Export Report
            </button>
            <Link href="/bookings/new">
              <button className="px-4 py-2 bg-[#E11D48] text-white text-[13px] font-medium rounded-md hover:bg-[#BE123C] transition-colors shadow-sm">
                + New Booking
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
