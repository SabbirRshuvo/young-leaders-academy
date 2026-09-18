"use client";

import Link from "next/link";
import {
    ArrowRight,
    Award,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    FileText,
    GraduationCap,
    MapPin,
    Sparkles,
    Target,
    TrendingUp,
    UserRound,
} from "lucide-react";

const upcomingItems = [
    {
        type: "Assessment",
        title: "Leadership Skills Assessment",
        date: "Today",
        time: "4:00 PM",
        icon: ClipboardCheck,
    },
    {
        type: "Workshop",
        title: "University Application Workshop",
        date: "Sep 20",
        time: "5:30 PM",
        icon: BookOpen,
    },
    {
        type: "Deadline",
        title: "Complete Student Profile",
        date: "Sep 22",
        time: "11:59 PM",
        icon: UserRound,
    },
];

const learningJourney = [
    {
        title: "Discover",
        description: "Understand your strengths, interests, and goals.",
        status: "completed",
    },
    {
        title: "Develop",
        description: "Build leadership and academic skills.",
        status: "current",
    },
    {
        title: "Explore",
        description: "Discover programs and university opportunities.",
        status: "upcoming",
    },
    {
        title: "Apply",
        description: "Prepare and submit your university applications.",
        status: "upcoming",
    },
];

const universities = [
    {
        name: "University of Toronto",
        location: "Toronto, Canada",
        match: "92%",
        program: "Business & Leadership",
    },
    {
        name: "University of Melbourne",
        location: "Melbourne, Australia",
        match: "88%",
        program: "Social Sciences",
    },
    {
        name: "University of Manchester",
        location: "Manchester, UK",
        match: "85%",
        program: "International Studies",
    },
];

export default function Page() {
    return (
        <main className="min-h-screen bg-gray-50/60">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                                Student Dashboard
                            </div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Welcome back, Student!
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                Continue your Young Leaders Academy journey,
                                track your progress, and explore your next
                                opportunity.
                            </p>
                        </div>

                        <Link
                            href="/student/profile"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#e2c45a]"
                        >
                            <UserRound className="h-4 w-4" />
                            View Profile
                        </Link>

                    </div>
                </section>

                {/* =====================================================
                    PROGRESS OVERVIEW
                ====================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <DashboardStat
                        icon={TrendingUp}
                        label="Journey Progress"
                        value="42%"
                        description="Keep moving forward"
                    />

                    <DashboardStat
                        icon={BookOpen}
                        label="Programs"
                        value="2"
                        description="Currently enrolled"
                    />

                    <DashboardStat
                        icon={ClipboardCheck}
                        label="Assessments"
                        value="3"
                        description="1 pending"
                    />

                    <DashboardStat
                        icon={Award}
                        label="Certificates"
                        value="1"
                        description="Earned so far"
                    />

                </section>

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
                                    Your journey
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#0B2545]">
                                    Learning Journey
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Follow your progress from discovery to
                                    university application.
                                </p>
                            </div>

                            <Link
                                href="/student"
                                className="hidden items-center gap-1 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37] sm:flex"
                            >
                                View journey
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-7 space-y-5">

                            {learningJourney.map((item, index) => (
                                <div
                                    key={item.title}
                                    className="relative flex gap-4"
                                >
                                    {index !== learningJourney.length - 1 && (
                                        <div className="absolute left-[15px] top-9 h-[calc(100%+4px)] w-px bg-gray-200" />
                                    )}

                                    <div
                                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                            item.status === "completed"
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
                                                    Current stage
                                                </span>
                                            )}

                                            {item.status === "completed" && (
                                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                                                    Completed
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
                            Complete Your Profile
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                            A complete profile helps us personalize your
                            learning journey and university recommendations.
                        </p>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-600">
                                    Profile completion
                                </span>

                                <span className="font-bold text-[#0B2545]">
                                    70%
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-[#D4AF37]"
                                    style={{ width: "70%" }}
                                />
                            </div>
                        </div>

                        <Link
                            href="/student/profile"
                            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-[#0B2545] text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#0B2545] hover:text-white"
                        >
                            Complete Profile
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                    </section>

                </div>

                {/* =====================================================
                    UPCOMING ACTIVITIES + QUICK ACTIONS
                ====================================================== */}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Upcoming */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-[#0B2545]">
                                    Upcoming
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Stay on top of your next activities.
                                </p>
                            </div>

                            <Link
                                href="/student/schedule"
                                className="text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37]"
                            >
                                View schedule
                            </Link>
                        </div>

                        <div className="mt-5 divide-y divide-gray-100">

                            {upcomingItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2545]/10">
                                            <Icon className="h-5 w-5 text-[#0B2545]" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#D4AF37]">
                                                {item.type}
                                            </p>

                                            <h3 className="mt-0.5 truncate text-sm font-semibold text-[#0B2545]">
                                                {item.title}
                                            </h3>

                                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {item.date}
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {item.time}
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                                    </div>
                                );
                            })}

                        </div>

                    </section>

                    {/* Quick actions */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <h2 className="text-xl font-bold text-[#0B2545]">
                            Quick Access
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Jump directly to your student portal.
                        </p>

                        <div className="mt-5 space-y-2.5">

                            <QuickAction
                                href="/student/applications"
                                icon={FileText}
                                title="Applications"
                                description="Track your applications"
                            />

                            <QuickAction
                                href="/student/profile"
                                icon={UserRound}
                                title="My Profile"
                                description="Manage your information"
                            />

                            <QuickAction
                                href="/student/assessments"
                                icon={ClipboardCheck}
                                title="Assessments"
                                description="View your assessments"
                            />

                            <QuickAction
                                href="/student/programs"
                                icon={BookOpen}
                                title="My Programs"
                                description="View enrolled programs"
                            />

                            <QuickAction
                                href="/student/certificates"
                                icon={Award}
                                title="Certificates"
                                description="View earned certificates"
                            />

                        </div>

                    </section>

                </div>

                {/* =====================================================
                    UNIVERSITY RECOMMENDATIONS
                ====================================================== */}

                <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                                Explore opportunities
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-[#0B2545]">
                                University Recommendations
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Explore universities that may align with your
                                interests and goals.
                            </p>
                        </div>

                        <Link
                            href="/universities"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37]"
                        >
                            Explore universities
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                        {universities.map((university) => (
                            <div
                                key={university.name}
                                className="rounded-xl border border-gray-200 p-5 transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2545]/10">
                                        <GraduationCap className="h-5 w-5 text-[#0B2545]" />
                                    </div>

                                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                                        {university.match} match
                                    </span>
                                </div>

                                <h3 className="mt-4 font-semibold text-[#0B2545]">
                                    {university.name}
                                </h3>

                                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {university.location}
                                </div>

                                <p className="mt-3 text-sm text-gray-500">
                                    {university.program}
                                </p>

                                <Link
                                    href="/universities"
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37]"
                                >
                                    View university
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        ))}

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
}: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
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
