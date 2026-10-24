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
    X,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

type Application = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    age: number | null;
    school: string | null;
    program_id: string | null;
    university_id: string | null;
    program_title?: string | null;
    motivation: string | null;
    created_at: string | null;
    status?: string | null;
    payment_status?: string | null;
    type: 'program' | 'university';
};

// Helper to extract bilingual JSON or string titles
function getLocalizedText(value: any, locale: string): string {
    if (!value) return "";
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed[locale] || parsed.en || Object.values(parsed)[0] || "";
            }
        } catch {
            return value;
        }
        return value;
    }
    if (typeof value === "object") {
        return value[locale] || value.en || Object.values(value)[0] || "";
    }
    return String(value);
}

export default function StudentApplicationsPage() {
    const t = useTranslations("StudentApplications");
    const params = useParams();
    const locale = (params?.locale as string) || "en";
    const isAr = locale === "ar";

    const [applications, setApplications] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<'All' | 'Programs' | 'Universities'>('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

    const getStatusLabel = (status: string | null | undefined) => {
        if (!status) return t("statusPending");
        const s = status.toLowerCase();
        if (s === "accepted") return t("statusAccepted");
        if (s === "approved") return t("statusApproved");
        if (s === "enrolled") return t("statusEnrolled");
        if (s === "rejected") return t("statusRejected");
        if (s === "pending") return t("statusPending");
        return status;
    };

    const getPaymentLabel = (payment: string | null | undefined) => {
        if (!payment) return t("paymentUnpaid");
        const p = payment.toLowerCase();
        if (p === "paid") return t("paymentPaid");
        if (p === "pending") return t("paymentPending");
        if (p === "unpaid") return t("paymentUnpaid");
        return payment;
    };

    useEffect(() => {
        fetchApplications();

        // Refresh when tab gains focus
        const handleFocus = () => {
            fetchApplications();
        };
        window.addEventListener("focus", handleFocus);

        // Realtime updates when new applications are submitted or status changes
        const channel = supabase
            .channel("realtime-student-applications")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "program_applications" },
                () => {
                    fetchApplications();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "university_applications" },
                () => {
                    fetchApplications();
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener("focus", handleFocus);
            supabase.removeChannel(channel);
        };
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

            if (userError) throw userError;

            if (!user) {
                setApplications([]);
                setError(t("loginRequired"));
                return;
            }

            // 1. Fetch university applications (by user_id or matching email)
            const uniFilter = user.email
                ? `user_id.eq.${user.id},email.eq.${user.email}`
                : `user_id.eq.${user.id}`;

            const { data: uniData, error: uniError } = await supabase
                .from("university_applications")
                .select("*")
                .or(uniFilter);

            // 2. Fetch program applications
            const { data: progData, error: progError } = await supabase
                .from("program_applications")
                .select("*")
                .eq("student_id", user.id);

            if (uniError) throw uniError;
            if (progError) throw progError;

            // 3. Fetch user profile for display name / first & last name
            const { data: userProfile } = await supabase
                .from("profiles")
                .select("display_name, first_name, last_name, email")
                .eq("id", user.id)
                .maybeSingle();

            // 4. Fetch program & course title lookups so raw UUIDs are resolved to human titles
            const [programsRes, coursesRes] = await Promise.all([
                supabase.from("programs").select("id, title"),
                supabase.from("courses").select("id, title")
            ]);

            const titleMap = new Map<string, string>();
            (programsRes.data || []).forEach(p => {
                titleMap.set(p.id, getLocalizedText(p.title, locale));
            });
            (coursesRes.data || []).forEach(c => {
                titleMap.set(c.id, getLocalizedText(c.title, locale));
            });

            const studentFirstName = userProfile?.first_name || userProfile?.display_name?.split(" ")[0] || t("studentDefault");
            const studentLastName = userProfile?.last_name || userProfile?.display_name?.split(" ").slice(1).join(" ") || "";
            const studentEmail = userProfile?.email || user.email || "";

            const defaultUniTitle = t("defaultUniTitle");
            const defaultProgTitle = t("defaultProgramTitle");

            const mappedUni: Application[] = (uniData || []).map(app => {
                const readableTitle = app.program_id && titleMap.has(app.program_id)
                    ? titleMap.get(app.program_id)!
                    : app.university_id || app.program_id || defaultUniTitle;

                return {
                    ...app,
                    type: 'university' as const,
                    program_title: readableTitle
                };
            });

            const mappedProg: Application[] = (progData || []).map(app => {
                const readableTitle = app.program_id && titleMap.has(app.program_id)
                    ? titleMap.get(app.program_id)!
                    : app.program_id ? t("programWithId", { id: app.program_id.slice(0, 8) }) : defaultProgTitle;

                return {
                    ...app,
                    type: 'program' as const,
                    first_name: studentFirstName,
                    last_name: studentLastName,
                    email: studentEmail,
                    program_title: readableTitle,
                    university_id: null,
                    school: null,
                    age: null,
                    phone: null,
                    motivation: null,
                    payment_status: app.status === 'accepted' || app.status === 'enrolled' ? 'paid' : 'pending'
                };
            });

            const allApps = [...mappedUni, ...mappedProg].sort((a, b) => {
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });

            setApplications(allApps);
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : t("failedToLoad")
            );
        } finally {
            setLoading(false);
        }
    };

    // Filter applications based on tab and search
    const filteredApplications = useMemo(() => {
        return applications.filter((application) => {
            if (activeTab === 'Programs' && application.type !== 'program') return false;
            if (activeTab === 'Universities' && application.type !== 'university') return false;

            const search = searchQuery.toLowerCase().trim();
            if (!search) return true;

            return (
                application.program_title?.toLowerCase().includes(search) ||
                application.program_id?.toLowerCase().includes(search) ||
                application.university_id?.toLowerCase().includes(search) ||
                application.school?.toLowerCase().includes(search) ||
                application.first_name.toLowerCase().includes(search) ||
                application.last_name.toLowerCase().includes(search) ||
                application.email.toLowerCase().includes(search) ||
                application.id.toLowerCase().includes(search)
            );
        });
    }, [applications, activeTab, searchQuery]);

    // Dynamic counts
    const programCount = useMemo(() => applications.filter(a => a.type === 'program').length, [applications]);
    const uniCount = useMemo(() => applications.filter(a => a.type === 'university').length, [applications]);

    return (
        <main dir="ltr" className={`min-h-screen bg-gray-50/60 relative ${isAr ? "font-arabic" : "font-sans"}`}>
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* HEADER */}
                <section className="rounded-2xl bg-[#0B2545] px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <FileText className="h-4 w-4 text-[#D4AF37]" />
                                {t("badge")}
                            </div>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {t("title")}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                {t("subtitle")}
                            </p>
                        </div>
                        <Link
                            href={`/${locale}/apply`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-bold text-[#0B2545] transition-transform hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <FileText className="h-4 w-4" />
                            {t("startNewApplication")}
                        </Link>
                    </div>
                </section>

                {/* DYNAMIC STAT BADGES */}
                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
                    <ApplicationStat
                        icon={FileText}
                        label={t("totalApplications")}
                        value={applications.length}
                        description={loading ? t("countingRecords") : t("totalRegistered", { count: applications.length })}
                        loading={loading}
                    />
                    <ApplicationStat
                        icon={School}
                        label={t("programApplications")}
                        value={programCount}
                        description={loading ? t("counting") : t("programsApplied", { count: programCount })}
                        loading={loading}
                    />
                    <ApplicationStat
                        icon={GraduationCap}
                        label={t("universityApplications")}
                        value={uniCount}
                        description={loading ? t("counting") : t("universitiesApplied", { count: uniCount })}
                        loading={loading}
                    />
                </section>

                {/* SEARCH & FILTERS */}
                <section className="mt-6">
                    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* TABS & HEADING */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#0B2545]">
                                {t("yourApplications")}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {t("applicationsFound", { count: filteredApplications.length })}
                            </p>
                        </div>
                        <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm shrink-0">
                            {[
                                { key: 'All', label: t("tabAll", { count: applications.length }) },
                                { key: 'Programs', label: t("tabPrograms", { count: programCount }) },
                                { key: 'Universities', label: t("tabUniversities", { count: uniCount }) }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                                        activeTab === tab.key
                                            ? "bg-[#0B2545] text-white shadow-sm"
                                            : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LOADING STATE */}
                    {loading && (
                        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0B2545]" />
                            <p className="mt-4 text-sm font-medium text-gray-500">{t("loading")}</p>
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
                            <h3 className="text-lg font-bold text-red-700">{t("unableToLoad")}</h3>
                            <p className="mx-auto mt-2 max-w-lg text-sm text-red-600">{error}</p>
                            <button
                                type="button"
                                onClick={fetchApplications}
                                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#0B2545] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90 cursor-pointer"
                            >
                                {t("tryAgain")}
                            </button>
                        </div>
                    )}

                    {/* APPLICATION CARDS */}
                    {!loading && !error && filteredApplications.length > 0 && (
                        <div className="space-y-4">
                            {filteredApplications.map((application) => (
                                <ApplicationCard
                                    key={application.id}
                                    application={application}
                                    locale={locale}
                                    onViewDetails={() => setSelectedApplication(application)}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && !error && filteredApplications.length === 0 && (
                        <EmptyApplications
                            hasSearchQuery={Boolean(searchQuery.trim())}
                            locale={locale}
                        />
                    )}
                </section>
            </div>

            {/* DETAIL MODAL */}
            {selectedApplication && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-[#0B2545]/40 backdrop-blur-sm"
                        onClick={() => setSelectedApplication(null)}
                    />
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col my-auto">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]" />
                        <button
                            onClick={() => setSelectedApplication(null)}
                            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6 mt-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B2545]/10">
                                <FileText className="h-6 w-6 text-[#0B2545]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#0B2545]">{t("modalTitle")}</h2>
                                <p className="text-sm font-medium text-gray-500">{t("modalRef", { id: selectedApplication.id })}</p>
                            </div>
                        </div>

                        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t("applicantName")}</p>
                                    <p className="font-bold text-[#0B2545] text-base">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t("targetEntity")}</p>
                                    <p className="font-bold text-[#0B2545] text-base truncate" title={selectedApplication.program_title || ""}>
                                        {selectedApplication.program_title || t("notSpecified")}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t("applicationType")}</p>
                                    <p className="font-bold text-[#0B2545] capitalize">
                                        {selectedApplication.type === 'university' ? t("universityApplication") : t("programApplication")}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t("applicationStatus")}</p>
                                    <p className={`font-bold capitalize ${
                                        selectedApplication.status === 'accepted' || selectedApplication.status === 'approved' ? 'text-green-600' :
                                        selectedApplication.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                                    }`}>
                                        {getStatusLabel(selectedApplication.status)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t("dateSubmitted")}</p>
                                    <p className="font-bold text-[#0B2545]">{new Date(selectedApplication.created_at || "").toLocaleDateString()}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t("contactEmail")}</p>
                                    <p className="font-bold text-[#0B2545] truncate">{selectedApplication.email || "N/A"}</p>
                                </div>
                            </div>

                            {selectedApplication.motivation && (
                                <div className="rounded-xl bg-gray-50 p-5 border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{t("statementOfMotivation")}</p>
                                    <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-[#D4AF37] pl-4">
                                        "{selectedApplication.motivation}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer text-center"
                            >
                                {t("closeDetails")}
                            </button>
                            {selectedApplication.type === 'program' && selectedApplication.program_id && (selectedApplication.status === "accepted" || selectedApplication.payment_status === "paid" || selectedApplication.status === "approved" || selectedApplication.status === "enrolled") && (
                                <Link
                                    href={`/${locale}/programs/${selectedApplication.program_id}/play`}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-6 text-sm font-bold text-white transition-all hover:bg-[#D4AF37] hover:text-[#0B2545] hover:shadow-md hover:-translate-y-0.5"
                                >
                                    {t("openLearningHub")}
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

function ApplicationCard({
    application,
    locale,
    onViewDetails,
}: {
    application: Application;
    locale: string;
    onViewDetails: () => void;
}) {
    const t = useTranslations("StudentApplications");
    const fullName = `${application.first_name} ${application.last_name}`.trim();
    const displayTitle = application.program_title || application.university_id || application.program_id || (application.type === 'university' ? t("defaultUniTitle") : t("defaultProgramTitle"));

    const getStatusLabel = (status: string | null | undefined) => {
        if (!status) return t("statusPending");
        const s = status.toLowerCase();
        if (s === "accepted") return t("statusAccepted");
        if (s === "approved") return t("statusApproved");
        if (s === "enrolled") return t("statusEnrolled");
        if (s === "rejected") return t("statusRejected");
        if (s === "pending") return t("statusPending");
        return status;
    };

    const getPaymentLabel = (payment: string | null | undefined) => {
        if (!payment) return t("paymentUnpaid");
        const p = payment.toLowerCase();
        if (p === "paid") return t("paymentPaid");
        if (p === "pending") return t("paymentPending");
        if (p === "unpaid") return t("paymentUnpaid");
        return payment;
    };

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="flex flex-col gap-5">
                {/* TOP */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B2545]/10">
                            {application.type === 'university' ? (
                                <GraduationCap className="h-6 w-6 text-[#0B2545]" />
                            ) : (
                                <School className="h-6 w-6 text-[#0B2545]" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0B2545]">
                                {displayTitle}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <span className="capitalize font-semibold text-[#D4AF37]">
                                    {application.type === 'university' ? t("universityApplication") : t("programApplication")}
                                </span>
                                <span>•</span>
                                <span>{t("ref", { id: application.id.slice(0, 8) })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {application.status && (
                            <div className="shrink-0 flex items-center justify-center rounded-full bg-gray-50 px-3 py-1 border border-gray-100">
                                <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    {t("statusLabel")}
                                    <span
                                        className={
                                            application.status === 'accepted' || application.status === 'approved'
                                                ? 'text-green-600'
                                                : application.status === 'rejected'
                                                ? 'text-red-500'
                                                : 'text-amber-500'
                                        }
                                    >
                                        {getStatusLabel(application.status)}
                                    </span>
                                </span>
                            </div>
                        )}
                        {application.payment_status && (
                            <div className="shrink-0 flex items-center justify-center rounded-full bg-gray-50 px-3 py-1 border border-gray-100">
                                <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    {t("paymentLabel")}
                                    <span
                                        className={
                                            application.payment_status === 'paid'
                                                ? 'text-green-600'
                                                : 'text-amber-500'
                                        }
                                    >
                                        {getPaymentLabel(application.payment_status)}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* APPLICANT INFORMATION */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoItem icon={UserRound} label={t("colApplicant")} value={fullName || t("studentDefault")} />
                    <InfoItem icon={School} label={t("colSchool")} value={application.school || t("notSpecified")} />
                    <InfoItem icon={Mail} label={t("colEmail")} value={application.email || t("notSpecified")} />
                    <InfoItem icon={Phone} label={t("colPhone")} value={application.phone || t("notSpecified")} />
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2 pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-400 font-medium">
                        {t("submittedOn", { date: new Date(application.created_at || "").toLocaleDateString() })}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {application.type === 'program' && application.program_id && (application.status === "accepted" || application.payment_status === "paid") && (
                            <Link
                                href={`/${locale}/programs/${application.program_id}/play`}
                                className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-[#0B2545] transition-all hover:bg-[#e3be47] hover:shadow-md hover:-translate-y-0.5"
                            >
                                {t("startLearning")}
                            </Link>
                        )}
                        <button
                            onClick={onViewDetails}
                            className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-[#0B2545] px-5 text-sm font-bold text-[#0B2545] transition-all hover:bg-[#0B2545] hover:text-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                        >
                            {t("viewDetails")}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                <Icon className="h-4 w-4 text-[#0B2545]" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-700">{value}</p>
            </div>
        </div>
    );
}

function ApplicationStat({
    icon: Icon,
    label,
    value,
    description,
    loading
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    description: string;
    loading?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500">{label}</p>
                    {loading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="mt-2 text-3xl font-black text-[#0B2545]">{value}</p>
                    )}
                    <p className="mt-1 text-xs font-medium text-gray-400">{description}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B2545]/10">
                    <Icon className="h-6 w-6 text-[#0B2545]" />
                </div>
            </div>
        </div>
    );
}

function EmptyApplications({
    hasSearchQuery,
    locale
}: {
    hasSearchQuery: boolean;
    locale: string;
}) {
    const t = useTranslations("StudentApplications");
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545]/10">
                <FileText className="h-7 w-7 text-[#0B2545]" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#0B2545]">
                {hasSearchQuery ? t("emptySearchTitle") : t("emptyDefaultTitle")}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {hasSearchQuery ? t("emptySearchDesc") : t("emptyDefaultDesc")}
            </p>
            {!hasSearchQuery && (
                <Link
                    href={`/${locale}/apply`}
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0B2545] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0B2545]/90"
                >
                    {t("startAnApplication")}
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}
