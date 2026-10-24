"use client";

import React, { useState } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    BookOpen,
    FileText,
    Plus,
    X,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface CoachSlotCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignedModules: any[];
    onSlotCreated: () => void;
    locale?: string;
    preselectedModuleId?: string;
}

export default function CoachSlotCreationModal({
    isOpen,
    onClose,
    assignedModules = [],
    onSlotCreated,
    locale = "en",
    preselectedModuleId = ""
}: CoachSlotCreationModalProps) {
    const isAr = locale === "ar";
    const t = useTranslations("CoachPortal");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [date, setDate] = useState(tomorrow.toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("10:45");
    const [selectedModuleId, setSelectedModuleId] = useState(preselectedModuleId);
    const [zoomLink, setZoomLink] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const parseModuleTitle = (title: any) => {
        if (!title) return t("curriculumModule");
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return parsed[locale] || parsed.en || parsed.ar || title;
            } catch {
                return title;
            }
        }
        return title[locale] || title.en || title.ar || t("curriculumModule");
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
            onSlotCreated();
            onClose();
        } catch (err: any) {
            console.error("Error creating slot:", err);
            toast.error(err.message || t("toastPublishError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
            dir="ltr"
        >
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full cursor-pointer transition-colors"
                    aria-label={t("close")}
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 mb-2 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-2xl bg-[#0B2545]/5 text-[#0B2545] flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#0B2545]">
                            {t("modalCreateSlotTitle")}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {t("modalCreateSlotDesc")}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            {t("dateLabel")}
                        </label>
                        <input
                            type="date"
                            value={date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] transition-colors"
                        />
                    </div>

                    {/* Start & End Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {t("startTimeLabel")}
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {t("endTimeLabel")}
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Assigned Module */}
                    <div>
                        <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            {t("moduleFocusLabel")}
                        </label>
                        <select
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] transition-colors bg-white"
                        >
                            <option value="">{t("anyEnrolledModule")}</option>
                            {assignedModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {parseModuleTitle(m.title)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Zoom Meeting Link */}
                    <div>
                        <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                            {t("zoomLinkLabel")}
                        </label>
                        <input
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            value={zoomLink}
                            onChange={(e) => setZoomLink(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] transition-colors text-left"
                            dir="ltr"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            {t("zoomLinkHelp")}
                        </p>
                    </div>

                    {/* Instructions for Student */}
                    <div>
                        <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            {t("studentInstructionsLabel")}
                        </label>
                        <textarea
                            rows={2}
                            placeholder={t("studentInstructionsPlaceholder")}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 text-xs text-[#0B2545] outline-none focus:border-[#0B2545] transition-colors resize-none"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133055] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            <span>{t("publishCalendarSlot")}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
