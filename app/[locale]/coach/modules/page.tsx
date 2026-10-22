"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ShieldCheck, ArrowRight, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CoachModulesPage() {
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";

    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchModules() {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const res = await fetch("/api/admin/coaches");
                if (res.ok) {
                    const data = await res.json();
                    const coachAssignments = (data.assignments || []).filter((a: any) => a.coach_id === user.id);
                    const assignedIds = coachAssignments.map((a: any) => a.module_id);
                    const myMods = (data.modules || []).filter((m: any) => assignedIds.includes(m.id));
                    setModules(myMods);
                }
            } catch (err) {
                console.error("Error fetching modules:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchModules();
    }, []);

    const parseTitle = (title: any) => {
        if (!title) return "Curriculum Module";
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return parsed.en || parsed.ar || title;
            } catch {
                return title;
            }
        }
        return title.en || title.ar || "Curriculum Module";
    };

    const parseDesc = (desc: any) => {
        if (!desc) return "Comprehensive leadership & academic instruction.";
        if (typeof desc === "string") {
            try {
                const parsed = JSON.parse(desc);
                return parsed.en || parsed.ar || desc;
            } catch {
                return desc;
            }
        }
        return desc.en || desc.ar || "Comprehensive leadership & academic instruction.";
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" dir="ltr">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">
                    My Assigned Modules
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Modules assigned to you by YLA administration. Students enrolled in these modules can schedule 1-on-1 coaching sessions with you.
                </p>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 flex justify-center items-center shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                </div>
            ) : modules.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0B2545]">No Modules Assigned Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Please contact the academy administrator to have your teaching modules and curricula assigned to your profile.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((m) => (
                        <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
                            <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    Active Assignment
                                </span>
                                <h3 className="text-lg font-bold text-[#0B2545] mb-2">
                                    {parseTitle(m.title)}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {parseDesc(m.description)}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <Link
                                    href={`/${locale}/coach/sessions`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2545] hover:text-[#D4AF37] transition-colors"
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    Publish Slot for this Module
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
