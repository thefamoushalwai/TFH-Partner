import { getUserById } from "@/app/actions/user";
import { getChefBookings } from "@/app/actions/bookings";
import KycActions from "@/components/KycActions";
import { AlertCircle, ArrowLeft, ShieldCheck, Mail, Phone, MapPin, Briefcase, FileText, Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChefDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const [result, bookingsResult] = await Promise.all([
    getUserById(id),
    getChefBookings(id),
  ]);

  if (!result.success || !result.data) {
    if (result.error === "User not found") {
      notFound();
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 backdrop-blur-xl rounded-3xl border border-red-100 mt-10 shadow-sm animate-in fade-in zoom-in duration-500 mx-4 lg:mx-auto max-w-2xl">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-900 tracking-tight">Failed to load user</h2>
        <p className="text-red-600/80 mt-3 text-center max-w-md text-lg">
          {result.error}
        </p>
      </div>
    );
  }

  const user = result.data as any;
  const bookings = bookingsResult.success && bookingsResult.data ? bookingsResult.data : [];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-zinc-50/30 animate-in fade-in duration-700">
      {/* Ambient background styling */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Dark Premium Hero Section */}
        <div className="relative rounded-[2rem] overflow-visible bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-10 mb-24 lg:mb-28">
          {/* Abstract glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-2">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              {/* Overlapping Avatar */}
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl p-1 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-sky-500 shadow-2xl absolute -bottom-20 lg:-bottom-24 z-20 transition-transform hover:scale-105 duration-500">
                <div className="w-full h-full rounded-[22px] overflow-hidden border-4 border-zinc-950 bg-zinc-900 flex items-center justify-center relative">
                  {user.kycDocuments?.selfieUrl ? (
                    <Image src={user.kycDocuments.selfieUrl} alt="Selfie" fill className="object-cover" />
                  ) : (
                    <span className="text-4xl lg:text-5xl font-black text-white">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
              </div>

              {/* Name and Basic Info */}
              <div className="mt-[4.5rem] sm:mt-0 sm:ml-40 lg:ml-48">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{user.name || 'Anonymous Partner'}</h1>
                  
                  {user.kycStatus === "pending_verification" && (
                    <span className="inline-flex items-center bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      Pending
                    </span>
                  )}
                  {(user.kycStatus === "approved" || user.kycStatus === "verified") && (
                    <span className="inline-flex items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      <ShieldCheck className="w-3 h-3 mr-1.5" />
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="text-zinc-400 text-sm flex items-center gap-3 flex-wrap">
                  <span className="bg-zinc-800 px-2 py-0.5 rounded font-mono text-xs border border-zinc-700 shadow-inner">
                    ID: {user.uid}
                  </span>
                  <span className="hidden sm:inline text-zinc-600">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.city || 'Location Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto -mt-6 sm:mt-0 self-end md:self-auto">
            
              <Link 
                href={`/users/${user.uid}/book`}
                className="flex-1 md:flex-none relative inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/10"
              >
                <Calendar className="w-4 h-4" />
                <span>Create Booking</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
          
          {/* Left Column: Contact, Profession, Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">
              <h3 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                Contact Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-4 text-zinc-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Email Address</p>
                    <p className="text-sm font-semibold text-zinc-800 truncate">{user.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-4 text-zinc-400">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Phone</p>
                    <p className="text-sm font-semibold text-zinc-800">{user.phone || '—'}</p>
                  </div>
                </div>

                {user.emergencyPhone && (
                  <div className="flex items-center p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center mr-4 text-rose-500 shadow-sm">
                      <AlertCircle className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-rose-400">Emergency Contact</p>
                      <p className="text-sm font-bold text-rose-700">{user.emergencyPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Profession Card */}
            <div className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">
              <h3 className="text-sm font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                Profile & Expertise
              </h3>

              <div className="space-y-6">
                {/* Expertise tags */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-3">Areas of Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {user.experience && user.experience.length > 0 ? user.experience.map((exp: string, idx: number) => (
                      <span key={idx} className="bg-zinc-900 text-white text-[11px] px-3 py-1.5 rounded-lg font-bold shadow-sm">
                        {exp}
                      </span>
                    )) : (
                      <span className="text-sm text-zinc-400 italic">No expertise listed</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Gender</p>
                    <p className="text-sm font-bold text-zinc-800 capitalize">{user.gender || '—'}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Full Address</p>
                  <p className="text-sm font-medium text-zinc-700 leading-relaxed">{user.address || '—'}</p>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">
               <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                KYC Verification Status
              </h3>
              <KycActions uid={user.uid} currentStatus={user.kycStatus || "unsubmitted"} />
            </div>

          </div>

          {/* Right Column: Docs & Bookings */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Documents Section */}
            <div className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-zinc-900">Verification Documents</h3>
                  <p className="text-sm text-zinc-500 mt-1 font-medium">Official identity proofs</p>
                </div>
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              {!user.kycDocuments ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
                    <FileText className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900">No Documents Uploaded</h4>
                  <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">This profile is missing required identity media.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Aadhar Front */}
                  <DocumentCard title="Aadhar Front" url={user.kycDocuments.aadharFrontUrl} delay="0" />
                  {/* Aadhar Back */}
                  <DocumentCard title="Aadhar Back" url={user.kycDocuments.aadharBackUrl} delay="100" />
                  {/* PAN Card */}
                  <DocumentCard title="PAN Card" url={user.kycDocuments.panUrl} delay="200" />
                </div>
              )}
            </div>

            {/* Bookings Section */}
            <div className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-zinc-900">Partner Bookings</h3>
                  <p className="text-sm text-zinc-500 mt-1 font-medium">Recent jobs and gigs</p>
                </div>
                <div className="bg-zinc-900 text-white py-1.5 px-4 rounded-xl text-sm font-bold shadow-sm inline-flex items-center">
                  <Calendar className="w-4 h-4 mr-2 opacity-50" />
                  {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="py-20 flex-1 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
                    <Calendar className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">No History</h3>
                  <p className="text-zinc-500 text-sm mt-2">There are no bookings associated with this partner.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-3xl border border-zinc-100 shadow-sm flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="py-4 px-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">ID</th>
                        <th className="py-4 px-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Client Info</th>
                        <th className="py-4 px-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Date & Time</th>
                        <th className="py-4 px-5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {bookings.map((booking) => (
                         <tr key={booking.fullId} className="hover:bg-zinc-50 transition-colors group">
                          <td className="py-4 px-5 align-top">
                            <span className="font-mono text-[13px] font-medium text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">{booking.id}</span>
                          </td>
                          <td className="py-4 px-5 align-top">
                            <div className="font-bold text-zinc-900 text-sm">{booking.client}</div>
                            <div className="text-[13px] font-medium text-zinc-500 mt-1">{booking.eventType} • {booking.guests} Guests</div>
                            <span className={`inline-flex items-center px-2 py-0.5 mt-2 rounded-[6px] text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                              booking.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" :
                              booking.status === "Cancelled" ? "bg-red-50 text-red-700 border border-red-200/50" :
                              booking.status === "In progress" ? "bg-amber-50 text-amber-700 border border-amber-200/50" :
                              "bg-sky-50 text-sky-700 border border-sky-200/50"
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 align-top">
                            <div className="font-semibold text-zinc-900 text-sm whitespace-nowrap">{booking.date}</div>
                            <div className="text-[13px] font-medium text-zinc-500 mt-1">{booking.time}</div>
                          </td>
                          <td className="py-4 px-5 align-top text-right">
                            <div className="font-bold text-zinc-900 mb-2">{booking.amount}</div>
                            <Link 
                              href={`/bookings`} 
                              className="text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg transition-colors inline-block shadow-sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({ title, url, delay }: { title: string, url?: string, delay: string }) {
  return (
    <div 
      className="group flex flex-col space-y-3 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '700ms' }}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-bold text-zinc-700">{title}</span>
        {url && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      </div>
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/60 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:border-zinc-300">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="block w-full h-full">
            <Image src={url} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-zinc-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center gap-2">
                <span>View Full Size</span>
              </span>
            </div>
          </a>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/80 p-4 text-center">
            <FileText className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">Missing Document</span>
          </div>
        )}
      </div>
    </div>
  );
}
