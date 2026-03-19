"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex-col hidden md:flex border-r border-zinc-200  bg-white ">
      <div className="h-16 flex items-center px-6 border-b border-zinc-100 ">
        <h1 className="text-xl font-bold tracking-tighter text-brand-500">
          TFH Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive
                  ? "bg-brand-50  text-brand-600 "
                  : "text-zinc-600  hover:bg-zinc-50  hover:text-zinc-900 "
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-brand-600 " : "text-zinc-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-100 ">
        <div className="text-xs text-zinc-500  text-center">
          &copy; 2026 The F House
        </div>
      </div>
    </aside>
  );
}
