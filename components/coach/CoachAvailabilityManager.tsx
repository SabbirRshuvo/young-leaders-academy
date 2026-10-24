"use client";

import React, { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    Plus,
    Trash2,
    CheckCircle2,
    Loader2,
    Lock,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

interface AvailabilitySlot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
    zoom_link: string;
    notes?: string;
}

export default function CoachAvailabilityManager({ locale = "en" }: { locale?: string }) {
    const isAr = locale === "ar";
    const t = useTranslations("CoachPortal");

    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form inputs
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState("16:00");
    const [endTime, setEndTime] = useState("16:45");
    const [zoomLink, setZoomLink] = useState("");
    const [notes, setNotes] = useState("");

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch default Zoom link from coach_profiles if not set
            const { data: cp } = await supabase
                .from("coach_profiles")
                .select("default_zoom_link")
                .eq("id", user.id)
                .maybeSingle();

            if (cp?.default_zoom_link && !zoomLink) {
                setZoomLink(cp.default_zoom_link);
            }

            const { data, error } = await supabase
                .from("coach_availability")
                .select("*")
                .eq("coach_id", user.id)
                .order("date", { ascending: true })
                .order("start_time", { ascending: true });

            if (error) throw error;
            setSlots(data || []);
        } catch (err: any) {
            console.error("Error fetching slots:", err);
            toast.error(t("toastLoadSlotsError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Unauthorized");

            const finalZoom = zoomLink.trim() || `https://zoom.us/j/yla-${user.id.slice(0, 6)}`;

            const { error } = await supabase
                .from("coach_availability")
                .insert([{
                    coach_id: user.id,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    zoom_link: finalZoom,
                    notes: notes.trim() || t("mentorshipSession"),
                    is_booked: false
                }]);

            if (error) throw error;

            toast.success(t("toastSlotAdded"));
            setNotes("");
            fetchSlots();
        } catch (err: any) {
            console.error("Error adding slot:", err);
            toast.error(err.message || t("toastCreateSlotError"));
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!window.confirm(t("confirmDeleteSlot"))) return;
        try {
            const { error } = await supabase
                .from("coach_availability")
                .delete()
                .eq("id", slotId);

            if (error) throw error;
            toast.success(t("toastSlotDeleted"));
            setSlots(prev => prev.filter(s => s.id !== slotId));
        } catch (err: any) {
            toast.error(err.message || t("toastDeleteError"));
        }
    };

    return (
        <div className="space-y-8" dir="ltr">
            {/* Slot Creation Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2.5 rounded-2xl bg-[#0B2545]/5 text-[#0B2545]">
                        <Plus className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#0B2545]">
                            {t("managerAddSlotTitle")}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {t("managerAddSlotDesc")}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date */}
                    <div>
                        <label className="text-xs font-semibold text-[#0B2545] mb-1.5 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            {t("date")}
                        </label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split("T")[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] outline-none"
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="text-xs font-semibold text-[#0B2545] mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {t("startTime")}
                        </label>
                        <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] outline-none"
                        />
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="text-xs font-semibold text-[#0B2545] mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {t("endTime")}
                        </label>
                        <input
                            type="time"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] outline-none"
                        />
                    </div>

                    {/* Zoom Link */}
                    <div>
                        <label className="text-xs font-semibold text-[#0B2545] mb-1.5 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                            {t("zoomMeetingLink")}
                        </label>
                        <input
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            value={zoomLink}
                            onChange={(e) => setZoomLink(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] outline-none text-left"
                            dir="ltr"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-4 flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 h-11 rounded-full bg-[#0B2545] hover:bg-[#0B2545]/90 text-white font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{t("publishSlotBtn")}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Slots List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-[#0B2545] mb-4">
                    {t("managerSlotsTitle")}
                </h3>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-10 gap-2">
                        <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
                        <p className="text-xs text-gray-400">{t("loadingSessions")}</p>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        {t("managerNoSlots")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slots.map((slot) => (
                            <div
                                key={slot.id}
                                className={`p-4 rounded-2xl border transition-all ${
                                    slot.is_booked
                                        ? "border-emerald-200 bg-emerald-50/40"
                                        : "border-gray-200 bg-white hover:border-[#0B2545]/40"
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {slot.date}
                                    </span>
                                    {slot.is_booked ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {t("statusBooked")}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                            title={t("deleteSlot")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="text-sm font-black text-[#0B2545] flex items-center gap-1.5 mb-2">
                                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                                    <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                                </div>

                                <a
                                    href={slot.zoom_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                                    dir="ltr"
                                >
                                    <Video className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{slot.zoom_link}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
