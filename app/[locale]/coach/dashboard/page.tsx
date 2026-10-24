"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
import CoachSlotCreationModal from "@/components/coach/CoachSlotCreationModal";

export default function CoachDashboardPage() {
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";
    const t = useTranslations("CoachPortal");

    const [loading, setLoading] = useState(true);
    const [coachName, setCoachName] = useState("");
    const [bookings, setBookings] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [assignedModules, setAssignedModules] = useState<any[]>([]);
    const [showSlotModal, setShowSlotModal] = useState(false);

    const fetchCoachData = useCallback(async () => {
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
                setCoachName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || t("coachDefault"));
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
    }, [t]);

    useEffect(() => {
        fetchCoachData();
    }, [fetchCoachData]);

    const upcomingBookings = bookings.filter(b => b.status === "confirmed");
    const openSlots = slots.filter(s => !s.is_booked);

    const parseMeetingDate = (b: any) => {
        const rawDate = b.meeting_date || b.date;
        const time = b.start_time;
        if (rawDate && time) {
            const cleanTime = time.includes("T") ? time.split("T")[1] : time;
            const d = new Date(`${rawDate.split("T")[0]}T${cleanTime.length === 5 ? cleanTime + ":00" : cleanTime}`);
            if (!isNaN(d.getTime())) return d;
        }
        if (rawDate) {
            const d = new Date(rawDate.includes("T") ? rawDate : `${rawDate}T00:00:00`);
            if (!isNaN(d.getTime())) return d;
        }
        if (b.meeting_time) {
            const d = new Date(b.meeting_time);
            if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    };

    const formatMeetingTime = (b: any) => {
        if (b.start_time) {
            const start = b.start_time.includes("T") ? b.start_time.split("T")[1].slice(0, 5) : b.start_time.slice(0, 5);
            if (b.end_time) {
                const end = b.end_time.includes("T") ? b.end_time.split("T")[1].slice(0, 5) : b.end_time.slice(0, 5);
                return `${start} - ${end}`;
            }
            return start;
        }
        const d = parseMeetingDate(b);
        return d.toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const parseModuleTitle = (m: any) => {
        if (!m) return t("mentorshipSession");
        const title = m.title;
        if (!title) return t("mentorshipSession");
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return parsed[locale] || parsed.en || parsed.ar || title;
            } catch {
                return title;
            }
        }
        return title[locale] || title.en || title.ar || t("mentorshipSession");
    };

    const renderStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {t("statusCompleted")}
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        {t("statusCancelled")}
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {t("statusPending")}
                    </span>
                );
            case "attended":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {t("statusAttended")}
                    </span>
                );
            case "no_show":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {t("statusNoShow")}
                    </span>
                );
            case "confirmed":
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t("statusConfirmed")}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" dir="ltr">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-[#0B2545] to-[#133055] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 mb-4">
                        <Users className="w-3.5 h-3.5" />
                        {t("facultyBadge")}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">
                        {coachName ? t("welcomeBack", { name: coachName }) : t("welcomeBackNoName")}
                    </h1>
                    <p className="text-white/80 text-sm leading-relaxed">
                        {t("dashboardDesc")}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setShowSlotModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B2545] font-bold text-xs hover:bg-[#e0bb43] transition-all shadow-md cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            {t("addNewSlot")}
                        </button>
                        <Link
                            href={`/${locale}/coach/sessions`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10"
                        >
                            <Calendar className="w-4 h-4 text-[#D4AF37]" />
                            {t("manageCalendarSlots")}
                        </Link>
                        <Link
                            href={`/${locale}/coach/modules`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10"
                        >
                            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                            {t("viewAssignedModules")}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("upcomingSessions")}</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{upcomingBookings.length}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">{t("confirmedWithStudents")}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-[#0B2545]" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("availableSlots")}</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{openSlots.length}</h3>
                        <p className="text-xs text-gray-400 mt-1">{t("readyForBooking")}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("assignedModules")}</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">{assignedModules.length}</h3>
                        <p className="text-xs text-gray-400 mt-1">{t("certifiedCurricula")}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("completedSessions")}</p>
                        <h3 className="text-2xl font-bold text-[#0B2545] mt-1">
                            {bookings.filter(b => b.status === "completed").length}
                        </h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">{t("attendanceRate")}</p>
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
                        <h2 className="text-lg font-bold text-[#0B2545]">{t("scheduledSessionsTitle")}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowSlotModal(true)}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {t("addNewSlot")}
                        </button>
                        <Link
                            href={`/${locale}/coach/sessions`}
                            className="text-xs font-bold text-[#0B2545] hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
                        >
                            {t("calendarView")}
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col justify-center items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                        <p className="text-xs text-gray-400">{t("loadingSessions")}</p>
                    </div>
                ) : upcomingBookings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-[#0B2545]">{t("noUpcomingSessions")}</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            {t("noUpcomingSessionsDesc")}
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowSlotModal(true)}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {t("addAvailableSlots")}
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-sm text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">{t("colStudent")}</th>
                                    <th className="px-6 py-4">{t("colModuleTopic")}</th>
                                    <th className="px-6 py-4">{t("colDateTime")}</th>
                                    <th className="px-6 py-4">{t("colStatus")}</th>
                                    <th className="px-6 py-4 text-right">{t("colZoomMeeting")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {upcomingBookings.map((b) => {
                                    const studentName = b.student ? `${b.student.first_name || ""} ${b.student.last_name || ""}`.trim() : t("studentDefault");
                                    return (
                                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-[#0B2545]">{studentName}</div>
                                                <div className="text-xs text-gray-400">{b.student?.email || t("enrolledStudent")}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                                                {parseModuleTitle(b.module)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                <div className="font-semibold text-gray-800">
                                                    {parseMeetingDate(b).toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-gray-400">
                                                    {formatMeetingTime(b)} ({t("durationMins", { count: b.duration_minutes || 45 })})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderStatusBadge(b.status)}
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
                                                        {t("joinZoom")}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">{t("noLink")}</span>
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

            {/* Slot Creation Modal */}
            <CoachSlotCreationModal
                isOpen={showSlotModal}
                onClose={() => setShowSlotModal(false)}
                assignedModules={assignedModules}
                onSlotCreated={fetchCoachData}
                locale={locale}
            />
        </div>
    );
}
