"use client";

import Link from "next/link";
import {
    BookOpen,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

type EnrolledProgramData = {
    id: string;
    program_id: string;
    status: string;
    program: {
        id: string;
        title: string | any;
        description: string | any;
        image_url: string;
    } | null;
    completedContentsCount: number;
    totalContentsCount: number;
    progressPercentage: number;
};

export default function EnrolledProgramsPage() {
    const [enrollments, setEnrollments] = useState<EnrolledProgramData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || "en";

    useEffect(() => {
        fetchData();
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
                setError("You must be logged in to view your enrolled programs.");
                return;
            }

            // Fetch approved applications for this student
            const { data: appsData, error: appsError } = await supabase
                .from("program_applications")
                .select(`
                    id,
                    program_id,
                    status,
                    program:programs (
                        id,
                        title,
                        description,
                        image_url
                    )
                `)
                .eq("student_id", user.id)
                .eq("status", "accepted");

            if (appsError) throw appsError;

            if (!appsData || appsData.length === 0) {
                setEnrollments([]);
                setLoading(false);
                return;
            }

            // For progress tracking, we need to know how many contents exist for each program
            // and how many this user has completed in `user_progress`
            const programIds = appsData.map(a => a.program_id);

            // Fetch all modules & contents for these programs to get total counts
            const { data: modulesData } = await supabase
                .from("modules")
                .select(`id, program_id, module_contents(id)`)
                .in("program_id", programIds);

            // Fetch user progress for these contents
            const { data: progressData } = await supabase
                .from("user_progress")
                .select("content_id, is_completed")
                .eq("user_id", user.id)
                .eq("is_completed", true);

            const completedContentIds = new Set(progressData?.map(p => p.content_id) || []);

            // Process stats per program
            const finalEnrollments = appsData.map(app => {
                let totalContentsCount = 0;
                let completedContentsCount = 0;

                const progModules = modulesData?.filter(m => m.program_id === app.program_id) || [];
                
                progModules.forEach(mod => {
                    const contents = mod.module_contents || [];
                    totalContentsCount += contents.length;
                    contents.forEach((content: any) => {
                        if (completedContentIds.has(content.id)) {
                            completedContentsCount++;
                        }
                    });
                });

                const progressPercentage = totalContentsCount > 0 
                    ? Math.round((completedContentsCount / totalContentsCount) * 100) 
                    : 0;

                return {
                    id: app.id,
                    program_id: app.program_id,
                    status: app.status,
                    program: Array.isArray(app.program) ? app.program[0] : app.program, // Handle potential array join issue
                    totalContentsCount,
                    completedContentsCount,
                    progressPercentage
                };
            });

            setEnrollments(finalEnrollments as EnrolledProgramData[]);

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err instanceof Error ? err.message : "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545]/20 border-t-[#0B2545]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
                <div className="rounded-xl bg-red-50 px-6 py-4 text-sm font-medium text-red-600 border border-red-100">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/60 relative">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* HEADER */}
                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8 mb-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                                Enrolled Programs
                            </div>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                My Learning Hub
                            </h1>
                            <p className="mt-2 text-sm text-white/70">
                                Access the programs you have been accepted into and track your progress.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ENROLLED COURSES */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545] flex items-center gap-2">
                                Active Enrollments
                                <span className="flex items-center justify-center bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    {enrollments.length}
                                </span>
                            </h2>
                        </div>
                    </div>

                    {enrollments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-[#0B2545] mb-2">No Active Enrollments</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                                You are not currently enrolled in any programs, or your application is still pending approval.
                            </p>
                            <Link href={`/${locale}/programs`} className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#0B2545] hover:bg-[#071931] px-6 text-sm font-semibold text-white transition-colors">
                                Browse Programs
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {enrollments.map((enrollment) => {
                                const { program, totalContentsCount, completedContentsCount, progressPercentage, program_id } = enrollment;
                                if (!program) return null;

                                const title = typeof program.title === 'string' ? program.title : (program.title?.en || "Unknown");

                                return (
                                    <div
                                        key={enrollment.id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all hover:border-[#D4AF37]/50 hover:shadow-xl"
                                    >
                                        <div className="relative w-full h-[180px] bg-gray-100">
                                            {program.image_url ? (
                                                <img src={program.image_url} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen className="w-10 h-10 opacity-30" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
                                                    {title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex flex-col p-6 flex-1 bg-white">
                                            {/* Dynamic Progress Tracker */}
                                            <div className="w-full mt-auto">
                                                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                                                    <span>Progress: {completedContentsCount} of {totalContentsCount} Items</span>
                                                    <span className="font-bold text-[#D4AF37]">{progressPercentage}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#D4AF37] transition-all duration-1000 ease-out"
                                                        style={{ width: `${progressPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/${locale}/programs/${program_id}/play`}
                                                className="w-full inline-flex mt-6 h-12 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-md group/btn"
                                            >
                                                {progressPercentage > 0 ? "Continue Learning" : "Start Program"}
                                                <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
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
