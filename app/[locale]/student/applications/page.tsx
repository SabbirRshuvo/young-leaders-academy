"use client";

import {
    ChevronRight,
    FileText,
    GraduationCap,
    Mail,
    Phone,
    Search,
    School,
    UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
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
    created_at: string | null;
};

export default function Page() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get the currently logged-in user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                setApplications([]);
                setError("You must be logged in to view your applications.");
                return;
            }

            // Fetch applications belonging to the logged-in user
            // using the email stored in the Applications table.
            const { data, error: applicationsError } = await supabase
                .from("applications")
                .select(
                    `
                    id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    age,
                    school,
                    program_id,
                    motivation,
                    created_at
                    `
                )
                .ilike("email", user.email || "")
                .order("created_at", { ascending: false });


            if (applicationsError) {
                throw applicationsError;
            }

            console.log("Fetched applications:", data);
            console.log("Fetched user:", user);
            console.log("Fetched applications:", data);
            setApplications(data ?? []);
        } catch (err) {
            console.error("Error fetching applications:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter((application) => {
        const search = searchQuery.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (
            application.program_id
                ?.toLowerCase()
                .includes(search) ||
            application.school
                ?.toLowerCase()
                .includes(search) ||
            application.first_name
                .toLowerCase()
                .includes(search) ||
            application.last_name
                .toLowerCase()
                .includes(search) ||
            application.email
                .toLowerCase()
                .includes(search) ||
            application.id
                .toLowerCase()
                .includes(search)
        );
    });

    return (
        <main className="min-h-screen bg-gray-50/60">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <FileText className="h-4 w-4 text-[#D4AF37]" />
                                Student Applications
                            </div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                My Applications
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                Track your applications and review the
                                information you submitted.
                            </p>
                        </div>

                        <Link
                            href="/apply"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#e2c45a]"
                        >
                            <FileText className="h-4 w-4" />
                            Start New Application
                        </Link>

                    </div>
                </section>

                {/* =====================================================
                    STATISTICS
                ====================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">

                    <ApplicationStat
                        icon={FileText}
                        label="Total Applications"
                        value={applications.length}
                        description="Applications submitted"
                    />

                    <ApplicationStat
                        icon={GraduationCap}
                        label="Programs Applied To"
                        value={
                            new Set(
                                applications
                                    .map(
                                        (application) =>
                                            application.program_id
                                    )
                                    .filter(Boolean)
                            ).size
                        }
                        description="Different programs"
                    />

                </section>

                {/* =====================================================
                    SEARCH
                ====================================================== */}

                <section className="mt-6">

                    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search your applications..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                            />
                        </div>

                    </div>

                    {/* =================================================
                        SECTION HEADING
                    ================================================== */}

                    <div className="mb-4 flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545]">
                                Your Applications
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {filteredApplications.length}{" "}
                                {filteredApplications.length === 1
                                    ? "application"
                                    : "applications"}{" "}
                                found
                            </p>
                        </div>

                    </div>

                    {/* =================================================
                        LOADING
                    ================================================== */}

                    {loading && (
                        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0B2545]" />

                            <p className="mt-4 text-sm text-gray-500">
                                Loading your applications...
                            </p>

                        </div>
                    )}

                    {/* =================================================
                        ERROR
                    ================================================== */}

                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">

                            <h3 className="text-lg font-bold text-red-700">
                                Unable to load applications
                            </h3>

                            <p className="mx-auto mt-2 max-w-lg text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={fetchApplications}
                                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#0B2545] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90"
                            >
                                Try Again
                            </button>

                        </div>
                    )}

                    {/* =================================================
                        APPLICATION CARDS
                    ================================================== */}

                    {!loading &&
                        !error &&
                        filteredApplications.length > 0 && (
                            <div className="space-y-4">

                                {filteredApplications.map(
                                    (application) => (
                                        <ApplicationCard
                                            key={application.id}
                                            application={application}
                                        />
                                    )
                                )}

                            </div>
                        )}

                    {/* =================================================
                        EMPTY STATE
                    ================================================== */}

                    {!loading &&
                        !error &&
                        filteredApplications.length === 0 && (
                            <EmptyApplications
                                hasSearchQuery={Boolean(
                                    searchQuery.trim()
                                )}
                            />
                        )}

                </section>

            </div>
        </main>
    );
}


/* =========================================================
   APPLICATION CARD
========================================================= */

function ApplicationCard({
    application,
}: {
    application: Application;
}) {
    const fullName =
        `${application.first_name} ${application.last_name}`.trim();

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">

            <div className="flex flex-col gap-5">

                {/* =================================================
                    TOP
                ================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B2545]/10">
                            <GraduationCap className="h-6 w-6 text-[#0B2545]" />
                        </div>

                        <div>

                            <h3 className="text-lg font-bold text-[#0B2545]">
                                {application.program_id ||
                                    "Program not specified"}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Application #{application.id}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Divider */}

                <div className="h-px bg-gray-100" />

                {/* =================================================
                    APPLICANT INFORMATION
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <InfoItem
                        icon={UserRound}
                        label="Applicant"
                        value={fullName || "Not provided"}
                    />

                    <InfoItem
                        icon={School}
                        label="School"
                        value={application.school || "Not provided"}
                    />

                    <InfoItem
                        icon={Mail}
                        label="Email"
                        value={application.email || "Not provided"}
                    />

                    <InfoItem
                        icon={Phone}
                        label="Phone"
                        value={application.phone || "Not provided"}
                    />

                </div>

                {/* =================================================
                    AGE
                ================================================== */}

                {application.age !== null && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserRound className="h-4 w-4 text-[#0B2545]" />

                        <span>
                            Age{" "}
                            <span className="font-semibold text-gray-700">
                                {application.age}
                            </span>
                        </span>
                    </div>
                )}

                {/* =================================================
                    MOTIVATION
                ================================================== */}

                {application.motivation && (
                    <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Motivation
                        </p>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                            {application.motivation}
                        </p>

                    </div>
                )}

                {/* =================================================
                    BOTTOM
                ================================================== */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="text-sm text-gray-500">
                        Application ID:{" "}
                        <span className="font-medium text-gray-700">
                            {application.id}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {application.program_id && (
                            <Link
                                href={`/student/course/${application.program_id}`}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#e3be47] shadow-sm"
                            >
                                Continue Program
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        )}
                        <Link
                            href={`/student/applications/${application.id}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-[#0B2545] px-5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#0B2545] hover:text-white"
                        >
                            View Details
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                </div>

            </div>

        </article>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">

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


/* =========================================================
   APPLICATION STAT
========================================================= */

function ApplicationStat({
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
   EMPTY STATE
========================================================= */

function EmptyApplications({
    hasSearchQuery,
}: {
    hasSearchQuery: boolean;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545]/10">
                <FileText className="h-7 w-7 text-[#0B2545]" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B2545]">
                {hasSearchQuery
                    ? "No applications found"
                    : "No applications yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {hasSearchQuery
                    ? "No applications match your current search."
                    : "You don't have any applications yet. Start a new application to begin your journey."}
            </p>

            {!hasSearchQuery && (
                <Link
                    href="/apply"
                    className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0B2545] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90"
                >
                    Start an Application
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}

        </div>
    );
}
