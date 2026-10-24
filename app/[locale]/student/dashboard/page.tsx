"use client";

import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    School,
    Sparkles,
    Target,
    TrendingUp,
    UserRound,
    Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { programsData } from "@/data/programs";

type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    preferred_language: string | null;
    is_active: boolean | null;
    country: string | null;
    date_of_birth: string | null;
};

type StudentProfile = {
    id: string;
    date_of_birth: string | null;
    gender: string | null;
    school_name: string | null;
    grade_level: string | null;
    city: string | null;
    country: string | null;
    parent_constent_status: string | null;
};

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
    created_at: string | null;
};

type Payment = {
    id: string;
    student_name: string | null;
    parent_email: string | null;
    phone: string | null;
    program_id: string | null;
    program_title: string | null;
    amount: number | null;
    vat_amount: number | null;
    total_amount: number | null;
    currency: string | null;
    payment_status: string | null;
    payment_gateway: string | null;
    transaction_id: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type CourseProgress = {
    id: string;
    student_id: string;
    program_id: string;
    completed_lessons: string[];
    current_lesson: string | null;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
};

type DashboardData = {
    profile: Profile | null;
    studentProfile: StudentProfile | null;
    applications: Application[];
    payments: Payment[];
    progress: CourseProgress[];
};

type ParentRequest = {
    id: string;
    parent_id: string;
    status: string;
    created_at: string;
    parent?: {
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
        avatar_url?: string;
    };
};

export default function Page() {
    const locale = useLocale();
    const isAr = locale === "ar";
    const t = useTranslations("StudentDashboard");

    const [dashboard, setDashboard] = useState<DashboardData>({
        profile: null,
        studentProfile: null,
        applications: [],
        payments: [],
        progress: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolledCount, setEnrolledCount] = useState<number>(0);
    const [parentRequests, setParentRequests] = useState<ParentRequest[]>([]);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Fetch parent requests
            try {
                const res = await fetch("/api/student/requests", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                if (res.ok) {
                    const reqData = await res.json();
                    const requestsWithEmail = reqData.requests?.map((req: { parent_id: string; parent: any }) => {
                        const email = reqData.parentUsers?.find((u: { id: string; email: string }) => u.id === req.parent_id)?.email;
                        return { ...req, parent: { ...req.parent, email } };
                    }) || [];
                    setParentRequests(requestsWithEmail);
                }
            } catch (e) {
                console.error("Failed to fetch parent requests", e);
            }
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                setError(t("unableToLoad"));
                return;
            }
            const { data: profile, error: profileError } =
                await supabase
                    .from("profiles")
                    .select(
                        `
                        id,
                        first_name,
                        last_name,
                        display_name,
                        phone,
                        avatar_url,
                        preferred_language,
                        is_active,
                        country,
                        date_of_birth
                        `
                    )
                    .eq("id", user.id)
                    .maybeSingle();

            if (profileError) {
                throw profileError;
            }

            const { data: studentProfile, error: studentProfileError } =
                await supabase
                    .from("student_profiles")
                    .select(
                        `
                        id,
                        date_of_birth,
                        gender,
                        school_name,
                        grade_level,
                        city,
                        country,
                        parent_constent_status
                        `
                    )
                    .eq("id", user.id)
                    .maybeSingle();

            if (studentProfileError) {
                throw studentProfileError;
            }

            const uniFilter = user.email
                ? `user_id.eq.${user.id},email.eq.${user.email}`
                : `user_id.eq.${user.id}`;

            const [uniRes, progRes, enrRes, cEnrRes] = await Promise.all([
                supabase
                    .from("university_applications")
                    .select("id, first_name, last_name, email, phone, age, school, program_id, motivation, created_at")
                    .or(uniFilter)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("program_applications")
                    .select("id, program_id, created_at, status")
                    .eq("student_id", user.id),
                supabase
                    .from("enrollments")
                    .select("id, program_id")
                    .eq("user_id", user.id),
                supabase
                    .from("course_enrollments")
                    .select("id, course_id, status")
                    .eq("user_id", user.id)
                    .in("status", ["active", "enrolled", "paid"])
            ]);

            const enrolledProgIds = new Set<string>();
            (progRes.data || [])
                .filter(p => ["accepted", "approved", "enrolled", "paid", "active"].includes(p.status || ""))
                .forEach(p => p.program_id && enrolledProgIds.add(p.program_id));
            (enrRes.data || []).forEach(e => e.program_id && enrolledProgIds.add(e.program_id));
            (cEnrRes.data || []).forEach(ce => ce.course_id && enrolledProgIds.add(ce.course_id));
            setEnrolledCount(enrolledProgIds.size);

            const mappedProgApps: Application[] = (progRes.data || []).map(p => ({
                id: p.id,
                first_name: profile?.first_name || t("studentFallback"),
                last_name: profile?.last_name || "",
                email: user.email || "",
                phone: profile?.phone || null,
                age: null,
                school: studentProfile?.school_name || null,
                program_id: p.program_id,
                motivation: null,
                created_at: p.created_at
            }));

            const applications = [...(uniRes.data || []), ...mappedProgApps];

            const { data: payments, error: paymentsError } =
                await supabase
                    .from("payments")
                    .select(
                        `
                        id,
                        student_name,
                        parent_email,
                        phone,
                        program_id,
                        program_title,
                        amount,
                        vat_amount,
                        total_amount,
                        currency,
                        payment_status,
                        payment_gateway,
                        transaction_id,
                        created_at,
                        updated_at
                        `
                    )
                    .ilike("parent_email", user.email || "")
                    .order("created_at", { ascending: false });

            if (paymentsError) {
                throw paymentsError;
            }

            const { data: progress, error: progressError } = await supabase
                .from("course_progress")
                .select("*")
                .eq("student_id", user.id);

            if (progressError) {
                console.error("Failed to fetch course progress:", progressError);
            }

            setDashboard({
                profile,
                studentProfile,
                applications: applications ?? [],
                payments: payments ?? [],
                progress: progress ?? [],
            });

            console.log("Student dashboard data:", {
                user,
                profile,
                studentProfile,
                applications,
                payments,
            });
        } catch (err) {
            console.error("Error loading student dashboard:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : t("unableToLoad")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId: string, status: "approved" | "rejected") => {
        try {
            setProcessingRequest(requestId);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/student/requests", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ requestId, status })
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || data.details || t("failedToProcessRequest"));
            }

            setParentRequests(prev => prev.filter(r => r.id !== requestId));
            toast.success(status === "approved" ? t("parentConnectedSuccess") : t("requestRejectedSuccess"));
        } catch (e: any) {
            console.error("Error processing parent request:", e);
            toast.error(e.message || t("failedToUpdateRequest"));
        } finally {
            setProcessingRequest(null);
        }
    };

    const fullName = useMemo(() => {
        const profile = dashboard.profile;

        if (!profile) {
            return t("studentFallback");
        }

        if (profile.display_name?.trim()) {
            return profile.display_name.trim();
        }

        return (
            `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
            t("studentFallback")
        );
    }, [dashboard.profile, t]);

    const notProvidedStr = t("notProvided");

    const schoolName =
        dashboard.studentProfile?.school_name ||
        dashboard.applications[0]?.school ||
        notProvidedStr;

    const country =
        dashboard.studentProfile?.country ||
        dashboard.profile?.country ||
        notProvidedStr;

    const city = dashboard.studentProfile?.city || notProvidedStr;

    const gradeLevel =
        dashboard.studentProfile?.grade_level || notProvidedStr;

    const applicationCount = dashboard.applications.length;

    const programCount = new Set(
        dashboard.applications
            .map((application) => application.program_id)
            .filter(Boolean)
    ).size;

    const paidPayments = dashboard.payments.filter(
        (payment) =>
            payment.payment_status?.toLowerCase() === "paid"
    );

    const paidPaymentCount = paidPayments.length;

    const profileCompletion = useMemo(() => {
        const profile = dashboard.profile;
        const studentProfile = dashboard.studentProfile;

        if (!profile && !studentProfile) {
            return 0;
        }

        const fields = [
            profile?.first_name,
            profile?.last_name,
            profile?.display_name,
            profile?.phone,
            profile?.country,
            profile?.date_of_birth,

            studentProfile?.gender,
            studentProfile?.school_name,
            studentProfile?.grade_level,
            studentProfile?.city,
            studentProfile?.country,
            studentProfile?.parent_constent_status,
        ];

        const completedFields = fields.filter(
            (field) =>
                field !== null &&
                field !== undefined &&
                String(field).trim() !== ""
        ).length;

        return Math.round(
            (completedFields / fields.length) * 100
        );
    }, [dashboard.profile, dashboard.studentProfile]);

    const journey = useMemo(() => {
        const hasProfile = Boolean(
            dashboard.profile || dashboard.studentProfile
        );

        const hasApplication = dashboard.applications.length > 0;
        const hasPayment = paidPaymentCount > 0;

        let currentStage = 0;

        if (hasProfile) {
            currentStage = 1;
        }

        if (hasApplication) {
            currentStage = 2;
        }

        if (hasPayment) {
            currentStage = 3;
        }

        return [
            {
                title: t("stageCreateProfileTitle"),
                description: t("stageCreateProfileDesc"),
                completed: hasProfile,
            },
            {
                title: t("stageExploreProgramsTitle"),
                description: t("stageExploreProgramsDesc"),
                completed: hasApplication,
            },
            {
                title: t("stageApplyTitle"),
                description: t("stageApplyDesc"),
                completed: hasApplication,
            },
            {
                title: t("stageCompletePaymentTitle"),
                description: t("stageCompletePaymentDesc"),
                completed: hasPayment,
            },
        ].map((item, index) => ({
            ...item,
            status:
                item.completed
                    ? "completed"
                    : index === currentStage
                        ? "current"
                        : "upcoming",
        }));
    }, [
        dashboard.profile,
        dashboard.studentProfile,
        dashboard.applications,
        paidPaymentCount,
        t,
    ]);

    const recentApplications = dashboard.applications.slice(0, 3);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50/60" dir="ltr">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4">
                    <div className="text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0B2545]" />

                        <p className="mt-4 text-sm text-gray-500">
                            {t("loading")}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50/60" dir="ltr">
                <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4">
                    <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h1 className="text-xl font-bold text-red-700">
                            {t("unableToLoad")}
                        </h1>

                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchDashboard}
                            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#0B2545] px-5 text-sm font-semibold text-white hover:bg-[#0B2545]/90"
                        >
                            {t("tryAgain")}
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/60" dir="ltr">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                                {t("badge")}
                            </div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {t("welcomeBack", { name: fullName })}
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                {t("headerDesc")}
                            </p>
                        </div>

                        <Link
                            href={locale === "en" ? "/student/profile" : `/${locale}/student/profile`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#e2c45a]"
                        >
                            <UserRound className="h-4 w-4" />
                            {t("viewProfile")}
                        </Link>

                    </div>
                </section>

                {/* =====================================================
                    STUDENT SNAPSHOT
                ====================================================== */}

                <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0B2545]/10">
                                {dashboard.profile?.avatar_url ? (
                                    <img
                                        src={dashboard.profile.avatar_url}
                                        alt={fullName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserRound className="h-7 w-7 text-[#0B2545]" />
                                )}
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#0B2545]">
                                    {fullName}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {schoolName}
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            <SnapshotItem
                                icon={School}
                                label={t("school")}
                                value={schoolName}
                            />

                            <SnapshotItem
                                icon={GraduationCap}
                                label={t("grade")}
                                value={gradeLevel}
                            />

                            <SnapshotItem
                                icon={MapPin}
                                label={t("location")}
                                value={
                                    city !== notProvidedStr
                                        ? `${city}, ${country}`
                                        : notProvidedStr
                                }
                            />

                            <SnapshotItem
                                icon={Mail}
                                label={t("email")}
                                value={dashboard.profile?.first_name
                                    ? dashboard.applications[0]?.email || t("accountEmail")
                                    : t("accountEmail")}
                            />

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    PROGRESS OVERVIEW
                ====================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <DashboardStat
                        icon={TrendingUp}
                        label={t("profileProgress")}
                        value={`${profileCompletion}%`}
                        description={t("profileCompletedDesc")}
                    />

                    <DashboardStat
                        icon={FileText}
                        label={t("applications")}
                        value={String(applicationCount)}
                        description={
                            applicationCount === 1
                                ? t("applicationSubmitted", { count: applicationCount })
                                : t("applicationsSubmitted", { count: applicationCount })
                        }
                    />

                    <DashboardStat
                        icon={BookOpen}
                        label={t("programs")}
                        value={String(programCount)}
                        description={t("programsAppliedTo")}
                    />

                    <DashboardStat
                        icon={CheckCircle2}
                        label={t("payments")}
                        value={String(paidPaymentCount)}
                        description={
                            paidPaymentCount === 1
                                ? t("paymentCompleted", { count: paidPaymentCount })
                                : t("paymentsCompleted", { count: paidPaymentCount })
                        }
                    />

                </section>

                {/* =====================================================
                    PARENT REQUESTS
                ====================================================== */}
                {parentRequests.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#0B2545]">
                                    {t("parentRequestsTitle")}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t("parentRequestsDesc")}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {parentRequests.map((req) => (
                                <div key={req.id} className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-xl border border-[#D4AF37]/20 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B2545]/10">
                                            {req.parent?.avatar_url ? (
                                                <img src={req.parent.avatar_url} alt={t("parent")} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                <UserRound className="h-6 w-6 text-[#0B2545]" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0B2545]">
                                                {req.parent?.first_name} {req.parent?.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {req.parent?.email || t("parent")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRequestAction(req.id, "rejected")}
                                            disabled={processingRequest === req.id}
                                            className="h-10 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                                        >
                                            {t("reject")}
                                        </button>
                                        <button
                                            onClick={() => handleRequestAction(req.id, "approved")}
                                            disabled={processingRequest === req.id}
                                            className="flex h-10 items-center gap-2 rounded-lg bg-[#0B2545] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {t("approve")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* =====================================================
                    MAIN CONTENT
                ====================================================== */}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* =================================================
                        LEARNING JOURNEY
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                                    {t("yourJourney")}
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#0B2545]">
                                    {t("learningJourney")}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t("journeyDesc")}
                                </p>
                            </div>

                        </div>

                        <div className="mt-7 space-y-5">

                            {journey.map((item, index) => (
                                <div
                                    key={item.title}
                                    className="relative flex gap-4"
                                >
                                    {index !== journey.length - 1 && (
                                        <div className="absolute left-[15px] top-9 h-[calc(100%+4px)] w-px bg-gray-200" />
                                    )}

                                    <div
                                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${item.status === "completed"
                                            ? "border-[#0B2545] bg-[#0B2545] text-white"
                                            : item.status === "current"
                                                ? "border-[#D4AF37] bg-[#D4AF37] text-[#0B2545]"
                                                : "border-gray-200 bg-white text-gray-400"
                                            }`}
                                    >
                                        {item.status === "completed" ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="text-xs font-bold">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0 pb-2">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h3 className="font-semibold text-[#0B2545]">
                                                {item.title}
                                            </h3>

                                            {item.status === "current" && (
                                                <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-1 text-[11px] font-semibold text-[#8a6c00]">
                                                    {t("currentStage")}
                                                </span>
                                            )}

                                            {item.status === "completed" && (
                                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                                                    {t("completed")}
                                                </span>
                                            )}

                                        </div>

                                        <p className="mt-1 text-sm leading-5 text-gray-500">
                                            {item.description}
                                        </p>

                                    </div>
                                </div>
                            ))}

                        </div>

                    </section>

                    {/* =================================================
                        PROFILE COMPLETION
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2545]/10">
                            <Target className="h-5 w-5 text-[#0B2545]" />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#0B2545]">
                            {t("completeProfileTitle")}
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                            {t("completeProfileDesc")}
                        </p>

                        <div className="mt-5">

                            <div className="mb-2 flex items-center justify-between text-sm">

                                <span className="font-medium text-gray-600">
                                    {t("profileCompletionRatio")}
                                </span>

                                <span className="font-bold text-[#0B2545]">
                                    {profileCompletion}%
                                </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
                                    style={{
                                        width: `${profileCompletion}%`,
                                    }}
                                />
                            </div>

                        </div>

                        <Link
                            href={locale === "en" ? "/student/profile" : `/${locale}/student/profile`}
                            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-[#0B2545] text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#0B2545] hover:text-white"
                        >
                            {t("updateProfile")}
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                    </section>

                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* =====================================================
                        MY APPLICATIONS
                    ====================================================== */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-[#0B2545]">
                                    {t("universityApplications")}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t("universityApplicationsDesc")}
                                </p>
                            </div>
                        </div>

                        {dashboard.applications.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                                <FileText className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-3 text-sm font-medium text-gray-600">
                                    {t("noUniversityApplications")}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {dashboard.applications.slice(0, 3).map((application) => (
                                    <div key={application.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2545]/10">
                                            <GraduationCap className="h-5 w-5 text-[#0B2545]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[#0B2545] truncate">
                                                {application.program_id || t("universityNotSpecified")}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {t("applicationNumber", { id: application.id })}
                                            </p>
                                            {application.created_at && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {t("submittedOn", { date: new Date(application.created_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="inline-flex h-7 items-center rounded-full bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-600 shrink-0">
                                            {t("pending")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Quick Actions */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <h2 className="text-xl font-bold text-[#0B2545]">
                            {t("quickAccess")}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {t("quickAccessDesc")}
                        </p>

                        <div className="mt-5 space-y-2.5">

                            <QuickAction
                                href="/student/enrolled-programs"
                                icon={BookOpen}
                                title={t("qaEnrolledPrograms")}
                                description={t("qaActiveCourses", { count: enrolledCount })}
                                locale={locale}
                            />
                            
                            <QuickAction
                                href="/student/coaching"
                                icon={Video}
                                title={t("qaCoaching")}
                                description={t("qaCoachingDesc")}
                                locale={locale}
                            />

                            <QuickAction
                                href="/student/applications"
                                icon={FileText}
                                title={t("qaApplications")}
                                description={t("qaApplicationsCount", { count: applicationCount })}
                                locale={locale}
                            />

                            <QuickAction
                                href="/student/profile"
                                icon={UserRound}
                                title={t("qaMyProfile")}
                                description={t("qaProfileProgress", { percent: profileCompletion })}
                                locale={locale}
                            />

                            <QuickAction
                                href="/universities"
                                icon={GraduationCap}
                                title={t("qaUniversities")}
                                description={t("qaUniversitiesDesc")}
                                locale={locale}
                            />

                            <QuickAction
                                href="/apply"
                                icon={BookOpen}
                                title={t("qaNewApplication")}
                                description={t("qaNewApplicationDesc")}
                                locale={locale}
                            />

                        </div>

                    </section>

                </div>

                {/* =====================================================
                    ACCOUNT INFORMATION
                ====================================================== */}

                <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                                {t("accountInfoTitle")}
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-[#0B2545]">
                                {t("studentAccount")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("accountInfoDesc")}
                            </p>
                        </div>

                        <Link
                            href={locale === "en" ? "/student/profile" : `/${locale}/student/profile`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-[#0B2545] px-5 text-sm font-semibold text-[#0B2545] hover:bg-[#0B2545] hover:text-white"
                        >
                            {t("manageProfile")}
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <AccountInfo
                            icon={UserRound}
                            label={t("name")}
                            value={fullName}
                        />

                        <AccountInfo
                            icon={Mail}
                            label={t("email")}
                            value={dashboard.applications[0]?.email || notProvidedStr}
                        />

                        <AccountInfo
                            icon={Phone}
                            label={t("phone")}
                            value={
                                dashboard.profile?.phone ||
                                dashboard.applications[0]?.phone ||
                                notProvidedStr
                            }
                        />

                        <AccountInfo
                            icon={School}
                            label={t("school")}
                            value={schoolName}
                        />

                    </div>

                </section>

            </div>
        </main>
    );
}


/* =========================================================
   SNAPSHOT ITEM
========================================================= */

function SnapshotItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>

            <p className="mt-1 truncate text-sm font-medium text-gray-700">
                {value}
            </p>
        </div>
    );
}


/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#0B2545]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545]/10">
                    <Icon className="h-5 w-5 text-[#0B2545]" />
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
    locale,
}: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    locale?: string;
}) {
    const localizedHref = locale && locale !== 'en' ? `/${locale}${href}` : href;
    return (
        <Link
            href={localizedHref}
            className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5"
        >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2545]/10">
                <Icon className="h-4 w-4 text-[#0B2545]" />
            </div>

            <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-[#0B2545]">
                    {title}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                    {description}
                </p>

            </div>

            <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0B2545]" />

        </Link>
    );
}


/* =========================================================
   ACCOUNT INFO
========================================================= */

function AccountInfo({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 p-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                <Icon className="h-4 w-4 text-[#0B2545]" />
            </div>

            <div className="min-w-0">

                <p className="text-xs text-gray-400">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-medium text-gray-700">
                    {value}
                </p>

            </div>

        </div>
    );
}
