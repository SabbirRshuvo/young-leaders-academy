"use client";

import Link from "next/link";
import {
    BookOpen,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Clock,
    Award,
    TrendingUp,
    Trophy
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { getLocalizedProgramText } from "@/lib/program-localization";

type EnrolledProgramData = {
    id: string;
    program_id: string;
    status: string;
    enrollmentSource: "application" | "enrollment" | "course";
    program: {
        id: string;
        title: any;
        description: any;
        image_url: string | null;
    } | null;
    completedContentsCount: number;
    totalContentsCount: number;
    progressPercentage: number;
};

// Helper for bilingual JSON / text strings
function getLocalizedText(value: any, locale: string): string {
    if (!value) return "";
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed[locale] || parsed.en || Object.values(parsed)[0] || "";
            }
        } catch {
            return value;
        }
        return value;
    }
    if (typeof value === "object") {
        return value[locale] || value.en || Object.values(value)[0] || "";
    }
    return String(value);
}

export default function EnrolledProgramsPage() {
    const t = useTranslations("EnrolledPrograms");
    const [enrollments, setEnrollments] = useState<EnrolledProgramData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isAr = locale === "ar";

    useEffect(() => {
        fetchData();

        // Auto refresh when tab regains focus
        const handleFocus = () => {
            fetchData();
        };
        window.addEventListener("focus", handleFocus);

        // Realtime subscription for instant updates when learning progresses
        const channel = supabase
            .channel("realtime-student-enrolled-programs")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "user_progress" },
                () => {
                    fetchData();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "program_applications" },
                () => {
                    fetchData();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "enrollments" },
                () => {
                    fetchData();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "course_enrollments" },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener("focus", handleFocus);
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;

            if (!user) {
                setError(t("unauthorizedError"));
                return;
            }

            // 1. Fetch approved applications for this student
            const { data: appsData, error: appsError } = await supabase
                .from("program_applications")
                .select(`
                    id,
                    program_id,
                    status,
                    created_at,
                    program:programs (
                        id,
                        title,
                        description,
                        image_url
                    )
                `)
                .eq("student_id", user.id)
                .in("status", ["accepted", "approved", "enrolled", "paid", "active"]);

            if (appsError) throw appsError;

            // 2. Fetch direct enrollments from enrollments table
            const { data: directEnrollments } = await supabase
                .from("enrollments")
                .select(`
                    id,
                    program_id,
                    created_at,
                    program:programs (
                        id,
                        title,
                        description,
                        image_url
                    )
                `)
                .eq("user_id", user.id);

            // 2.5 Fetch course_enrollments table
            const { data: courseEnrollments } = await supabase
                .from("course_enrollments")
                .select(`
                    id,
                    course_id,
                    status,
                    created_at
                `)
                .eq("user_id", user.id)
                .in("status", ["active", "enrolled", "paid"]);

            // Deduplicate programs across applications, enrollments & course_enrollments
            const enrolledItems: { id: string; program_id: string; status: string; source: "application" | "enrollment" | "course"; initialProgram?: any }[] = [];
            const seenProgramIds = new Set<string>();

            (appsData || []).forEach(app => {
                if (app.program_id && !seenProgramIds.has(app.program_id)) {
                    seenProgramIds.add(app.program_id);
                    enrolledItems.push({
                        id: app.id,
                        program_id: app.program_id,
                        status: app.status,
                        source: "application",
                        initialProgram: app.program
                    });
                }
            });

            (directEnrollments || []).forEach(enr => {
                if (enr.program_id && !seenProgramIds.has(enr.program_id)) {
                    seenProgramIds.add(enr.program_id);
                    enrolledItems.push({
                        id: enr.id,
                        program_id: enr.program_id,
                        status: (enr as any).status || "active",
                        source: "enrollment",
                        initialProgram: enr.program
                    });
                }
            });

            (courseEnrollments || []).forEach(ce => {
                if (ce.course_id && !seenProgramIds.has(ce.course_id)) {
                    seenProgramIds.add(ce.course_id);
                    enrolledItems.push({
                        id: ce.id,
                        program_id: ce.course_id,
                        status: ce.status,
                        source: "course",
                        initialProgram: null
                    });
                }
            });

            const allTargetProgIds = Array.from(seenProgramIds);

            // Fetch any missing program details (e.g. for course_enrollments)
            const extraProgramsMap = new Map<string, any>();
            const missingDetailsIds = enrolledItems.filter(i => !i.initialProgram).map(i => i.program_id);
            if (missingDetailsIds.length > 0) {
                const { data: extraProgs } = await supabase
                    .from("programs")
                    .select("id, title, description, image_url")
                    .in("id", missingDetailsIds);

                (extraProgs || []).forEach(p => extraProgramsMap.set(p.id, p));

                // Also check courses table
                const stillMissing = missingDetailsIds.filter(id => !extraProgramsMap.has(id));
                if (stillMissing.length > 0) {
                    const { data: extraCourses } = await supabase
                        .from("courses")
                        .select("id, title, description, thumbnail_url")
                        .in("id", stillMissing);

                    (extraCourses || []).forEach(c => extraProgramsMap.set(c.id, {
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        image_url: c.thumbnail_url
                    }));
                }
            }

            // 4. Fetch all curriculum modules for all target programs
            let modulesData: any[] = [];
            if (allTargetProgIds.length > 0) {
                const { data: mods, error: modErr } = await supabase
                    .from("modules")
                    .select(`
                        id,
                        program_id,
                        course_id,
                        module_contents (
                            id
                        )
                    `)
                    .or(allTargetProgIds.map(id => `program_id.eq.${id},course_id.eq.${id}`).join(","));

                if (!modErr && mods) {
                    modulesData = mods;
                }
            }

            // Fallback: If module_contents join was empty, query module_contents directly
            const fallbackContentsByModule = new Map<string, string[]>();
            if (modulesData.length > 0) {
                const hasJoinedContents = modulesData.some(m => (m as any).module_contents && (m as any).module_contents.length > 0);
                if (!hasJoinedContents) {
                    const moduleIds = modulesData.map(m => m.id);
                    const { data: contentsData } = await supabase
                        .from("module_contents")
                        .select("id, module_id")
                        .in("module_id", moduleIds);

                    (contentsData || []).forEach(c => {
                        const existing = fallbackContentsByModule.get(c.module_id) || [];
                        existing.push(c.id);
                        fallbackContentsByModule.set(c.module_id, existing);
                    });
                }
            }

            // 5. Query user_progress for the current student
            const { data: progressData, error: progressError } = await supabase
                .from("user_progress")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_completed", true);

            if (progressError) {
                console.warn("Error fetching user_progress:", progressError);
            }

            // Support both content_id and lesson_id
            const completedContentIds = new Set<string>();
            (progressData || []).forEach(p => {
                if (p.content_id) completedContentIds.add(p.content_id);
                if (p.lesson_id) completedContentIds.add(p.lesson_id);
            });

            // 6. Calculate real-time dynamic progress per enrolled program
            const finalEnrollments: EnrolledProgramData[] = enrolledItems.map(item => {
                const progId = item.program_id;
                const programDetails = item.initialProgram || extraProgramsMap.get(progId) || {
                    id: progId,
                    title: t("defaultProgramTitle"),
                    description: "",
                    image_url: null
                };

                // Find all modules matching this program/course ID
                const matchingModules = (modulesData || []).filter(
                    m => m.program_id === progId || m.course_id === progId
                );

                let totalContentsCount = 0;
                let completedContentsCount = 0;

                matchingModules.forEach(mod => {
                    const contents = (mod as any).module_contents?.length > 0
                        ? (mod as any).module_contents
                        : (fallbackContentsByModule.get(mod.id)?.map(id => ({ id })) || []);

                    totalContentsCount += contents.length;
                    contents.forEach((content: any) => {
                        if (content?.id && completedContentIds.has(content.id)) {
                            completedContentsCount++;
                        }
                    });
                });

                const progressPercentage = totalContentsCount > 0
                    ? Math.min(100, Math.round((completedContentsCount / totalContentsCount) * 100))
                    : 0;

                return {
                    id: item.id,
                    program_id: progId,
                    status: item.status,
                    enrollmentSource: item.source,
                    program: programDetails,
                    totalContentsCount,
                    completedContentsCount,
                    progressPercentage
                };
            });

            // Sort: In-progress first, then completed, then not started
            finalEnrollments.sort((a, b) => {
                if (a.progressPercentage === 100 && b.progressPercentage !== 100) return 1;
                if (b.progressPercentage === 100 && a.progressPercentage !== 100) return -1;
                return b.progressPercentage - a.progressPercentage;
            });

            setEnrollments(finalEnrollments);
        } catch (err) {
            console.error("Error fetching enrolled programs:", err);
            setError(err instanceof Error ? err.message : t("fetchError"));
        } finally {
            setLoading(false);
        }
    };

    // Overall stats calculations
    const stats = useMemo(() => {
        const total = enrollments.length;
        const completed = enrollments.filter(e => e.progressPercentage === 100).length;
        const inProgress = enrollments.filter(e => e.progressPercentage > 0 && e.progressPercentage < 100).length;
        const notStarted = enrollments.filter(e => e.progressPercentage === 0).length;
        const avgProgress = total > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / total)
            : 0;
        return { total, completed, inProgress, notStarted, avgProgress };
    }, [enrollments]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B2545]/20 border-t-[#0B2545]"></div>
                    <p className="text-sm font-semibold text-[#0B2545]">{t("calculatingProgress")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
                <div className="rounded-xl bg-red-50 px-6 py-5 text-sm font-medium text-red-600 border border-red-100 max-w-md text-center">
                    <p className="font-bold mb-2">{t("errorLoading")}</p>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="bg-[#0B2545] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#071931] transition-colors"
                    >
                        {t("tryAgain")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/60 relative" dir="ltr">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* HEADER */}
                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8 mb-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                                {t("badge")}
                            </div>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {t("title")}
                            </h1>
                            <p className="mt-2 text-sm text-white/70">
                                {t("subtitle")}
                            </p>
                        </div>
                        <Link
                            href={`/${locale}/programs`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-sm font-bold text-[#0B2545] transition-transform hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <Sparkles className="h-4 w-4" />
                            {t("exploreMore")}
                        </Link>
                    </div>
                </section>

                {/* STATS OVERVIEW CARDS */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("activeEnrollments")}</span>
                            <div className="w-8 h-8 rounded-lg bg-[#0B2545]/10 flex items-center justify-center text-[#0B2545]">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-[#0B2545] mt-2">{stats.total}</p>
                        <p className="text-xs text-gray-500 mt-1">{t("totalRegisteredPrograms")}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("inProgress")}</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{stats.inProgress}</p>
                        <p className="text-xs text-gray-500 mt-1">{t("coursesCurrentlyLearning")}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("completed")}</span>
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                <Trophy className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-green-600 mt-2">{stats.completed}</p>
                        <p className="text-xs text-gray-500 mt-1">{t("finishedPrograms")}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("averageProgress")}</span>
                            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-[#0B2545] mt-2">{stats.avgProgress}%</p>
                        <p className="text-xs text-gray-500 mt-1">{t("acrossAllCurriculums")}</p>
                    </div>
                </section>

                {/* ENROLLED COURSES LIST */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545] flex items-center gap-2">
                                {t("activeEnrollments")}
                                <span className="flex items-center justify-center bg-[#D4AF37]/20 text-[#0B2545] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    {enrollments.length}
                                </span>
                            </h2>
                        </div>
                    </div>

                    {enrollments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-[#0B2545] mb-2">{t("noActiveEnrollments")}</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                                {t("noEnrollmentsDesc")}
                            </p>
                            <Link
                                href={`/${locale}/programs`}
                                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#0B2545] hover:bg-[#071931] px-6 text-sm font-semibold text-white transition-colors"
                            >
                                {t("browsePrograms")}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {enrollments.map((enrollment) => {
                                const { program, totalContentsCount, completedContentsCount, progressPercentage, program_id } = enrollment;
                                if (!program) return null;

                                const title = getLocalizedProgramText(program.title, isAr, 'title', program.title) || getLocalizedText(program.title, locale) || t("defaultProgramTitle");
                                const isCompleted = progressPercentage === 100;

                                return (
                                    <div
                                        key={enrollment.id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all hover:border-[#D4AF37]/50 hover:shadow-xl"
                                    >
                                        {/* Card Header & Media */}
                                        <div className="relative w-full h-[180px] bg-gray-100 overflow-hidden">
                                            {program.image_url ? (
                                                <img
                                                    src={program.image_url}
                                                    alt={title}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-[#0B2545] to-[#143d73]">
                                                    <BookOpen className="w-12 h-12 text-[#D4AF37]/40" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {t("completed")}
                                                    </span>
                                                ) : progressPercentage > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37] text-[#0B2545] shadow-sm">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {t("inProgress")}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
                                                        {t("notStarted")}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
                                                    {title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="flex flex-col p-6 flex-1 bg-white justify-between">
                                            {/* Dynamic Real-Time Progress Tracker */}
                                            <div className="w-full mb-6">
                                                <div className="flex justify-between items-center text-xs text-gray-600 mb-2 font-medium">
                                                    <span>
                                                        {t("progressLabel")}{" "}
                                                        <strong className="text-[#0B2545] font-bold">
                                                            {completedContentsCount}
                                                        </strong>{" "}
                                                        {t("progressOf")}{" "}
                                                        <strong className="text-gray-700">
                                                            {totalContentsCount}
                                                        </strong>{" "}
                                                        {t("items")}
                                                    </span>
                                                    <span
                                                        className={`font-black text-sm ${
                                                            isCompleted ? "text-green-600" : "text-[#D4AF37]"
                                                        }`}
                                                    >
                                                        {progressPercentage}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                            isCompleted
                                                                ? "bg-green-500"
                                                                : "bg-gradient-to-r from-[#D4AF37] to-[#e6c86e]"
                                                        }`}
                                                        style={{ width: `${Math.max(progressPercentage, totalContentsCount > 0 && completedContentsCount > 0 ? 5 : 0)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 mt-auto">
                                                <Link
                                                    href={`/${locale}/programs/${program_id}/play`}
                                                    className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-sm font-bold text-white transition-all hover:bg-[#071931] hover:scale-[1.01] active:scale-95 shadow-sm group/btn"
                                                >
                                                    {isCompleted ? t("reviewCourse") : progressPercentage > 0 ? t("continueLearning") : t("startProgram")}
                                                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                                </Link>

                                                {/* Certificate Direct Link if Completed */}
                                                {isCompleted && (
                                                    <Link
                                                        href={`/${locale}/programs/${program_id}/certificate`}
                                                        className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/10 text-[#0B2545] px-4 text-xs font-bold transition-colors hover:bg-[#D4AF37]/20"
                                                    >
                                                        <Award className="w-4 h-4 text-[#D4AF37]" />
                                                        {t("downloadCertificate")}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}
