"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { supabase } from "@/lib/supabase";

export default function CoachSessionsPage() {
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";

    const [activeTab, setActiveTab] = useState<"calendar" | "bookings">("calendar");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [slots, setSlots] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [assignedModules, setAssignedModules] = useState<any[]>([]);

    // Form State
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("10:45");
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [zoomLink, setZoomLink] = useState("");
    const [notes, setNotes] = useState("");

    const fetchData = async () => {
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
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split("T")[0]);
    }, []);

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) {
            toast.error("Please fill in date, start time, and end time");
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
            if (!res.ok) throw new Error(data.error || "Failed to publish slot");

            toast.success("Availability slot published!");
            setNotes("");
            await fetchData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to publish slot");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        try {
            const res = await fetch(`/api/coach/availability?slotId=${slotId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Slot removed");
                setSlots(prev => prev.filter(s => s.id !== slotId));
            }
        } catch (err) {
            toast.error("Failed to delete slot");
        }
    };

    const handleMarkCompleted = async (bookingId: string) => {
        try {
            const res = await fetch("/api/coach/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, status: "completed" })
            });
            if (res.ok) {
                toast.success("Session marked as completed!");
                await fetchData();
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const parseTitle = (title: any) => {
        if (!title) return "General Coaching";
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return parsed.en || parsed.ar || title;
            } catch {
                return title;
            }
        }
        return title.en || title.ar || "General Coaching";
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" dir={isAr ? "rtl" : "ltr"}>
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">
                    1-on-1 Coaching & Calendar Availability
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Publish calendar availability slots for enrolled students and manage your scheduled video sessions
                </p>
            </div>

            {/* Main grid: Left Form, Right Slots/Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Publish Slot Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <Calendar className="w-5 h-5 text-[#D4AF37]" />
                            <h2 className="text-base font-bold text-[#0B2545]">Publish Available Slot</h2>
                        </div>

                        <form onSubmit={handleCreateSlot} className="space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                />
                            </div>

                            {/* Start & End Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                        Start Time *
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
                                        End Time *
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
                                    Module Focus (Optional)
                                </label>
                                <select
                                    value={selectedModuleId}
                                    onChange={(e) => setSelectedModuleId(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                >
                                    <option value="">Any Enrolled Module</option>
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
                                    Zoom Meeting Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    value={zoomLink}
                                    onChange={(e) => setZoomLink(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545]"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Leave blank to automatically generate a secure meeting link.
                                </p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                    Instructions for Student
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Please bring your draft project outline."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] resize-none"
                                />
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-12 rounded-xl bg-[#0B2545] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#133055] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Publish Calendar Slot
                            </button>
                        </form>
                    </div>
                </div>

                {/* Slots & Bookings Viewer */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex space-x-2 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                        <button
                            onClick={() => setActiveTab("calendar")}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === "calendar"
                                    ? "bg-[#0B2545] text-white shadow-sm"
                                    : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                            }`}
                        >
                            Open Availability Slots ({slots.filter(s => !s.is_booked).length})
                        </button>
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                                activeTab === "bookings"
                                    ? "bg-[#0B2545] text-white shadow-sm"
                                    : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                            }`}
                        >
                            Scheduled Bookings ({bookings.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex justify-center items-center shadow-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                        </div>
                    ) : activeTab === "calendar" ? (
                        /* SLOTS LIST */
                        <div className="space-y-3">
                            {slots.filter(s => !s.is_booked).length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-[#0B2545]">No Open Slots</h3>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                        Use the form on the left to publish available calendar dates and times for your students.
                                    </p>
                                </div>
                            ) : (
                                slots.filter(s => !s.is_booked).map((s) => {
                                    const slotDate = new Date(s.start_time);
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
                                                            {slotDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                                        </h4>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Available
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(s.start_time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                                                        {" - "}
                                                        {new Date(s.end_time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                                                        {" "}({s.duration_minutes || 45} mins)
                                                    </p>
                                                    {s.notes && (
                                                        <p className="text-xs text-gray-400 mt-1 italic">
                                                            Note: {s.notes}
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
                                                        Zoom Ready
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteSlot(s.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors hover:bg-red-50"
                                                    title="Delete slot"
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
                                    <h3 className="text-base font-bold text-[#0B2545]">No Sessions Booked Yet</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        When students book one of your available slots, their session details and Zoom links will appear here.
                                    </p>
                                </div>
                            ) : (
                                bookings.map((b) => {
                                    const studentName = b.student ? `${b.student.first_name || ""} ${b.student.last_name || ""}`.trim() : "Student";
                                    const isCompleted = b.status === "completed";

                                    return (
                                        <div
                                            key={b.id}
                                            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between gap-4"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                            isCompleted
                                                                ? "bg-gray-100 text-gray-600 border border-gray-200"
                                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        }`}>
                                                            {isCompleted ? "Completed" : "Confirmed"}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            Booked on: {new Date(b.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-base font-bold text-[#0B2545] pt-1">
                                                        Student: {studentName}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">Email: {b.student?.email || "Enrolled student"}</p>
                                                    {b.student_notes && (
                                                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2">
                                                            <span className="font-semibold text-[#0B2545]">Student Note:</span> {b.student_notes}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right sm:text-right">
                                                    <div className="text-sm font-bold text-[#0B2545]">
                                                        {new Date(b.meeting_time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(b.meeting_time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
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
                                                            Launch Zoom Meeting
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>

                                                {!isCompleted && (
                                                    <button
                                                        onClick={() => handleMarkCompleted(b.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                        Mark as Completed
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
        </div>
    );
}
