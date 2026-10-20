"use client";

import React, { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    User,
    CheckCircle2,
    X,
    Loader2,
    Sparkles,
    Copy,
    Check
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

interface StudentCoachBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    coach: {
        id: string;
        first_name: string;
        last_name: string;
        professional_title?: string;
        avatar_url?: string;
    };
    programId?: string;
    locale?: string;
    onBookingSuccess?: () => void;
}

export default function StudentCoachBookingModal({
    isOpen,
    onClose,
    coach,
    programId,
    locale = "en",
    onBookingSuccess
}: StudentCoachBookingModalProps) {
    const isAr = locale === "ar";

    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const [studentNotes, setStudentNotes] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const loadOpenSlots = async () => {
            setLoadingSlots(true);
            try {
                const { data, error } = await supabase
                    .from("coach_availability")
                    .select("*")
                    .eq("coach_id", coach.id)
                    .eq("is_booked", false)
                    .gte("date", new Date().toISOString().split("T")[0])
                    .order("date", { ascending: true })
                    .order("start_time", { ascending: true });

                if (error) throw error;
                setSlots(data || []);
            } catch (err: any) {
                console.error("Error loading open coach slots:", err);
            } finally {
                setLoadingSlots(false);
            }
        };

        loadOpenSlots();
    }, [isOpen, coach.id]);

    const handleConfirmBooking = async () => {
        if (!selectedSlot) return;
        setBookingSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error(isAr ? "يرجى تسجيل الدخول أولاً" : "Please log in to book");

            // 1. Create booking
            const { data: booking, error: bookingErr } = await supabase
                .from("one_on_one_bookings")
                .insert([{
                    slot_id: selectedSlot.id,
                    coach_id: coach.id,
                    student_id: user.id,
                    program_id: programId || null,
                    meeting_date: selectedSlot.date,
                    start_time: selectedSlot.start_time,
                    end_time: selectedSlot.end_time,
                    zoom_link: selectedSlot.zoom_link,
                    student_notes: studentNotes.trim(),
                    status: "confirmed"
                }])
                .select()
                .single();

            if (bookingErr) throw bookingErr;

            // 2. Mark slot as booked
            await supabase
                .from("coach_availability")
                .update({ is_booked: true })
                .eq("id", selectedSlot.id);

            setConfirmedBooking(booking);
            toast.success(isAr ? "تم تأكيد موعد جلستك بنجاح!" : "1-on-1 Session Confirmed!");
            if (onBookingSuccess) onBookingSuccess();
        } catch (err: any) {
            console.error("Booking error:", err);
            toast.error(err.message || "Could not complete booking");
        } finally {
            setBookingSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100">
                <button
                    onClick={onClose}
                    className={`absolute top-5 ${isAr ? "left-5" : "right-5"} p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full cursor-pointer`}
                >
                    <X className="w-5 h-5" />
                </button>

                {!confirmedBooking ? (
                    <div>
                        {/* Coach Card Header */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-12 h-12 rounded-2xl bg-[#0B2545] text-[#D4AF37] flex items-center justify-center font-bold text-lg">
                                {coach.first_name?.[0] || "C"}{coach.last_name?.[0] || ""}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#0B2545]">
                                    {coach.first_name} {coach.last_name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {coach.professional_title || (isAr ? "مدرب معتمد بالأكاديمية" : "YLA Certified Coach")}
                                </p>
                            </div>
                        </div>

                        {/* Slot Selection */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-[#0B2545] mb-2">
                                {isAr ? "اختر الموعد المتاح:" : "Select Available Time Slot:"}
                            </label>

                            {loadingSlots ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    {isAr ? "لا توجد مواعيد متاحة حالياً لهذا المدرب." : "No open slots currently available for this coach."}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                                    {slots.map((s) => {
                                        const isSelected = selectedSlot?.id === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setSelectedSlot(s)}
                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]/20"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-[#0B2545] mb-0.5">{s.date}</div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                                                    <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-[#0B2545] mb-1">
                                {isAr ? "ملاحظات أو أسئلة للجلسة (اختياري):" : "Topics or Questions for the Coach (Optional):"}
                            </label>
                            <textarea
                                rows={2}
                                value={studentNotes}
                                onChange={(e) => setStudentNotes(e.target.value)}
                                placeholder={isAr ? "ما الموضوع الذي تود التركيز عليه في هذه الجلسة؟" : "What would you like to focus on during this 1-on-1 session?"}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#0B2545] outline-none resize-none"
                            />
                        </div>

                        {/* Confirm Button */}
                        <button
                            type="button"
                            disabled={!selectedSlot || bookingSubmitting}
                            onClick={handleConfirmBooking}
                            className="w-full h-12 rounded-full bg-[#0B2545] hover:bg-[#0B2545]/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {bookingSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Video className="w-4 h-4 text-[#D4AF37]" />
                                    <span>{isAr ? "تأكيد حجز جلسة Zoom" : "Confirm 1-on-1 Zoom Session"}</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Booking Success State */
                    <div className="text-center py-4 space-y-4">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0B2545]">
                            {isAr ? "تم تأكيد موعدك بنجاح!" : "Your Session is Confirmed!"}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {isAr
                                ? `موعدك مع ${coach.first_name} في ${confirmedBooking.meeting_date} الساعة ${confirmedBooking.start_time.slice(0, 5)}`
                                : `Your 1-on-1 session with ${coach.first_name} is set for ${confirmedBooking.meeting_date} at ${confirmedBooking.start_time.slice(0, 5)}.`}
                        </p>

                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-mono" dir="ltr">
                            <span className="truncate pr-2">{confirmedBooking.zoom_link}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(confirmedBooking.zoom_link);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="text-gray-500 hover:text-black flex-shrink-0 cursor-pointer"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <a
                            href={confirmedBooking.zoom_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                        >
                            <Video className="w-4 h-4" />
                            <span>{isAr ? "الانضمام إلى Zoom الآن" : "Join Zoom Meeting Room"}</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
