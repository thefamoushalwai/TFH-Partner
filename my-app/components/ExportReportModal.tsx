"use client";

import { useState } from "react";
import { X, Download, Loader2, FileSpreadsheet, Calendar } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportReportModalProps {
  onClose: () => void;
}

export default function ExportReportModal({ onClose }: ExportReportModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ count: number } | null>(null);

  async function handleExport() {
    if (!fromDate || !toDate) {
      setError("Please select both From and To dates.");
      return;
    }
    if (fromDate > toDate) {
      setError("From date cannot be after To date.");
      return;
    }
    setError(null);
    setLoading(true);
    setPreview(null);

    try {
      const res = await fetch(`/api/export-report?start=${fromDate}&end=${toDate}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to fetch data");
      }

      const data: Record<string, any>[] = json.data;

      if (data.length === 0) {
        setPreview({ count: 0 });
        setLoading(false);
        return;
      }

      // Build workbook
      const ws = XLSX.utils.json_to_sheet(data);

      // Auto column widths
      const colWidths = Object.keys(data[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...data.map((row) => String(row[key] ?? "").length)
        ) + 2,
      }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bookings");

      // Summary sheet
      const statusGroups: Record<string, number> = {};
      let totalRevenue = 0;
      for (const row of data) {
        const s = row["Status"] || "Unknown";
        statusGroups[s] = (statusGroups[s] || 0) + 1;
        totalRevenue += Number(row["Amount (₹)"]) || 0;
      }
      const summaryRows = [
        { Metric: "Report Period", Value: `${fromDate} to ${toDate}` },
        { Metric: "Total Bookings", Value: data.length },
        { Metric: "Total Revenue (₹)", Value: totalRevenue },
        ...Object.entries(statusGroups).map(([k, v]) => ({ Metric: `${k} Bookings`, Value: v })),
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 24 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      const filename = `THF_Report_${fromDate}_to_${toDate}.xlsx`;
      XLSX.writeFile(wb, filename);

      setPreview({ count: data.length });
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header band */}
        <div className="bg-gradient-to-r from-[#E11D48] to-[#BE123C] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-white font-bold text-[15px]">Export Report</h2>
              <p className="text-white/70 text-[11px] mt-0.5">Download bookings as Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">

          {/* Date range inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={fromDate}
                  max={today}
                  onChange={(e) => { setFromDate(e.target.value); setError(null); setPreview(null); }}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={toDate}
                  max={today}
                  onChange={(e) => { setToDate(e.target.value); setError(null); setPreview(null); }}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "This Month", getDates: () => {
                  const n = new Date();
                  return { f: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0,10), t: today };
                }},
                { label: "Last Month", getDates: () => {
                  const n = new Date();
                  const first = new Date(n.getFullYear(), n.getMonth() - 1, 1);
                  const last  = new Date(n.getFullYear(), n.getMonth(), 0);
                  return { f: first.toISOString().slice(0,10), t: last.toISOString().slice(0,10) };
                }},
                { label: "Last 7 Days", getDates: () => {
                  const n = new Date(); const past = new Date(n); past.setDate(n.getDate() - 6);
                  return { f: past.toISOString().slice(0,10), t: today };
                }},
                { label: "Last 30 Days", getDates: () => {
                  const n = new Date(); const past = new Date(n); past.setDate(n.getDate() - 29);
                  return { f: past.toISOString().slice(0,10), t: today };
                }},
                { label: "This Year", getDates: () => ({
                  f: `${new Date().getFullYear()}-01-01`, t: today,
                })},
              ].map(({ label, getDates }) => (
                <button
                  key={label}
                  onClick={() => { const { f, t } = getDates(); setFromDate(f); setToDate(t); setError(null); setPreview(null); }}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-full border border-gray-200 text-gray-600 hover:border-[#E11D48] hover:text-[#E11D48] hover:bg-red-50 transition-all"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Includes info */}
          <div className="bg-gray-50 rounded-xl p-4 text-[11px] text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">Report includes:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Booking ID, Chef Name, Client Name, Phone</li>
              <li>Event Type, Date & Time, Guests, Amount</li>
              <li>Status, Location, Zone, Address, Requirements</li>
              <li>Summary sheet with revenue totals</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[12px] text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Success preview */}
          {preview && preview.count > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-[12px] text-emerald-700 font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Downloaded {preview.count} booking{preview.count !== 1 ? "s" : ""} successfully!
            </div>
          )}
          {preview && preview.count === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-700 font-medium">
              No bookings found in this date range.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
