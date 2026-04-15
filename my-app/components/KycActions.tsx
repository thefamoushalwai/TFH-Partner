"use client";

import { updateKycStatus } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function KycActions({ uid, currentStatus }: { uid: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdate = async (status: "approved" | "rejected") => {
    setLoading(status);
    const res = await updateKycStatus(uid, status);
    setLoading(null);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Something went wrong");
    }
  };

  const isApproved = currentStatus === "approved" || currentStatus === "verified";
  const isRejected = currentStatus === "rejected";

  return (
    <div className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
      <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2 relative z-10">KYC Verification</h3>
      <p className="text-sm text-zinc-500 mb-6 relative z-10 leading-relaxed font-medium">
        Review the documents above and update this partner&apos;s verification status.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <button
          onClick={() => handleUpdate("approved")}
          disabled={loading !== null || isApproved}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${
            isApproved
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50 cursor-default opacity-80"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-200/50 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] border border-emerald-400/20"
          } disabled:opacity-60 disabled:hover:-translate-y-0 disabled:hover:shadow-sm`}
        >
          {loading === "approved" ? "Approving…" : isApproved ? "✓ Approved" : "Approve Profile"}
        </button>
        <button
          onClick={() => handleUpdate("rejected")}
          disabled={loading !== null || isRejected}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${
            isRejected
              ? "bg-red-50 text-red-600 border border-red-100/50 cursor-default opacity-80"
              : "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50 hover:-translate-y-0.5 active:scale-[0.98]"
          } disabled:opacity-60 disabled:hover:-translate-y-0 disabled:hover:shadow-sm`}
        >
          {loading === "rejected" ? "Rejecting…" : isRejected ? "✗ Rejected" : "Reject"}
        </button>
      </div>
    </div>
  );
}
