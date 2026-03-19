import { getDashboardStats } from "@/app/actions/dashboard";
import { Users, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardPage() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to connect to Firebase</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">
          {result.error || "An unknown error occurred while authenticating with Firebase Admin."}
        </p>
      </div>
    );
  }

  const { totalUsers, verifiedUsers, pendingKyc, users } = result.data;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Verified Users", value: verifiedUsers, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Pending Verification", value: pendingKyc, icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-1">
          Overview of your application stats directly from Firestore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                <div className="text-3xl font-bold mt-2 text-zinc-900">{stat.value}</div>
              </div>
              <div className={`p-4 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl shadow-sm overflow-hidden filter hover:drop-shadow-sm transition-all">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Partner Directory</h2>
          <span className="text-sm text-brand-600 bg-brand-50 px-3 py-1 rounded-full font-medium">{users.length} Users Listed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">User Profile</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Location</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">KYC Status</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Submitted</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.slice(0, 10).map((user) => (
                <tr key={user.uid} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {user.selfieUrl ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200">
                          <Image src={user.selfieUrl} alt={user.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg">
                          {user.name && user.name !== "Unknown User" ? user.name[0].toUpperCase() : "?"}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-zinc-900">{user.name}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{user.email || user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-600 font-medium">
                    {user.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.kycStatus === "pending_verification" && (
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                         Pending
                       </span>
                    )}
                    {user.kycStatus === "approved" || user.kycStatus === "verified" ? (
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                         Verified
                       </span>
                    ) : user.kycStatus === "unsubmitted" ? (
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                         Incomplete
                       </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-600 font-medium">
                    {user.kycSubmittedAt ? new Date(user.kycSubmittedAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/users/${user.uid}`} className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 text-zinc-300 mb-3" />
                      <p>No user documents found in Firestore.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
