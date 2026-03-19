"use client";

import { Search, Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 bg-white  border-b border-zinc-200 ">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="w-full bg-zinc-50  border border-zinc-200  rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-500 hover:bg-zinc-100  rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-500 border-2 border-white  rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-zinc-200  mx-1"></div>
        <button className="flex items-center gap-2.5 p-1 pr-3 hover:bg-zinc-50  rounded-full transition-colors border border-transparent hover:border-zinc-200 ">
          <div className="w-8 h-8 rounded-full bg-brand-50  flex items-center justify-center text-brand-600  font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block text-zinc-700 ">Admin User</span>
        </button>
      </div>
    </header>
  );
}
