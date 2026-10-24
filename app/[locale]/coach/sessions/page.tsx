"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
    Calendar,
    Clock,
    Video,
    Plus,
    Trash2,
    CheckCircle,
    User,
    ExternalLink,
    Loader2,
    BookOpen,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import CoachSlotCreationModal from "@/components/coach/CoachSlotCreationModal";

export default function CoachSessionsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";
    const t = useTranslations("CoachPortal");

    const [activeTab, setActiveTab] = useState<"calendar" | "bookings">("calendar");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);

    const [slots, setSlots] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [assignedModules, setAssignedModules] = useState<any[]>([]);

    // Form State
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("10:45");
    const [selectedModuleId, setSelectedModuleId] = useState(searchParams?.get("moduleId") || "");
    const [zoomLink, setZoomLink] = useState("");
    const [notes, setNotes] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            let user: any = session?.user;
            if (!user) {
                const { data: userData } = await supabase.auth.getUser();
                user = userData?.user ?? null;
            }
            if (!user) return;

            // 1. Fetch slots
            const resSlots = await fetch(`/api/coach/availability?coachId=${user.id}&all=true`);
            if (resSlots.ok) {
                const data = await resSlots.json();
                setSlots(data.slots || []);
            }

            // 2. Fetch bookings
            const resBookings = await fetch(`/api/coach/bookings?coachId=${user.id}`);
            if (resBookings.ok) {
                const data = await resBookings.json();
                setBookings(data.bookings || []);
            }

            // 3. Fetch modules
            const resAdmin = await fetch("/api/admin/coaches");
            if (resAdmin.ok) {
                const data = await resAdmin.json();
                const coachAssignments = (data.assignments || []).filter((a: any) => a.coach_id === user.id);
                const modIds = coachAssignments.map((a: any) => a.module_id);
                const myMods = (data.modules || []).filter((m: any) => modIds.includes(m.id));
                setAssignedModules(myMods.length > 0 ? myMods : (data.modules || []).slice(0, 5));
            }

        } catch (err: any) {
            console.error("Error loading sessions:", err);
            toast.error(t("toastLoadError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split("T")[0]);
    }, [fetchData]);

    const parseSlotDateTime = (s: any) => {
        const dVal = s.meeting_date || s.date;
        const tVal = s.start_time;
        if (dVal && tVal) {
            const cleanTime = tVal.includes("T") ? tVal.split("T")[1] : tVal;
            const d = new Date(`${dVal.split("T")[0]}T${cleanTime.length === 5 ? cleanTime + ":00" : cleanTime}`);
            if (!isNaN(d.getTime())) return d;
        }
        if (dVal) {
            const d = new Date(dVal.includes("T") ? dVal : `${dVal}T00:00:00`);
            if (!isNaN(d.getTime())) return d;
        }
        if (s.meeting_time) {
            const d = new Date(s.meeting_time);
            if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    };

    const formatSlotTime = (s: any) => {
        const clean = (timeStr?: string) => {
            if (!timeStr) return "";
            return timeStr.includes("T") ? timeStr.split("T")[1].slice(0, 5) : timeStr.slice(0, 5);
        };
        if (s.start_time && s.end_time) {
            return `${clean(s.start_time)} - ${clean(s.end_time)}`;
        }
        if (s.start_time) return clean(s.start_time);
        return parseSlotDateTime(s).toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) {
            toast.error(t("toastFillRequired"));
            return;
        }

        try {
            setSubmitting(true);
            const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
            const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

            const res = await fetch("/api/coach/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    moduleId: selectedModuleId || null,
                    startTime: startDateTime,
                    endTime: endDateTime,
                    zoomLink: zoomLink.trim() || undefined,
                    notes: notes.trim() || undefined,
                    duration: 45
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t("toastPublishError"));

            toast.success(t("toastPublishSuccess"));
            setNotes("");
            await fetchData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || t("toastPublishError"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!window.confirm(t("confirmDeleteSlot"))) return;
        try {
            const res = await fetch(`/api/coach/availability?slotId=${slotId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success(t("toastSlotDeleted"));
                setSlots(prev => prev.filter(s => s.id !== slotId));
            } else {
                toast.error(t("toastDeleteError"));
            }
        } catch (err) {
            toast.error(t("toastDeleteError"));
        }
    };

    const handleMarkCompleted = async (bookingId: string) => {
        if (!window.confirm(t("confirmMarkCompleted"))) return;
        try {
            const res = await fetch("/api/coach/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, status: "completed" })
            });
            if (res.ok) {
                toast.success(t("toastMarkCompletedSuccess"));
                await fetchData();
            } else {
                toast.error(t("toastUpdateStatusError"));
            }
        } catch (err) {
            toast.error(t("toastUpdateStatusError"));
        }
    };

    const parseTitle = (title: any) => {
        if (!title) return t("generalCoaching");
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return parsed[locale] || parsed.en || parsed.ar || title;
            } catch {
                return title;
            }
        }
        return title[locale] || title.en || title.ar || t("generalCoaching");
    };

    const renderStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {t("statusCompleted")}
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        {t("statusCancelled")}
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {t("statusPending")}
                    </span>
                );
            case "attended":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {t("statusAttended")}
                    </span>
                );
            case "no_show":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {t("statusNoShow")}
                    </span>
                );
            case "confirmed":
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t("statusConfirmed")}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" dir="ltr">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">
                        {t("sessionsTitle")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("sessionsSubtitle")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowSlotModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] text-white font-bold text-xs hover:bg-[#133055] transition-all shadow-md cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    {t("addNewSlot")}
                </button>
            </div>

            {/* Main grid: Left Form, Right Slots/Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Publish Slot Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <Calendar className="w-5 h-5 text-[#D4AF37]" />
                            <h2 className="text-base font-bold text-[#0B2545]">{t("publishSlotTitle")}</h2>
                        </div>

                        <form onSubmit={handleCreateSlot} className="space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                    {t("dateLabel")}
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                />
                            </div>

                            {/* Start & End Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                        {t("startTimeLabel")}
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                        className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                        {t("endTimeLabel")}
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                        className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                    />
                                </div>
                            </div>

                            {/* Assigned Module */}
                            <div>
                                <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                    {t("moduleFocusLabel")}
                                </label>
                                <select
                                    value={selectedModuleId}
                                    onChange={(e) => setSelectedModuleId(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                >
                                    <option value="">{t("anyEnrolledModule")}</option>
                                    {assignedModules.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {parseTitle(m.title)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Zoom Link */}
                            <div>
                                <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                    {t("zoomLinkLabel")}
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    value={zoomLink}
                                    onChange={(e) => setZoomLink(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                    dir="ltr"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    {t("zoomLinkHelp")}
                                </p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                    {t("studentInstructionsLabel")}
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder={t("studentInstructionsPlaceholder")}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] resize-none"
                                />
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-12 rounded-xl bg-[#0B2545] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#133055] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {t("publishCalendarSlot")}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Slots & Bookings Viewer */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab("calendar")}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                                    activeTab === "calendar"
                                        ? "bg-[#0B2545] text-white shadow-sm"
                                        : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                                }`}
                            >
                                {t("tabOpenSlots", { count: slots.filter(s => !s.is_booked).length })}
                            </button>
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                                    activeTab === "bookings"
                                        ? "bg-[#0B2545] text-white shadow-sm"
                                        : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                                }`}
                            >
                                {t("tabBookings", { count: bookings.length })}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowSlotModal(true)}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0B2545]/10 text-[#0B2545] hover:bg-[#0B2545]/20 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {t("addNewSlot")}
                        </button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col justify-center items-center gap-2 shadow-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                            <p className="text-xs text-gray-400">{t("loadingSessions")}</p>
                        </div>
                    ) : activeTab === "calendar" ? (
                        /* SLOTS LIST */
                        <div className="space-y-3">
                            {slots.filter(s => !s.is_booked).length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-[#0B2545]">{t("noOpenSlotsTitle")}</h3>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                        {t("noOpenSlotsDesc")}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowSlotModal(true)}
                                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        {t("createFirstSlot")}
                                    </button>
                                </div>
                            ) : (
                                slots.filter(s => !s.is_booked).map((s) => {
                                    const slotDate = parseSlotDateTime(s);
                                    return (
                                        <div
                                            key={s.id}
                                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-11 h-11 bg-amber-50 text-[#D4AF37] rounded-xl flex items-center justify-center shrink-0">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-[#0B2545] text-sm">
                                                            {slotDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                                        </h4>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            {t("statusAvailable")}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {formatSlotTime(s)}
                                                        {" "}({t("durationMins", { count: s.duration_minutes || 45 })})
                                                    </p>
                                                    {s.notes && (
                                                        <p className="text-xs text-gray-400 mt-1 italic">
                                                            {t("notePrefix")}{s.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                {s.zoom_link && (
                                                    <a
                                                        href={s.zoom_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <Video className="w-3.5 h-3.5" />
                                                        {t("zoomReady")}
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteSlot(s.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors hover:bg-red-50 cursor-pointer"
                                                    title={t("deleteSlot")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        /* BOOKED SESSIONS LIST */
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-[#0B2545]">{t("noBookingsTitle")}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t("noBookingsDesc")}
                                    </p>
                                </div>
                            ) : (
                                bookings.map((b) => {
                                    const studentName = b.student ? `${b.student.first_name || ""} ${b.student.last_name || ""}`.trim() : t("studentDefault");

                                    return (
                                        <div
                                            key={b.id}
                                            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between gap-4"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {renderStatusBadge(b.status)}
                                                        <span className="text-xs text-gray-400">
                                                            {t("bookedOn", { date: new Date(b.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US") })}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-base font-bold text-[#0B2545] pt-1">
                                                        {t("studentNameLabel", { name: studentName })}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {t("emailLabel", { email: b.student?.email || t("enrolledStudent") })}
                                                    </p>
                                                    {b.student_notes && (
                                                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2">
                                                            <span className="font-semibold text-[#0B2545]">{t("studentNoteLabel")}</span> {b.student_notes}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right sm:text-right">
                                                    <div className="text-sm font-bold text-[#0B2545]">
                                                        {parseSlotDateTime(b).toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatSlotTime(b)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    {b.zoom_link && (
                                                        <a
                                                            href={b.zoom_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            <Video className="w-4 h-4" />
                                                            {t("launchZoom")}
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>

                                                {b.status?.toLowerCase() !== "completed" && (
                                                    <button
                                                        onClick={() => handleMarkCompleted(b.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                        {t("markCompleted")}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Slot Creation Modal */}
            <CoachSlotCreationModal
                isOpen={showSlotModal}
                onClose={() => setShowSlotModal(false)}
                assignedModules={assignedModules}
                onSlotCreated={fetchData}
                locale={locale}
                preselectedModuleId={selectedModuleId}
            />
        </div>
    );
}
