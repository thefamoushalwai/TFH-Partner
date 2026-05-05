"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Search,
  ChevronDown,
  Users,
  Clock,
  CheckCircle2,
  Gift,
  X,
} from "lucide-react";
import { getReferralsList, updateReferral } from "@/app/actions/referrals";
import type { ReferralRow, ReferralStats } from "@/app/actions/referrals";

const ITEMS_PER_PAGE = 12;

type StatusFilter = "all" | "pending" | "joined" | "rewarded";

const STATUS_STYLES: Record<
  ReferralRow["status"],
  { bg: string; text: string; border: string; label: string }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    label: "Pending",
  },
  joined: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    label: "Joined",
  },
  rewarded: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    label: "Rewarded",
  },
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPhone(phone: string) {
  if (!phone) return "—";
  // mask middle digits for privacy display
  if (phone.length >= 10) {
    return phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4);
  }
  return phone;
}

// ── Update Modal ─────────────────────────────────────────────────────────────
interface UpdateModalProps {
  referral: ReferralRow;
  onClose: () => void;
  onSaved: () => void;
}

function UpdateModal({ referral, onClose, onSaved }: UpdateModalProps) {
  const [status, setStatus] = useState<ReferralRow["status"]>(referral.status);
  const [reward, setReward] = useState<string>(referral.reward > 0 ? String(referral.reward) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const rewardNum = reward ? Number(reward) : undefined;
    if (reward && isNaN(Number(reward))) {
      setError("Reward must be a valid number.");
      setSaving(false);
      return;
    }
    const res = await updateReferral(referral.referralId, status, rewardNum);
    setSaving(false);
    if (res.success) {
      onSaved();
    } else {
      setError(res.error || "Failed to update.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1">Update Referral</h3>
        <p className="text-xs text-gray-500 mb-5">
          ID:{" "}
          <span className="font-mono text-gray-700">
            {referral.referralId.slice(0, 10)}…
          </span>
        </p>

        <div className="space-y-4">
          {/* Referrer */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Referrer (Partner)
            </label>
            <p className="text-sm text-gray-800 font-medium">{referral.referrerName}</p>
          </div>

          {/* Referred Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Referred Phone
            </label>
            <p className="text-sm text-gray-800 font-medium font-mono">
              {referral.referredPhone}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReferralRow["status"])}
                className="w-full appearance-none bg-white border border-[#d3dbe2] rounded-md pl-3 pr-8 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#C44629] cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="joined">Joined</option>
                <option value="rewarded">Rewarded</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reward */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Reward Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full border border-[#d3dbe2] rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#C44629] placeholder-gray-400"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Leave blank to keep existing value. Set 0 to clear.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-md bg-[#df201f] text-white text-sm font-medium hover:bg-[#c21a19] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [allReferrals, setAllReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updateTarget, setUpdateTarget] = useState<ReferralRow | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReferralsList();
      if (!res.success || !res.data) {
        setError(res.error || "Failed to load referrals.");
        return;
      }
      setStats(res.data.stats);
      setAllReferrals(res.data.referrals);
    } catch (e: any) {
      setError(e.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filtering
  const filtered = allReferrals.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.referrerName.toLowerCase().includes(q) ||
        r.referredPhone.includes(q) ||
        r.referralId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageRows = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setCurrentPage(1);
  };

  const statCards = [
    {
      title: "Total Referrals",
      value: stats ? stats.total.toLocaleString() : "—",
      sub: "All time",
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      color: "border-t-indigo-400",
    },
    {
      title: "Pending",
      value: stats ? stats.pending.toLocaleString() : "—",
      sub: "Awaiting join",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: "border-t-amber-400",
    },
    {
      title: "Joined",
      value: stats ? stats.joined.toLocaleString() : "—",
      sub: "Signed up via referral",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
      color: "border-t-blue-400",
    },
    {
      title: "Rewarded",
      value: stats ? stats.rewarded.toLocaleString() : "—",
      sub: stats ? `₹${stats.totalRewardsPaid.toLocaleString("en-IN")} paid` : "—",
      icon: <Gift className="w-5 h-5 text-emerald-500" />,
      color: "border-t-emerald-400",
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to load referrals</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">{error}</p>
        <button
          onClick={fetchAll}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#eeefef] min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl border-2 border-[#d3dbe2] border-t-4 ${card.color} p-5 flex items-start justify-between`}
          >
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-[10px] text-gray-400 mt-1">{card.sub}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {(["all", "pending", "joined", "rewarded"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-4 py-2 rounded-md text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? "bg-[#df201f] text-white border-[#df201f]"
                  : "bg-white text-gray-600 border-[#d3dbe2] hover:bg-gray-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {stats && s !== "all" && (
                <span className="ml-1.5 opacity-70">
                  ({stats[s as keyof ReferralStats] as number})
                </span>
              )}
              {stats && s === "all" && (
                <span className="ml-1.5 opacity-70">({stats.total})</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, or ID…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2 bg-white border border-[#d3dbe2] rounded-md text-xs w-[270px] focus:outline-none focus:ring-1 focus:ring-[#C44629] transition-all placeholder-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-[#d3dbe2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#EAEBEB]/50 border-b border-gray-200 text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">S. No.</th>
                <th className="px-6 py-4 whitespace-nowrap">Referral ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Referrer (Partner)</th>
                <th className="px-6 py-4 whitespace-nowrap">Referred Phone</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Reward</th>
                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="flex items-center justify-center text-gray-500 gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Loading referrals…</span>
                    </div>
                  </td>
                </tr>
              ) : pageRows.length > 0 ? (
                pageRows.map((row, i) => {
                  const s = STATUS_STYLES[row.status];
                  return (
                    <tr key={row.referralId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                        {String(startIdx + i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {row.referralId.slice(0, 10)}…
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px] uppercase border border-[#d3dbe2]">
                            {row.referrerName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-gray-800">
                            {row.referrerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-700">
                        {formatPhone(row.referredPhone)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">
                        {row.reward > 0 ? `₹${row.reward.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setUpdateTarget(row)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-[#df201f] hover:text-white text-gray-600 text-[11px] font-semibold rounded-md transition-all border border-[#d3dbe2] hover:border-[#df201f]"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-gray-400 text-sm">
                    No referrals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-[#FAFAFA]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &lsaquo;
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex items-center justify-center w-7 h-7 rounded text-xs font-medium shadow-sm ${
                      currentPage === page
                        ? "bg-[#E11D48] text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-xs shadow-sm disabled:opacity-40"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {updateTarget && (
        <UpdateModal
          referral={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onSaved={async () => {
            setUpdateTarget(null);
            await fetchAll();
          }}
        />
      )}
    </div>
  );
}
