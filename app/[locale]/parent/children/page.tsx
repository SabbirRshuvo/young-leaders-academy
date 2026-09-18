"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    ArrowRight,
    CalendarDays,
    ChevronRight,
    FileText,
    GraduationCap,
    Mail,
    Phone,
    Search,
    School,
    UserRound,
    Users,
} from "lucide-react";
import { useState } from "react";

type ApplicationStatus =
    | "Under Review"
    | "Submitted"
    | "Accepted"
    | "Rejected";

type Child = {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    email: string;
    phone: string;
    school: string;
    program: string;
    applicationStatus: ApplicationStatus;
    applications: number;
    joined: string;
};

const children: Child[] = [
    {
        id: "child-1",
        first_name: "Alex",
        last_name: "Johnson",
        age: 17,
        email: "alex@example.com",
        phone: "+1 555 123 4567",
        school: "Lincoln High School",
        program: "Young Leaders Program",
        applicationStatus: "Under Review",
        applications: 2,
        joined: "September 2026",
    },
    {
        id: "child-2",
        first_name: "Emma",
        last_name: "Johnson",
        age: 15,
        email: "emma@example.com",
        phone: "+1 555 987 6543",
        school: "Lincoln High School",
        program: "Global Scholars",
        applicationStatus: "Submitted",
        applications: 1,
        joined: "August 2026",
    },
];

export default function Page() {
  const t = useTranslations("Parent");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChildren = children.filter((child) => {
        const search = searchQuery.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (
            `${child.first_name} ${child.last_name}`
                .toLowerCase()
                .includes(search) ||
            child.school.toLowerCase().includes(search) ||
            child.program.toLowerCase().includes(search)
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
                                <Users className="h-4 w-4 text-[#D4AF37]" />
      {t("parentPortal")}
    </div>

                            <h1 className="text-2xl font-bold sm:text-3xl">
      {t("myChildren")}
    </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                {t("viewChildrenInfo")}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">

                            <Users className="h-6 w-6 text-[#D4AF37]" />

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    SUMMARY
                ====================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <SummaryCard
                        icon={Users}
                        label="Total Children"
                        value={children.length}
                        description="Connected to your account"
                    />

                    <SummaryCard
                        icon={FileText}
                        label="Applications"
                        value={children.reduce(
                            (total, child) => total + child.applications,
                            0
                        )}
                        description={t("totalApplications")}
                    />

                    <SummaryCard
                        icon={GraduationCap}
                        label="Active Programs"
                        value={
                            children.filter(
                                (child) =>
                                    child.program &&
                                    child.applicationStatus !== "Rejected"
                            ).length
                        }
                        description={t("activeProgress")}
                    />

                </section>

                {/* =====================================================
                    SEARCH
                ====================================================== */}

                <section className="mt-6">

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                        <div className="relative">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder={t("searchPlaceholder")}
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                            />

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    SECTION HEADING
                ====================================================== */}

                <section className="mt-6">

                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545]">
      {t("yourChildren")}
    </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {filteredChildren.length}{" "}
                                {filteredChildren.length === 1
                                    ? "child"
                                    : "children"}{" "}
                                found
                            </p>
                        </div>

                        <Link
                            href="/parent/profile"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37]"
                        >
      {t("parentDashboard")}
    <ChevronRight className="h-4 w-4" />
                        </Link>

                    </div>

                    {/* =================================================
                        CHILDREN CARDS
                    ================================================== */}

                    {filteredChildren.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                            {filteredChildren.map((child) => (
                                <ChildCard
                                    key={child.id}
                                    child={child}
                                />
                            ))}

                        </div>
                    ) : (
                        <EmptyChildren />
                    )}

                </section>

            </div>
        </main>
    );
}


/* =========================================================
   CHILD CARD
========================================================= */

function ChildCard({
    child,
}: {
    child: Child;
}) {
  const t = useTranslations("Parent");
    return (
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">

            {/* Card Header */}

            <div className="border-b border-gray-100 p-5 sm:p-6">

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0B2545]/10">
                            <GraduationCap className="h-7 w-7 text-[#0B2545]" />
                        </div>

                        <div className="min-w-0">

                            <h3 className="truncate text-lg font-bold text-[#0B2545]">
                                {child.first_name} {child.last_name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Age {child.age}
                            </p>

                        </div>

                    </div>

                    <StatusBadge
                        status={child.applicationStatus}
                    />

                </div>

            </div>

            {/* Child Information */}

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">

                <InfoItem
                    icon={School}
                    label="School"
                    value={child.school}
                />

                <InfoItem
                    icon={GraduationCap}
                    label="Program"
                    value={child.program}
                />

                <InfoItem
                    icon={Mail}
                    label="Email"
                    value={child.email}
                />

                <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={child.phone}
                />

                <InfoItem
                    icon={FileText}
                    label="Applications"
                    value={`${child.applications} ${
                        child.applications === 1
                            ? "application"
                            : "applications"
                    }`}
                />

                <InfoItem
                    icon={CalendarDays}
                    label="Joined"
                    value={child.joined}
                />

            </div>

            {/* Actions */}

            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 p-5 sm:flex-row sm:p-6">

                <Link
                    href={`/parent/children/${child.id}`}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#0B2545] px-4 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#0B2545] hover:text-white"
                >
      {t("viewProfile")}
    <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                    href="/parent/applications"
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#0B2545] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90"
                >
      {t("applications")}
    <FileText className="h-4 w-4" />
                </Link>

            </div>

        </article>
    );
}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
  const t = useTranslations("Parent");
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
   SUMMARY CARD
========================================================= */

function SummaryCard({
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
  const t = useTranslations("Parent");
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
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
}: {
    status: ApplicationStatus;
}) {
  const t = useTranslations("Parent");
    const styles: Record<ApplicationStatus, string> = {
        Submitted: "border-blue-100 bg-blue-50 text-blue-700",
        "Under Review": "border-amber-100 bg-amber-50 text-amber-700",
        Accepted: "border-green-100 bg-green-50 text-green-700",
        Rejected: "border-red-100 bg-red-50 text-red-700",
    };

    return (
        <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
        >
            {status}
        </span>
    );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyChildren() {
  const t = useTranslations("Parent");
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545]/10">
                <UserRound className="h-7 w-7 text-[#0B2545]" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B2545]">
      {t("noChildrenFound")}
    </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {t("noChildrenDesc")}
            </p>

            <Link
                href="/contact"
                className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0B2545] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90"
            >
      {t("contactSupport")}
    <ArrowRight className="h-4 w-4" />
            </Link>

        </div>
    );
}
