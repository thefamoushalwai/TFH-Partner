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
    <div className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-zinc-900 mb-2">KYC Verification</h3>
      <p className="text-sm text-zinc-500 mb-5">
        Review the documents above and update this partner&apos;s verification status.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => handleUpdate("approved")}
          disabled={loading !== null || isApproved}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isApproved
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default"
              : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
          } disabled:opacity-60`}
        >
          {loading === "approved" ? "Approving…" : isApproved ? "✓ Approved" : "Approve"}
        </button>
        <button
          onClick={() => handleUpdate("rejected")}
          disabled={loading !== null || isRejected}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isRejected
              ? "bg-red-100 text-red-700 border border-red-200 cursor-default"
              : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
          } disabled:opacity-60`}
        >
          {loading === "rejected" ? "Rejecting…" : isRejected ? "✗ Rejected" : "Reject"}
        </button>
      </div>
    </div>
  );
}
