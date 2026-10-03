"use client";

import Link from "next/link";
import {
    BookOpen,
    ChevronRight,
    FileText,
    GraduationCap,
    Sparkles,
    X
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { programsData } from "@/data/programs";
import { useTranslations } from "next-intl";
type CourseProgressData = {
    course_id: string;
    title: { en: string; ar: string } | string;
    description: { en: string; ar: string } | string | null;
    thumbnail: string | null;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
};

export default function EnrolledProgramsPage() {

    const [enrolledCourses, setEnrolledCourses] = useState<CourseProgressData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const [actionLoading, setActionLoading] = useState(false);

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
                setError("You must be logged in.");
                return;
            }



            // Fetch enrolled courses from the dedicated enrollment table, joined with courses
            const { data: enrollments, error: enrollError } = await supabase
                .from("course_enrollments")
                .select(`
                    course_id,
                    courses (
                        id,
                        title,
                        description
                    )
                `)
                .eq("user_id", user.id);

            if (enrollError) {
                console.warn("[DEBUG] Could not fetch course_enrollments:", enrollError);
            }

            console.log("[DEBUG] Fetched Enrollments:", enrollments);

            // Filter and map enrollments, filling in missing DB courses from programsData fallback
            let coursesData = (enrollments || []).map(e => {
                if (e.courses) return e.courses;

                console.log(`[DEBUG] Missing DB course for ${e.course_id}, using fallback mapping.`);
                const prog = programsData.find(p => p.courseDbId === e.course_id || p.id === e.course_id);
                return {
                    id: e.course_id,
                    title: prog ? prog.title : "Enrolled Program",
                    description: prog ? prog.overview : "",
                    thumbnail: prog ? prog.heroImage : null
                };
            }) as any[];

            const courseIds = Array.from(new Set(coursesData.map(c => c.id).filter(Boolean)));

            if (courseIds.length > 0) {

                if (coursesData && coursesData.length > 0) {
                    const fetchedCourseIds = coursesData.map(c => c.id);

                    console.log("[DEBUG] Fetching modules for course IDs:", fetchedCourseIds);
                    // Fetch modules
                    const { data: modulesData, error: modulesError } = await supabase
                        .from("modules")
                        .select("id, course_id")
                        .in("course_id", fetchedCourseIds);

                    if (modulesError) throw modulesError;

                    const moduleIds = modulesData?.map(m => m.id) || [];

                    let lessonsData: any[] = [];
                    if (moduleIds.length > 0) {
                        const { data, error: lessonsError } = await supabase
                            .from("lessons")
                            .select("id, module_id")
                            .in("module_id", moduleIds);

                        if (lessonsError) throw lessonsError;
                        lessonsData = data || [];
                    }

                    // Fetch course progress using the unified schema
                    const { data: progressData, error: progressError } = await supabase
                        .from("course_progress")
                        .select("program_id, completed_lessons")
                        .eq("student_id", user.id);

                    if (progressError) throw progressError;

                    const courseStats: CourseProgressData[] = coursesData.map(course => {
                        const courseModules = modulesData?.filter(m => m.course_id === course.id) || [];
                        const courseModuleIds = new Set(courseModules.map(m => m.id));
                        const courseLessons = lessonsData.filter(l => courseModuleIds.has(l.module_id));

                        const fallbackProgram = programsData.find(p => p.courseDbId === course.id || p.id === course.id);

                        // 4.5 Fallback for missing curriculum (consistent with CoursePlayerPage)
                        let totalLessonsCount = courseLessons.length;
                        if (totalLessonsCount === 0) {
                            if (fallbackProgram && fallbackProgram.curriculum) {
                                totalLessonsCount = fallbackProgram.curriculum.length;
                            } else {
                                totalLessonsCount = 1;
                            }
                        }

                        // Retrieve the specific progress record for this course
                        const prog = progressData?.find(p => p.program_id === course.id || (fallbackProgram && p.program_id === fallbackProgram.id));
                        const completedLessonIds = new Set(prog?.completed_lessons || []);

                        const completedLessons = completedLessonIds.size;
                        const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : 0;

                        return {
                            course_id: course.id,
                            title: course.title,
                            description: course.description,
                            thumbnail: (course as any).thumbnail || null,
                            totalLessons: totalLessonsCount,
                            completedLessons,
                            progressPercentage
                        };
                    });

                    setEnrolledCourses(courseStats);
                }
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err instanceof Error ? err.message : "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleMockEnroll = async () => {
        try {
            setActionLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // 1. Fetch any existing course
            const { data: existingCourses, error: fetchErr } = await supabase
                .from("courses")
                .select("id")
                .limit(1);

            if (fetchErr) throw fetchErr;

            let courseId = existingCourses?.[0]?.id;

            // 2. If no course exists, create a dummy one
            if (!courseId) {
                const { data: newCourse, error: insertErr } = await supabase
                    .from("courses")
                    .insert({
                        title: { en: "Mock Test Course", ar: "دورة تجريبية" },
                        description: { en: "This is a generated mock course.", ar: "هذه دورة تجريبية تم إنشاؤها." }
                    })
                    .select("id")
                    .single();

                if (insertErr) throw insertErr;
                courseId = newCourse.id;
            }

            // 3. Check if already enrolled to avoid duplicates
            const { data: existingEnrollment } = await supabase
                .from("course_enrollments")
                .select("id")
                .eq("user_id", user.id)
                .eq("course_id", courseId)
                .maybeSingle();

            if (!existingEnrollment) {
                // 4. Insert enrollment
                const { error: enrollErr } = await supabase
                    .from("course_enrollments")
                    .insert({ user_id: user.id, course_id: courseId });

                if (enrollErr) throw enrollErr;
            }

            toast.success("Successfully enrolled in mock course!");
            await fetchData(); // Refresh the list
            router.refresh();
        } catch (err: any) {
            console.error("Mock enroll error:", err);
            toast.error(err.message || "Failed to mock enroll");
        } finally {
            setActionLoading(false);
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
                                Track your enrolled courses and recent applications.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ENROLLED COURSES */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545] flex items-center gap-2">
                                My Enrolled Courses
                                <span className="flex items-center justify-center bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    {enrolledCourses.length}
                                </span>
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Continue learning and track your progress.
                            </p>
                        </div>

                        {/* MOCK COURSE TEST BUTTON */}
                        <button
                            onClick={handleMockEnroll}
                            disabled={actionLoading}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-[#0B2545] shadow-sm hover:bg-[#b5952f] transition-all disabled:opacity-50"
                        >
                            <Sparkles className="h-4 w-4" />
                            {actionLoading ? "Enrolling..." : "Test Mock Course"}
                        </button>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-3 text-sm font-medium text-gray-600">
                                You are not enrolled in any programs yet.
                            </p>
                            <Link href={`/${locale}/programs`} className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-[#0B2545] px-4 text-xs font-semibold text-white">
                                Browse Programs
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {enrolledCourses.map((course) => {
                                const { totalLessons, completedLessons, progressPercentage } = course;
                                const hasStarted = progressPercentage > 0;

                                const courseTitle = typeof course.title === 'string' ? course.title : (course.title?.en || "Enrolled Program");
                                const courseDesc = typeof course.description === 'string' ? course.description : (course.description?.en || "");

                                return (
                                    <div
                                        key={course.course_id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all hover:border-[#D4AF37]/50 hover:shadow-lg"
                                    >
                                        <div>
                                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545]/5 group-hover:bg-[#D4AF37]/10 transition-colors">
                                                <BookOpen className="h-7 w-7 text-[#0B2545] group-hover:text-[#D4AF37] transition-colors" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-[#0B2545] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                                                {courseTitle}
                                            </h3>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-6">
                                            {/* Dynamic Progress Tracker */}
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                                                    <span>Progress: {completedLessons} of {totalLessons} Lessons Completed</span>
                                                    <span className="font-bold text-[#0B2545]">{progressPercentage}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#D4AF37] transition-all duration-1000 ease-out"
                                                        style={{ width: `${progressPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/${locale}/student/course/${course.course_id}`}
                                                className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-base font-bold text-white transition-all hover:bg-[#D4AF37] hover:text-[#0B2545] hover:scale-[1.02] active:scale-95 shadow-md"
                                            >
                                                Start Course
                                                <ChevronRight className="w-5 h-5" />
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
