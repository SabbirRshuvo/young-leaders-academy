"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Calendar,
    Clock,
    Video,
    User,
    BookOpen,
    CheckCircle2,
    ExternalLink,
    Loader2,
    ShieldCheck,
    X,
    Sparkles,
    Copy,
    Check
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

export default function StudentCoachingPage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";
    const t = useTranslations("StudentCoaching");

    const [activeTab, setActiveTab] = useState<"book" | "my-sessions">("book");
    const [loading, setLoading] = useState(true);

    const [enrolledModules, setEnrolledModules] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);

    // Booking modal state
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const [selectedCoach, setSelectedCoach] = useState<any | null>(null);
    const [selectedModule, setSelectedModule] = useState<any | null>(null);
    const [studentNotes, setStudentNotes] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            let user: any = session?.user;
            if (!user) {
                const { data: userData } = await supabase.auth.getUser();
                user = userData?.user ?? null;
            }
            if (user) {
                setCurrentUser(user);
            }

            // 1. Fetch available coach slots
            const resSlots = await fetch("/api/coach/availability");
            if (resSlots.ok) {
                const data = await resSlots.json();
                setAvailableSlots(data.slots || []);
            }

            // 2. Fetch student's bookings if user is available
            if (user?.id) {
                const resBookings = await fetch(`/api/coach/bookings?studentId=${user.id}`);
                if (resBookings.ok) {
                    const data = await resBookings.json();
                    setMyBookings(data.bookings || []);
                }
            }

            // 3. Fetch modules & coaches from admin API
            const resAdmin = await fetch("/api/admin/coaches");
            if (resAdmin.ok) {
                const data = await resAdmin.json();
                setCoaches(data.coaches || []);
                setAssignments(data.assignments || []);
                // If student is enrolled in courses/programs, use those modules; fallback to available modules
                setEnrolledModules(data.modules || []);
            }

        } catch (err: any) {
            console.error("Error loading student coaching data:", err);
            toast.error(t("toastLoadError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedCoach) return;

        try {
            setBookingSubmitting(true);
            const res = await fetch("/api/coach/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slotId: selectedSlot.id,
                    coachId: selectedCoach.id,
                    moduleId: selectedModule?.id || selectedSlot.module_id || null,
                    meetingTime: selectedSlot.start_time,
                    studentNotes: studentNotes.trim() || undefined,
                    customZoomLink: selectedSlot.zoom_link
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t("toastBookError"));

            toast.success(t("toastBookSuccess"));
            setBookingSuccess(data.booking);
            await fetchData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || t("toastBookError"));
        } finally {
            setBookingSubmitting(false);
        }
    };

    const copyZoomLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success(t("toastCopied"));
        setTimeout(() => setCopied(false), 2000);
    };

    const parseTitle = (title: any) => {
        if (!title) return t("curriculumModule");
        if (typeof title === "object" && title !== null) {
            return isAr && title.ar ? title.ar : (title.en || title.ar || t("curriculumModule"));
        }
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return isAr && parsed.ar ? parsed.ar : (parsed.en || parsed.ar || title);
            } catch {
                return title;
            }
        }
        return title.en || title.ar || t("curriculumModule");
    };

    return (
        <div className={`space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 ${isAr ? "font-arabic" : "font-sans"}`} dir="ltr">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#0B2545] border border-[#D4AF37]/30 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {t("badge")}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">
                        {t("title")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab("book")}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                            activeTab === "book"
                                ? "bg-[#0B2545] text-white shadow-sm"
                                : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        {t("bookSession")}
                    </button>
                    <button
                        onClick={() => setActiveTab("my-sessions")}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                            activeTab === "my-sessions"
                                ? "bg-[#0B2545] text-white shadow-sm"
                                : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                        }`}
                    >
                        <Video className="w-3.5 h-3.5" />
                        {t("myBookedSessions")} ({myBookings.filter(b => b.status === "confirmed").length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 flex justify-center items-center shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                </div>
            ) : activeTab === "book" ? (
                /* AVAILABLE COACHES & SLOTS */
                <div className="space-y-6">
                    {coaches.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-[#0B2545]">{t("noCoachesTitle")}</h3>
                            <p className="text-xs text-gray-500 mt-1">{t("noCoachesDesc")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coaches.map((coach) => {
                                // Find slots for this coach
                                const coachSlots = availableSlots.filter(s => s.coach_id === coach.id);
                                // Find assigned modules
                                const coachAssigned = assignments.filter(a => a.coach_id === coach.id);
                                const assignedIds = coachAssigned.map(a => a.module_id);
                                const coachModules = enrolledModules.filter(m => assignedIds.includes(m.id));

                                return (
                                    <div
                                        key={coach.id}
                                        className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#1a3a63] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                    {coach.first_name?.[0] || "C"}{coach.last_name?.[0] || ""}
                                                </div>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                    <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                                                    {t("certifiedCoach")}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-[#0B2545]">
                                                {coach.first_name} {coach.last_name}
                                            </h3>
                                            <p className="text-xs font-semibold text-[#D4AF37] mt-0.5">
                                                {coach.professional_title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                {coach.bio || t("bioDefault", { specialization: coach.specialization || t("leadership") })}
                                            </p>

                                            {/* Assigned module tags */}
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <p className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    {t("moduleSpecializations")}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {coachModules.length > 0 ? (
                                                        coachModules.map(m => (
                                                            <span key={m.id} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                                                                {parseTitle(m.title)}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                                            {t("generalMentorship")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Available Slots Section */}
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-[#0B2545]">
                                                    {t("availableSlots")}
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-600">
                                                    {coachSlots.length} {t("open")}
                                                </span>
                                            </div>

                                            {coachSlots.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 text-center">
                                                    {t("noSlotsAvailable")}
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                    {coachSlots.map((slot) => {
                                                        const sDate = new Date(slot.start_time);
                                                        return (
                                                            <div
                                                                key={slot.id}
                                                                className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#D4AF37] transition-all"
                                                            >
                                                                <div className="text-xs">
                                                                    <div className="font-bold text-[#0B2545]">
                                                                        {sDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "short", month: "short", day: "numeric" })}
                                                                    </div>
                                                                    <div className="text-gray-500">
                                                                        {sDate.toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                                                                        {" "}({slot.duration_minutes || 45} {t("mins")})
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSlot(slot);
                                                                        setSelectedCoach(coach);
                                                                        setSelectedModule(coachModules[0] || null);
                                                                        setBookingSuccess(null);
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-colors shadow-sm"
                                                                >
                                                                    {t("bookSlot")}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* MY BOOKED SESSIONS */
                <div className="space-y-4">
                    {myBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-[#0B2545]">{t("noSessionsScheduled")}</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                {t("noSessionsDesc")}
                            </p>
                        </div>
                    ) : (
                        myBookings.map((b) => {
                            const coachName = b.coach ? `${b.coach.first_name || ""} ${b.coach.last_name || ""}`.trim() : t("coachDefault");
                            const meetingDate = new Date(b.meeting_time);
                            const isCompleted = b.status === "completed";

                            return (
                                <div
                                    key={b.id}
                                    className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B2545] flex items-center justify-center shrink-0">
                                            <Video className="w-6 h-6 text-[#0B2545]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    isCompleted
                                                        ? "bg-gray-100 text-gray-600 border border-gray-200"
                                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                }`}>
                                                    {isCompleted ? t("completed") : t("confirmed")}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {t("duration")} {b.duration_minutes || 45} {t("mins")}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-[#0B2545]">
                                                {t("sessionWith", { name: coachName })}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {t("topic")}: {parseTitle(b.module?.title)}
                                            </p>

                                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                                                <span className="flex items-center gap-1 font-semibold text-[#0B2545]">
                                                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                    {meetingDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {meetingDate.toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons: Join Zoom Link */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        {b.zoom_link && (
                                            <>
                                                <button
                                                    onClick={() => copyZoomLink(b.zoom_link)}
                                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1.5"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? t("copied") : t("copyMeetingLink")}
                                                </button>
                                                <a
                                                    href={b.zoom_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    {t("joinZoomMeeting")}
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* BOOKING CONFIRMATION MODAL */}
            {selectedSlot && selectedCoach && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <button
                            onClick={() => {
                                setSelectedSlot(null);
                                setBookingSuccess(null);
                            }}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!bookingSuccess ? (
                            <div className="space-y-5">
                                <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t("confirmAppointment")}
                                    </span>
                                    <h3 className="text-xl font-bold text-[#0B2545]">
                                        {t("bookSessionWith", { name: `${selectedCoach.first_name} ${selectedCoach.last_name}` })}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedCoach.professional_title}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("date")}</span>
                                        <span className="font-bold text-[#0B2545]">
                                            {new Date(selectedSlot.start_time).toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("time")}</span>
                                        <span className="font-bold text-[#0B2545]">
                                            {new Date(selectedSlot.start_time).toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                                            {" - "}
                                            {new Date(selectedSlot.end_time).toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("duration")}</span>
                                        <span className="font-bold text-[#0B2545]">{t("modalDuration")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("format")}</span>
                                        <span className="font-bold text-blue-600">{t("formatZoom")}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#0B2545] mb-2 uppercase">
                                        {t("notesLabel")}
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder={t("notesPlaceholder")}
                                        value={studentNotes}
                                        onChange={(e) => setStudentNotes(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-xs text-[#0B2545] outline-none focus:border-[#0B2545] resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSlot(null)}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmBooking}
                                        disabled={bookingSubmitting}
                                        className="px-6 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                                    >
                                        {bookingSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        {t("confirmBookingBtn")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* SUCCESS CONFIRMATION VIEW */
                            <div className="text-center py-4 space-y-5">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-[#0B2545]">
                                        {t("sessionBookedSuccess")}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                        {t("sessionBookedDesc", { name: `${selectedCoach.first_name} ${selectedCoach.last_name}` })}
                                    </p>
                                </div>

                                {/* Zoom link container */}
                                {bookingSuccess.zoom_link && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left space-y-2">
                                        <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                            <Video className="w-4 h-4 text-blue-600" />
                                            {t("yourZoomLink")}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={bookingSuccess.zoom_link}
                                                className="w-full h-10 px-3 text-xs bg-white border border-blue-200 rounded-lg text-blue-800 select-all"
                                            />
                                            <button
                                                onClick={() => copyZoomLink(bookingSuccess.zoom_link)}
                                                className="h-10 px-3 bg-white hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors shrink-0"
                                            >
                                                {copied ? t("copied") : t("copy")}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex flex-col gap-2">
                                    {bookingSuccess.zoom_link && (
                                        <a
                                            href={bookingSuccess.zoom_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-11 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <Video className="w-4 h-4" />
                                            {t("launchZoom")}
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedSlot(null);
                                            setBookingSuccess(null);
                                            setActiveTab("my-sessions");
                                        }}
                                        className="w-full h-11 rounded-xl bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133055] transition-colors"
                                    >
                                        {t("viewInMySessions")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
