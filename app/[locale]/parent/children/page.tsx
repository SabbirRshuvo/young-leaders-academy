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
    Plus,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import AddChildModal from "@/components/parent/AddChildModal";
import { supabase } from "@/lib/supabase";

type ApplicationStatus =
    | "Under Review"
    | "Submitted"
    | "Accepted"
    | "Rejected";

type Child = {
    id: string;
    first_name: string;
    last_name: string;
    age?: number;
    email?: string;
    phone?: string;
    school: string;
    program?: string;
    applicationStatus?: ApplicationStatus;
    applications: number;
    joined: string;
    status?: "pending" | "approved" | "rejected";
    request_id?: string;
};

export default function Page() {
    const t = useTranslations("Parent");
    const [searchQuery, setSearchQuery] = useState("");
    
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch("/api/parent/children", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (!res.ok) throw new Error("Failed to load children");
            
            const data = await res.json();
            
            const formattedChildren: Child[] = [];
            
            // Format all requests (pending, rejected, approved)
            data.requests?.forEach((req: {
                status: "pending" | "approved" | "rejected";
                student: any;
                student_id: string;
                id: string;
                created_at: string;
            }) => {
                const profile = req.student || {};
                const studentEmail = data.users?.find((u: any) => u.id === req.student_id)?.email || "";
                
                formattedChildren.push({
                    id: req.student_id,
                    request_id: req.id,
                    first_name: profile.first_name || "Unknown",
                    last_name: profile.last_name || "",
                    email: studentEmail,
                    phone: profile.phone || "N/A",
                    school: data.studentProfiles?.find((p: any) => p.id === req.student_id)?.school_name || "N/A",
                    applications: data.studentApplications?.filter((a: any) => a.email === studentEmail).length || 0,
                    joined: new Date(req.created_at).toLocaleDateString(),
                    status: req.status
                });
            });

            setChildren(formattedChildren);
        } catch (error) {
            console.error("Error loading children:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    const filteredChildren = children.filter((child) => {
        const search = searchQuery.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (
            `${child.first_name} ${child.last_name}`
                .toLowerCase()
                .includes(search) ||
            child.school.toLowerCase().includes(search)
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

                        <div className="flex shrink-0 items-center gap-4">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 text-sm font-bold text-[#0B2545] transition-all hover:bg-[#e6c045] hover:shadow-lg active:scale-95"
                            >
                                <Plus className="h-5 w-5" />
                                Add Child
                            </button>
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
                        label="Pending Requests"
                        value={children.filter((child) => child.status === "pending").length}
                        description="Awaiting student approval"
                    />

                    <SummaryCard
                        icon={CheckCircle2Icon}
                        label="Approved Connections"
                        value={children.filter((child) => child.status === "approved").length}
                        description="Successfully connected"
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

                    {loading ? (
                        <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                        </div>
                    ) : filteredChildren.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                            {filteredChildren.map((child) => (
                                <ChildCard
                                    key={child.request_id || child.id}
                                    child={child}
                                />
                            ))}

                        </div>
                    ) : (
                        <EmptyChildren onAddChild={() => setIsAddModalOpen(true)} />
                    )}

                </section>

            </div>

            <AddChildModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={fetchChildren} 
            />
        </main>
    );
}

function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
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
                                {child.email || "No email provided"}
                            </p>

                        </div>

                    </div>

                    <StatusBadge
                        status={child.status || "approved"}
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
                    icon={Phone}
                    label="Phone"
                    value={child.phone || "N/A"}
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
                    label="Request Date"
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
    status: string;
}) {
    const styles: Record<string, string> = {
        approved: "border-green-200 bg-green-50 text-green-700",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        rejected: "border-red-200 bg-red-50 text-red-700",
    };

    const labels: Record<string, string> = {
        approved: "Approved",
        pending: "Pending",
        rejected: "Rejected",
    };

    return (
        <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}
        >
            {labels[status] || status}
        </span>
    );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyChildren({ onAddChild }: { onAddChild: () => void }) {
    const t = useTranslations("Parent");
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B2545]/10">
                <Users className="h-8 w-8 text-[#0B2545]" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#0B2545]">
                {t("noChildrenFound")}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {t("noChildrenDesc")}
            </p>

            <button
                onClick={onAddChild}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-6 text-sm font-bold text-white transition-all hover:bg-[#0B2545]/90 hover:shadow-md active:scale-95"
            >
                <Plus className="h-5 w-5" />
                Add Your Child
            </button>

        </div>
    );
}
