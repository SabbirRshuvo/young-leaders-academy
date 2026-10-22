"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    GraduationCap,
    Mail,
    Users,
    Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type UpcomingEvent = {
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
};

const getUpcomingEvents = (isAr: boolean): UpcomingEvent[] => [
    {
        id: "event-1",
        title: isAr ? "لقاء تعريفي بقادة الغد" : "Young Leaders Orientation",
        date: isAr ? "٢٠ سبتمبر ٢٠٢٦" : "September 20, 2026",
        time: isAr ? "١٠:٠٠ ص" : "10:00 AM",
        type: isAr ? "لقاء تعريفي" : "Orientation",
    },
    {
        id: "event-2",
        title: isAr ? "جلسة معلومات لأولياء الأمور" : "Parent Information Session",
        date: isAr ? "٢٤ سبتمبر ٢٠٢٦" : "September 24, 2026",
        time: isAr ? "٦:٠٠ م" : "6:00 PM",
        type: isAr ? "جلسة أولياء أمور" : "Parent Session",
    },
    {
        id: "event-3",
        title: isAr ? "ندوة الفرص والقبول العالمي" : "Global Opportunities Webinar",
        date: isAr ? "٢٨ سبتمبر ٢٠٢٦" : "September 28, 2026",
        time: isAr ? "٥:٣٠ م" : "5:30 PM",
        type: isAr ? "ندوة عبر الإنترنت" : "Webinar",
    },
];

type ChildDashboard = {
    id: string;
    name: string;
    age: number | string;
    school: string;
    program: string;
    applicationStatus: string;
    status: "pending" | "approved" | "rejected";
    request_id?: string;
};

export default function Page() {
    const t = useTranslations("Parent");
    const locale = useLocale();
    const isAr = locale === "ar";

    const [children, setChildren] = useState<ChildDashboard[]>([]);
    const [loading, setLoading] = useState(true);

    const upcomingEvents = getUpcomingEvents(isAr);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                
                const res = await fetch("/api/parent/children", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                if (!res.ok) throw new Error("Failed to load dashboard data");
                
                const data = await res.json();
                const formattedChildren: ChildDashboard[] = [];

                // Format all requests (pending, rejected, approved)
                data.requests?.forEach((req: any) => {
                    const profile = req.student || {};
                    const school = data.studentProfiles?.find((p: any) => p.id === req.student_id)?.school_name || t("schoolNotProvided");
                    
                    formattedChildren.push({
                        id: req.student_id,
                        request_id: req.id,
                        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || t("studentFallback"),
                        age: "N/A",
                        school,
                        program: "N/A",
                        applicationStatus: "N/A",
                        status: req.status
                    });
                });

                setChildren(formattedChildren);
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [t]);

    const totalChildren = children.length;
    const pendingRequests = children.filter(c => c.status === "pending").length;
    const approvedConnections = children.filter(c => c.status === "approved").length;

    return (
        <main className={`min-h-screen bg-gray-50/60 ${isAr ? "font-arabic" : "font-sans"}`} dir="ltr">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* =====================================================
                    WELCOME HEADER
                ====================================================== */}

                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <p className="mb-2 text-sm font-medium text-white/70">
                                {t("parentDashboard")}
                            </p>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {t("welcomeBack")}
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                {t("keepTrack")}
                            </p>
                        </div>

                        <Link
                            href={`/${locale}/parent/children`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#e2c45a]"
                        >
                            <Users className="h-4 w-4" />
                            {t("viewMyChildren")}
                        </Link>

                    </div>
                </section>

                {/* =====================================================
                    QUICK STATS
                ====================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <DashboardStat
                        icon={Users}
                        label={t("totalChildren")}
                        value={totalChildren}
                        description={t("totalChildrenDesc")}
                    />

                    <DashboardStat
                        icon={CheckCircle2}
                        label={t("approvedConnections")}
                        value={approvedConnections}
                        description={t("approvedConnectionsDesc")}
                    />

                    <DashboardStat
                        icon={Clock}
                        label={t("pendingRequests")}
                        value={pendingRequests}
                        description={t("pendingRequestsDesc")}
                    />

                    <DashboardStat
                        icon={CalendarDays}
                        label={t("upcomingEvents")}
                        value={upcomingEvents.length}
                        description={t("upcomingEventsDesc")}
                    />

                </section>

                {/* =====================================================
                    MAIN GRID
                ====================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* =================================================
                        CHILDREN / REQUESTS
                    ================================================== */}

                    <div className="lg:col-span-2">

                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">

                                <div>
                                    <h2 className="text-lg font-bold text-[#0B2545]">
                                        {t("myChildrenAndRequests")}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {t("myChildrenDesc")}
                                    </p>
                                </div>

                                <Link
                                    href={`/${locale}/parent/children`}
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37]"
                                >
                                    {t("viewAll")}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>

                            </div>

                            <div className="divide-y divide-gray-100">

                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D4AF37]"></div>
                                    </div>
                                ) : children.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        {t("noChildrenOrRequests")}
                                    </div>
                                ) : (
                                    children.slice(0, 4).map((child) => (
                                        <div
                                            key={child.request_id || child.id}
                                            className="p-5 sm:p-6"
                                        >
                                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                                <div className="flex min-w-0 items-center gap-4">

                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B2545]/10">
                                                        <GraduationCap className="h-6 w-6 text-[#0B2545]" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-bold text-[#0B2545]">
                                                            {child.name}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {child.school}
                                                        </p>
                                                    </div>

                                                </div>

                                                <div className="flex flex-col items-start gap-2 sm:items-end">

                                                    <ConnectionBadge status={child.status} t={t} />

                                                    {child.status === "approved" && (
                                                        <p className="text-xs text-gray-400">
                                                            {t("activeConnection")}
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                            {child.status === "approved" && (
                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                                    <Link
                                                        href={`/${locale}/parent/children/${child.id}`}
                                                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#0B2545] px-4 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#0B2545] hover:text-white"
                                                    >
                                                        {t("viewProfile")}
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            )}

                                        </div>
                                    ))
                                )}

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        UPCOMING EVENTS
                    ================================================== */}

                    <div className="lg:col-span-1">

                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 px-5 py-5">

                                <h2 className="text-lg font-bold text-[#0B2545]">
                                    {t("upcomingEvents")}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t("stayInformed")}
                                </p>

                            </div>

                            <div className="divide-y divide-gray-100">

                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-5"
                                    >
                                        <div className="flex gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
                                                <CalendarDays className="h-5 w-5 text-[#0B2545]" />
                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                                                    {event.type}
                                                </p>

                                                <h3 className="mt-1 text-sm font-bold text-[#0B2545]">
                                                    {event.title}
                                                </h3>

                                                <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500">

                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {event.date}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        {event.time}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="border-t border-gray-100 p-4">

                                <Link
                                    href={`/${locale}/events`}
                                    className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#0B2545] text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#0B2545] hover:text-white"
                                >
                                    {t("viewAllEvents")}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    QUICK ACTIONS
                ====================================================== */}

                <section className="mt-6">

                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-[#0B2545]">
                            {t("quickActions")}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {t("quickAccess")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <QuickAction
                            href={`/${locale}/parent/children`}
                            icon={Users}
                            title={t("actionChildren")}
                            description={t("actionChildrenDesc")}
                        />

                        <QuickAction
                            href={`/${locale}/parent/applications`}
                            icon={FileText}
                            title={t("actionApplications")}
                            description={t("actionApplicationsDesc")}
                        />

                        <QuickAction
                            href={`/${locale}/events`}
                            icon={CalendarDays}
                            title={t("actionEvents")}
                            description={t("actionEventsDesc")}
                        />

                        <QuickAction
                            href={`/${locale}/parent/profile`}
                            icon={Mail}
                            title={t("actionProfile")}
                            description={t("actionProfileDesc")}
                        />

                    </div>

                </section>

            </div>
        </main>
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
    value: number;
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
   CONNECTION BADGE
========================================================= */

function ConnectionBadge({
    status,
    t,
}: {
    status: string;
    t: any;
}) {
    const styles: Record<string, string> = {
        approved: "border-green-200 bg-green-50 text-green-700",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        rejected: "border-red-200 bg-red-50 text-red-700",
    };
    const labels: Record<string, string> = {
        approved: t("statusApproved"),
        pending: t("statusPending"),
        rejected: t("statusRejected"),
    };

    return (
        <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}
        >
            {labels[status] || status}
        </span>
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
}: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-4">

                <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545]/10">
                        <Icon className="h-5 w-5 text-[#0B2545]" />
                    </div>

                    <h3 className="mt-4 font-bold text-[#0B2545]">
                        {title}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                        {description}
                    </p>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#0B2545]" />

            </div>
        </Link>
    );
}
