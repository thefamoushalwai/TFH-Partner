"use client";

import { useState } from "react";
import Link from "next/link";
import type { DashboardAnalytics } from "@/app/actions/dashboard";

// ─── Colour constants ──────────────────────────────────────────────────────────

const BREAKDOWN_COLORS = [
  "bg-[#e6c987]",
  "bg-[#58b388]",
  "bg-[#4b85ee]",
  "bg-[#ef7381]",
  "bg-[#805fbd]",
  "bg-[#805fbd]",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value}`;
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved")
    return { bg: "bg-emerald-100 text-emerald-700", label: "Completed" };
  if (s === "confirmed")
    return { bg: "bg-blue-100 text-blue-700", label: "Confirmed" };
  if (s === "cancelled" || s === "rejected" || s === "canceled")
    return { bg: "bg-red-100 text-red-600", label: "Cancelled" };
  if (s === "pending" || s === "pending_verification")
    return { bg: "bg-yellow-100 text-yellow-700", label: "Pending" };
  return { bg: "bg-gray-100 text-gray-600", label: status };
}

// ─── SVG Line Chart ────────────────────────────────────────────────────────────

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 600;
  const H = 190;
  const PAD = { top: 24, right: 12, bottom: 28, left: 42 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const yTicks = 4;

  const pts = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) : 0.5) * innerW,
    y: PAD.top + innerH - (d.value / maxVal) * innerH,
    value: d.value,
    label: d.label,
  }));

  let linePath = "";
  if (pts.length > 0) {
    linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const cpX = (p1.x - p0.x) * 0.4;
      linePath += ` C ${(p0.x + cpX).toFixed(1)} ${p0.y.toFixed(1)}, ${(p1.x - cpX).toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
  }

  let areaPath = "";
  if (pts.length > 0) {
    areaPath = linePath +
      ` L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)}` +
      ` L ${pts[0].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)}` +
      ` Z`;
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 190 }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Y-axis guide lines */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const yVal = Math.round((maxVal * i) / yTicks);
        const yPos = PAD.top + innerH - (yVal / maxVal) * innerH;
        return (
          <g key={i}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={yPos} y2={yPos} stroke="#F3F4F6" strokeWidth="1" />
            <text x={PAD.left - 5} y={yPos + 3.5} textAnchor="end" fontSize="8.5" fill="#9CA3AF">
              {formatCurrency(yVal)}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#chartGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Points & x-labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#EF4444" stroke="white" strokeWidth="1.5" />
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8.5" fill="#9CA3AF">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

export default function DashboardClient({ data }: { data: DashboardAnalytics }) {
  const [chartMode, setChartMode] = useState<"weekly" | "monthly">("weekly");

  const {
    totalRevenue,
    activeChefs,
    totalBookings,
    avgBookingValue,
    monthlyBookings,
    weeklyBookings,
    cuisineBreakdown,
    locationBreakdown,
    recentBookings,
  } = data;

  const displayOccasions = [
    "Roka ceremony",
    "Anniversary",
    "Birthday",
    "Wedding",
    "Pooja at home",
    "Others",
  ].map((label) => {
    const match = cuisineBreakdown?.find(
      (c) => c.label === label
    );
    return { label, pct: match?.pct ?? 0 };
  });

  const displayLocations = [
    "Delhi",
    "Noida",
    "Gurugram",
    "Faridabad",
    "Ghaziabad",
    "Others",
  ].map((label) => {
    const match = locationBreakdown?.find(
      (c) => c.label === label
    );
    return { label, pct: match?.pct ?? 0 };
  });

  const chartData = chartMode === "weekly" ? weeklyBookings : monthlyBookings;

  return (
    <div className="bg-[#eeefef] min-h-screen">
      {/* ── Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-[#d3dbe2] p-5">
          <p className="text-[11px] text-gray-500 mb-1">Total Revenue</p>
          <p className="text-[22px] font-bold text-gray-900 leading-tight">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] text-gray-400 mt-1">15% this month</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d3dbe2] p-5">
          <p className="text-[11px] text-gray-500 mb-1">Active Chef</p>
          <p className="text-[22px] font-bold text-gray-900 leading-tight">{activeChefs}</p>
          <p className="text-[10px] text-gray-400 mt-1">4 new this week</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d3dbe2] p-5">
          <p className="text-[11px] text-gray-500 mb-1">Avg. booking value</p>
          <p className="text-[22px] font-bold text-gray-900 leading-tight">{formatCurrency(avgBookingValue)}</p>
          <p className="text-[10px] text-gray-400 mt-1">6% vs last month</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d3dbe2] p-5">
          <p className="text-[11px] text-gray-500 mb-1">Total Bookings</p>
          <p className="text-[22px] font-bold text-gray-900 leading-tight">{(totalBookings ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-1">12.5% vs last month</p>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: chart + table */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Booking Revenue */}
          <div className="bg-white rounded-xl border border-[#d3dbe2] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800">Booking Revenue</h2>
              <div className="flex items-center gap-0.5 bg-[#F3F4F6] rounded-full p-0.5">
                <button
                  onClick={() => setChartMode("weekly")}
                  className={`text-[11px] font-semibold px-3.5 py-1 rounded-full transition-all ${
                    chartMode === "weekly" ? "bg-[#EF4444] text-white shadow" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartMode("monthly")}
                  className={`text-[11px] font-semibold px-3.5 py-1 rounded-full transition-all ${
                    chartMode === "monthly" ? "bg-[#EF4444] text-white shadow" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <LineChart data={chartData} />
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl border border-[#d3dbe2] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800">Recent Bookings</h2>
              <Link href="/bookings" className="text-[11px] font-semibold text-[#EF4444] hover:underline transition-opacity">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Booking id", "Client Name", "Chef name", "Event Type", "Date & Time", "Amount", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="pb-2.5 pr-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings && recentBookings.length > 0 ? (
                    recentBookings.map((b, i) => {
                      const { bg, label } = statusStyle(b.status);
                      const [date, time] = b.dateTime.split("\n");
                      return (
                        <tr
                          key={i}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="py-3 pr-4 text-[11px] font-medium text-gray-800 whitespace-nowrap">
                            {b.id}
                          </td>
                          <td className="py-3 pr-4 text-[11px] text-gray-700 whitespace-nowrap">{b.clientName}</td>
                          <td className="py-3 pr-4 text-[11px] text-gray-700 whitespace-nowrap">{b.chefName}</td>
                          <td className="py-3 pr-4 text-[11px] text-gray-700 whitespace-nowrap">{b.eventType}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <p className="text-[11px] text-gray-700">{date}</p>
                            <p className="text-[10px] text-gray-400">{time}</p>
                          </td>
                          <td className="py-3 pr-4 text-[11px] text-gray-700 whitespace-nowrap">
                            Rs. {b.amount.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${bg}`}
                            >
                              {label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                        No recent bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: breakdown panels */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Bookings by Occasion */}
          <div className="bg-white rounded-xl border border-[#d3dbe2] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <h2 className="text-[13px] font-bold text-gray-800">Bookings by occasion</h2>
              <p className="text-[10px] text-gray-500 mt-1">By booking count</p>
            </div>
            <div className="p-5 space-y-4">
              {displayOccasions.length > 0 ? (
                displayOccasions.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-[100px] shrink-0 text-xs text-gray-700 leading-tight truncate">
                      {item.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-[#e6e4df] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length]}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right shrink-0">
                      {item.pct}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          {/* Bookings by Location */}
          <div className="bg-white rounded-xl border border-[#d3dbe2] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <h2 className="text-[13px] font-bold text-gray-800">Bookings by Location</h2>
              <p className="text-[10px] text-gray-500 mt-1">By booking count</p>
            </div>
            <div className="p-5 space-y-4">
              {displayLocations.length > 0 ? (
                displayLocations.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-[100px] shrink-0 text-xs text-gray-700 leading-tight truncate">
                      {item.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-[#e6e4df] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length]}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right shrink-0">
                      {item.pct}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
