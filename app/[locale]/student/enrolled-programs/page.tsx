"use client";

import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    ChevronRight,
    FileText,
    GraduationCap,
    Clock3,
    Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { programsData } from "@/data/programs";

type Application = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    program_id: string | null;
    created_at: string | null;
};

type Payment = {
    id: string;
    student_name: string | null;
    parent_email: string | null;
    program_id: string | null;
    program_title: string | null;
    payment_status: string | null;
    created_at: string | null;
};

type CourseProgress = {
    id: string;
    student_id: string;
    program_id: string;
    completed_lessons: string[];
    is_completed: boolean;
};

export default function EnrolledProgramsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [progress, setProgress] = useState<CourseProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            // Fetch applications
            const { data: appsData, error: appsError } = await supabase
                .from("applications")
                .select("id, first_name, last_name, email, program_id, created_at")
                .ilike("email", user.email || "")
                .order("created_at", { ascending: false });

            if (appsError) throw appsError;
            setApplications(appsData || []);

            // Fetch payments
            const { data: paymentsData, error: paymentsError } = await supabase
                .from("payments")
                .select("id, student_name, parent_email, program_id, program_title, payment_status, created_at")
                .ilike("parent_email", user.email || "")
                .order("created_at", { ascending: false });

            if (paymentsError) throw paymentsError;
            setPayments(paymentsData || []);

            // Fetch progress
            const { data: progressData, error: progressError } = await supabase
                .from("course_progress")
                .select("*")
                .eq("student_id", user.id);

            if (!progressError && progressData) {
                setProgress(progressData);
            }

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

    const paidPayments = payments.filter((p) => p.payment_status === "paid");
    const recentApplications = applications.slice(0, 5);

    return (
        <main className="min-h-screen bg-gray-50/60">
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
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#0B2545]">
                            My Enrolled Courses
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Continue learning and track your progress.
                        </p>
                    </div>

                    {paidPayments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-3 text-sm font-medium text-gray-600">
                                No enrolled courses yet
                            </p>
                            <Link href="/programs" className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-[#0B2545] px-4 text-xs font-semibold text-white">
                                Browse Programs
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {paidPayments.map((payment) => {
                                const progData = programsData.find(p => p.id === payment.program_id);
                                const totalLessons = progData?.curriculum?.length || 0;
                                
                                const studentProgress = progress.find(p => p.program_id === payment.program_id);
                                const completedLessons = studentProgress?.completed_lessons?.length || 0;
                                const remainingLessons = Math.max(0, totalLessons - completedLessons);
                                const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                                
                                const hasStarted = studentProgress !== undefined && completedLessons > 0;
                                const isCompleted = studentProgress?.is_completed || progressPercentage === 100;

                                return (
                                <div
                                    key={payment.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-[#D4AF37]/50 hover:shadow-md"
                                >
                                    <div>
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2545]/5 group-hover:bg-[#D4AF37]/10 transition-colors">
                                            <BookOpen className="h-6 w-6 text-[#0B2545] group-hover:text-[#D4AF37] transition-colors" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-bold text-[#0B2545] group-hover:text-[#D4AF37] transition-colors">
                                            {payment.program_title || payment.program_id || "Enrolled Program"}
                                        </h3>
                                        
                                        {totalLessons > 0 ? (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                    <span className="font-medium">{completedLessons} / {totalLessons} lessons completed</span>
                                                    <span className="font-bold text-[#0B2545]">{progressPercentage}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#D4AF37] transition-all duration-1000 ease-out" 
                                                        style={{ width: `${progressPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2.5">
                                                    {remainingLessons} lessons remaining
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 mt-3">No curriculum available yet.</p>
                                        )}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-5">
                                        <Link
                                            href={`/student/course/${payment.program_id}`}
                                            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-sm font-semibold text-white transition-all hover:bg-[#D4AF37] hover:text-[#0B2545]"
                                        >
                                            {isCompleted ? "Review Course" : hasStarted ? "Continue Course" : "Start Course"}
                                            <ArrowRight className="h-4 w-4" />
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
                            href="/student/applications"
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
                                href="/apply"
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
                                    <Link
                                        href={`/student/applications/${application.id}`}
                                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#0B2545] px-3 text-xs font-semibold text-[#0B2545] hover:bg-[#0B2545] hover:text-white"
                                    >
                                        View
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}
