"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Calendar,
    Video,
    Users,
    BookOpen,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Loader2,
    ExternalLink,
    Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function CoachDashboardPage() {
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";

    const [loading, setLoading] = useState(true);
    const [coachName, setCoachName] = useState("");
    const [bookings, setBookings] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [assignedModules, setAssignedModules] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCoachData() {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Profile name
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name, last_name")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setCoachName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Coach");
                }

                // Fetch bookings for this coach
                const resBookings = await fetch(`/api/coach/bookings?coachId=${user.id}`);
                if (resBookings.ok) {
                    const data = await resBookings.json();
                    setBookings(data.bookings || []);
                }

                // Fetch availability slots
                const resSlots = await fetch(`/api/coach/availability?coachId=${user.id}&all=true`);
                if (resSlots.ok) {
                    const data = await resSlots.json();
                    setSlots(data.slots || []);
                }

                // Fetch assigned modules from admin API
                const resAdmin = await fetch("/api/admin/coaches");
                if (resAdmin.ok) {
                    const data = await resAdmin.json();
                    const coachAssignments = (data.assignments || []).filter((a: any) => a.coach_id === user.id);
                    const modIds = coachAssignments.map((a: any) => a.module_id);
                    const myMods = (data.modules || []).filter((m: any) => modIds.includes(m.id));
                    setAssignedModules(myMods);
                }

            } catch (err) {
                console.error("Error loading coach dashboard:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCoachData();
    }, []);

    const upcomingBookings = bookings.filter(b => b.status === "confirmed");
    const openSlots = slots.filter(s => !s.is_booked);

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" dir="ltr">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-[#0B2545] to-[#133055] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 mb-4">
                        <Users className="w-3.5 h-3.5" />
                        Coach & Instructor Faculty Portal
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">
                        {isAr ? `مرحباً بك، ${coachName}` : `Welcome back, ${coachName}`}
                    </h1>
                    <p className="text-white/80 text-sm leading-relaxed">
                        Manage your 1-on-1 coaching calendar, conduct video sessions with enrolled students, and guide the next generation of global leaders.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={`/${locale}/coach/sessions`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B2545] font-bold text-xs hover:bg-[#e0bb43] transition-all shadow-md"
                        >
                            <Calendar className="w-4 h-4" />
                            Manage Calendar Slots
                        </Link>
                        <Link
                            href={`/${locale}/coach/modules`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10"
                        >
                            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                            View Assigned Modules
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming Sessions</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{upcomingBookings.length}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Confirmed with students</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-[#0B2545]" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Slots</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{openSlots.length}</h3>
                        <p className="text-xs text-gray-400 mt-1">Ready for booking</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Modules</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{assignedModules.length}</h3>
                        <p className="text-xs text-gray-400 mt-1">Certified curricula</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Sessions</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">
                            {bookings.filter(b => b.status === "completed").length}
                        </h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">100% attendance</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Upcoming 1-on-1 Sessions Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-[#0B2545]" />
                        <h2 className="text-lg font-bold text-[#0B2545]">Scheduled 1-on-1 Sessions</h2>
                    </div>
                    <Link
                        href={`/${locale}/coach/sessions`}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
                    >
                        Calendar View
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                ) : upcomingBookings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-[#0B2545]">No upcoming sessions scheduled</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            Publish available calendar slots so enrolled students can book 1-on-1 coaching appointments with you.
                        </p>
                        <Link
                            href={`/${locale}/coach/sessions`}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Available Slots
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Module / Topic</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Zoom Meeting</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {upcomingBookings.map((b) => {
                                    const studentName = b.student ? `${b.student.first_name || ""} ${b.student.last_name || ""}`.trim() : "Student";
                                    return (
                                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-[#0B2545]">{studentName}</div>
                                                <div className="text-xs text-gray-400">{b.student?.email || "Enrolled Student"}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                                                {typeof b.module?.title === "string" ? b.module?.title : (b.module?.title?.en || "Mentorship Session")}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                <div className="font-semibold text-gray-800">
                                                    {new Date(b.meeting_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-gray-400">
                                                    {new Date(b.meeting_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({b.duration_minutes || 45} mins)
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Confirmed
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {b.zoom_link ? (
                                                    <a
                                                        href={b.zoom_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                                                    >
                                                        <Video className="w-3.5 h-3.5" />
                                                        Join Zoom
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No link</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
