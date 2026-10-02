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

type Application = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    age: number | null;
    school: string | null;
    program_id: string | null;
    motivation: string | null;
    status?: string | null;
    payment_status?: string | null;
    created_at: string | null;
};

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
    const [applications, setApplications] = useState<Application[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<CourseProgressData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

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

            // Fetch applications with extended fields for modal details
            const { data: appsData, error: appsError } = await supabase
                .from("applications")
                .select("id, first_name, last_name, email, phone, age, school, motivation, program_id, created_at")
                .ilike("email", user.email || "")
                .order("created_at", { ascending: false });

            if (appsError) throw appsError;

            // Fetch payments to link payment status to the applications and determine enrolled courses
            const { data: paymentsData, error: paymentsError } = await supabase
                .from("payments")
                .select("program_id, payment_status")
                .ilike("parent_email", user.email || "");

            if (paymentsError) throw paymentsError;

            const enrichedAppsData = appsData?.map((app) => {
                const payment = paymentsData?.find((p) => p.program_id === app.program_id);
                return {
                    ...app,
                    payment_status: payment?.payment_status || "unpaid",
                    status: "Pending" // Defaults to pending, can map to real status if column exists
                };
            }) || [];
            
            setApplications(enrichedAppsData);

            // Fetch enrolled courses from the dedicated enrollment table
            const { data: enrollments, error: enrollError } = await supabase
                .from("course_enrollments")
                .select("course_id")
                .eq("user_id", user.id);

            if (enrollError) {
                // If table doesn't exist, we'll catch the error
                console.warn("Could not fetch course_enrollments:", enrollError);
            }

            const courseIds = Array.from(new Set(enrollments?.map(e => e.course_id).filter(Boolean) as string[]));

            if (courseIds.length > 0) {
                // Fetch courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from("courses")
                    .select("id, title, description, thumbnail")
                    .in("id", courseIds);
                
                if (coursesError) throw coursesError;

                if (coursesData && coursesData.length > 0) {
                    const fetchedCourseIds = coursesData.map(c => c.id);

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

                    // Fetch course progress
                    const { data: progressData, error: progressError } = await supabase
                        .from("course_progress")
                        .select("lesson_id, is_completed")
                        .eq("user_id", user.id)
                        .eq("is_completed", true);

                    if (progressError) throw progressError;

                    const completedLessonIds = new Set(progressData?.map(p => p.lesson_id) || []);

                    const courseStats: CourseProgressData[] = coursesData.map(course => {
                        const courseModules = modulesData?.filter(m => m.course_id === course.id) || [];
                        const courseModuleIds = new Set(courseModules.map(m => m.id));
                        const courseLessons = lessonsData.filter(l => courseModuleIds.has(l.module_id));
                        
                        const totalLessons = courseLessons.length;
                        const completedLessons = courseLessons.filter(l => completedLessonIds.has(l.id)).length;
                        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                        return {
                            course_id: course.id,
                            title: course.title,
                            description: course.description,
                            thumbnail: course.thumbnail || null,
                            totalLessons,
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

    const recentApplications = applications.slice(0, 5);

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
                                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-[#D4AF37]/50 hover:shadow-md"
                                    >
                                        <div>
                                            {course.thumbnail ? (
                                                <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                                                    <img 
                                                        src={course.thumbnail} 
                                                        alt="Course Thumbnail" 
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2545]/5 group-hover:bg-[#D4AF37]/10 transition-colors">
                                                    <BookOpen className="h-6 w-6 text-[#0B2545] group-hover:text-[#D4AF37] transition-colors" />
                                                </div>
                                            )}
                                            <h3 className="mb-1 text-lg font-bold text-[#0B2545] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                                                {courseTitle}
                                            </h3>
                                            {courseDesc && (
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                                    {courseDesc}
                                                </p>
                                            )}

                                            {totalLessons > 0 ? (
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                        <span className="font-medium">{completedLessons} of {totalLessons} Lessons Completed</span>
                                                        <span className="font-bold text-[#0B2545]">{progressPercentage}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#D4AF37] transition-all duration-1000 ease-out"
                                                            style={{ width: `${progressPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-3">No curriculum available yet.</p>
                                            )}
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-5">
                                            <Link
                                                href={`/${locale}/student/course/${course.course_id}`}
                                                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-sm font-semibold text-white transition-all hover:bg-[#D4AF37] hover:text-[#0B2545]"
                                            >
                                                {hasStarted ? "Continue Course" : "Start Course"}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* RECENT APPLICATIONS */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545]">
                                Recent Applications
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Your latest submitted applications.
                            </p>
                        </div>
                        <Link
                            href={`/${locale}/student/applications`}
                            className="text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37]"
                        >
                            View all
                        </Link>
                    </div>

                    {recentApplications.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                            <FileText className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-3 text-sm font-medium text-gray-600">
                                No applications yet
                            </p>
                            <Link
                                href={`/${locale}/apply`}
                                className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-[#0B2545] px-4 text-xs font-semibold text-white"
                            >
                                Start Application
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentApplications.map((application) => (
                                <div key={application.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2545]/10">
                                        <GraduationCap className="h-5 w-5 text-[#0B2545]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-[#0B2545]">
                                            {application.program_id || "Program not specified"}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Application #{application.id}
                                        </p>
                                        {application.created_at && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                Submitted {new Date(application.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedApplication(application)}
                                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#0B2545] px-3 text-xs font-semibold text-[#0B2545] hover:bg-[#0B2545] hover:text-white transition-colors"
                                    >
                                        View Details
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* APPLICATION DETAILS MODAL */}
            {selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-[#0B2545]/40 backdrop-blur-sm" 
                        onClick={() => setSelectedApplication(null)} 
                    />
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]" />
                        <button 
                            onClick={() => setSelectedApplication(null)} 
                            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6 mt-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B2545]/10">
                                <FileText className="h-6 w-6 text-[#0B2545]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#0B2545]">Application Details</h2>
                                <p className="text-sm font-medium text-gray-500">Ref: #{selectedApplication.id}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Applicant Name</p>
                                    <p className="font-bold text-[#0B2545] text-lg">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Program</p>
                                    <p className="font-bold text-[#0B2545] text-lg truncate" title={selectedApplication.program_id || ""}>
                                        {selectedApplication.program_id || "Not specified"}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Email / Phone</p>
                                    <p className="font-bold text-[#0B2545] truncate">{selectedApplication.email}</p>
                                    <p className="text-sm text-gray-500">{selectedApplication.phone || "No phone provided"}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">School & Age</p>
                                    <p className="font-bold text-[#0B2545]">{selectedApplication.school || "N/A"}</p>
                                    <p className="text-sm text-gray-500">{selectedApplication.age ? `${selectedApplication.age} years old` : "Age not specified"}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Application Status</p>
                                    <p className="font-bold text-[#D4AF37] capitalize">{selectedApplication.status || "Pending"}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Payment Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${selectedApplication.payment_status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        <p className="font-bold text-[#0B2545] capitalize">{selectedApplication.payment_status}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedApplication.motivation && (
                                <div className="rounded-xl bg-gray-50 p-5 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Motivation</p>
                                    <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-[#D4AF37] pl-4">
                                        "{selectedApplication.motivation}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button 
                                onClick={() => setSelectedApplication(null)} 
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Close Details
                            </button>
                            {selectedApplication.program_id && selectedApplication.payment_status === "paid" && (
                                <Link
                                    href={`/${locale}/student/course/${selectedApplication.program_id}`}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-6 text-sm font-bold text-white transition-all hover:bg-[#D4AF37] hover:text-[#0B2545] hover:shadow-md hover:-translate-y-0.5"
                                >
                                    Continue Program
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
