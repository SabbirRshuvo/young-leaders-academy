"use client";

import { useState, useEffect } from "react";
import {
    Users,
    GraduationCap,
    BookOpen,
    CheckCircle,
    Clock,
    Plus,
    X,
    Loader2,
    Calendar,
    Mail,
    Phone,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

type CoachApplication = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    institution_name: string | null;
    message: string | null;
    pdpl_consent: boolean;
    created_at: string;
};

type CoachUser = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    professional_title: string;
    bio: string;
    specialization: string;
    years_of_experience: number;
    created_at: string;
};

type ModuleItem = {
    id: string;
    title: any;
    description: any;
    program_id: string;
    programs?: { title: any };
};

type Assignment = {
    id?: string;
    coach_id: string;
    module_id: string;
    assigned_at: string;
};

export default function AdminCoachesPage() {
    const [activeTab, setActiveTab] = useState<"coaches" | "applications">("coaches");
    const [coaches, setCoaches] = useState<CoachUser[]>([]);
    const [applications, setApplications] = useState<CoachApplication[]>([]);
    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Module assignment modal state
    const [selectedCoach, setSelectedCoach] = useState<CoachUser | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string>("");

    // Approved coach credentials modal state
    const [approvedCredentials, setApprovedCredentials] = useState<{ email: string; fullName: string; tempPassword?: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/coaches");
            if (!res.ok) throw new Error("Failed to load coaches data");
            const data = await res.json();
            setCoaches(data.coaches || []);
            setApplications(data.applications || []);
            setModules(data.modules || []);
            setAssignments(data.assignments || []);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error loading coaches data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveApplication = async (app: CoachApplication) => {
        setProcessingId(app.id);
        try {
            const res = await fetch("/api/admin/coaches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "approve_application",
                    leadId: app.id,
                    email: app.email,
                    fullName: app.full_name,
                    phone: app.phone,
                    title: "YLA Certified Coach & Mentor",
                    specialization: app.message ? "Leadership & Career Mentorship" : "Leadership & Personal Development"
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to approve application");

            if (data.tempPassword) {
                setApprovedCredentials({
                    email: app.email,
                    fullName: app.full_name,
                    tempPassword: data.tempPassword
                });
                toast.success(`Approved! Temporary password: ${data.tempPassword}`, { duration: 8000 });
            } else {
                toast.success(data.message);
            }
            await fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to approve application");
        } finally {
            setProcessingId(null);
        }
    };

    const handleAssignModule = async () => {
        if (!selectedCoach || !selectedModuleId) {
            toast.error("Please select a module to assign");
            return;
        }

        setProcessingId(selectedCoach.id);
        try {
            const res = await fetch("/api/admin/coaches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "assign_module",
                    coachId: selectedCoach.id,
                    moduleId: selectedModuleId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to assign module");

            toast.success(data.message);
            setSelectedCoach(null);
            setSelectedModuleId("");
            await fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to assign module");
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnassignModule = async (coachId: string, moduleId: string) => {
        setProcessingId(`${coachId}-${moduleId}`);
        try {
            const res = await fetch("/api/admin/coaches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "unassign_module",
                    coachId,
                    moduleId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove assignment");

            toast.success(data.message);
            await fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to remove assignment");
        } finally {
            setProcessingId(null);
        }
    };

    const parseTitle = (title: any) => {
        if (!title) return "Untitled";
        if (typeof title === "string") {
            try {
                const parsed = JSON.parse(title);
                return parsed.en || parsed.ar || title;
            } catch {
                return title;
            }
        }
        return title.en || title.ar || "Untitled";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545]">Coach Management & Module Assignments</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review mentor applications, manage coach profiles, and assign certified modules for 1-on-1 scheduling
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab("coaches")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
                        activeTab === "coaches"
                            ? "bg-[#0B2545] text-white shadow-sm"
                            : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                    }`}
                >
                    <GraduationCap className="w-4 h-4" />
                    Active Coaches ({coaches.length})
                </button>
                <button
                    onClick={() => setActiveTab("applications")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
                        activeTab === "applications"
                            ? "bg-[#0B2545] text-white shadow-sm"
                            : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Pending Applications ({applications.length})
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 flex justify-center items-center shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                </div>
            ) : activeTab === "coaches" ? (
                /* ACTIVE COACHES LIST */
                <div className="space-y-4">
                    {coaches.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-[#0B2545]">No Active Coaches Yet</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                Approve incoming coach applications or promote existing platform users to the Coach role.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {coaches.map((coach) => {
                                const coachAssigned = assignments.filter(a => a.coach_id === coach.id);
                                const assignedModuleIds = coachAssigned.map(a => a.module_id);
                                const coachModuleList = modules.filter(m => assignedModuleIds.includes(m.id));

                                return (
                                    <div key={coach.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                        Certified Coach
                                                    </span>
                                                    <h3 className="text-lg font-bold text-[#0B2545]">
                                                        {coach.first_name} {coach.last_name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">{coach.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedCoach(coach)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0B2545] text-white hover:bg-[#133055] transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Assign Module
                                                </button>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-1.5">
                                                <p><span className="font-semibold text-gray-700">Specialization:</span> {coach.specialization}</p>
                                                <p><span className="font-semibold text-gray-700">Title:</span> {coach.professional_title}</p>
                                            </div>

                                            {/* Assigned Modules List */}
                                            <div className="mt-5">
                                                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                    Assigned Modules ({coachModuleList.length})
                                                </h4>
                                                {coachModuleList.length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
                                                        No modules assigned yet. Click "Assign Module" above to enable students to book 1-on-1 sessions.
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {coachModuleList.map(m => (
                                                            <span
                                                                key={m.id}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                                                            >
                                                                {parseTitle(m.title)}
                                                                <button
                                                                    onClick={() => handleUnassignModule(coach.id, m.id)}
                                                                    disabled={processingId === `${coach.id}-${m.id}`}
                                                                    className="hover:text-red-600 transition-colors p-0.5 rounded"
                                                                    title="Unassign module"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                            <span>Coach ID: {coach.id.slice(0, 8)}...</span>
                                            <span>Joined: {new Date(coach.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* PENDING COACH APPLICATIONS */
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#0B2545]" />
                            <h2 className="text-lg font-bold text-[#0B2545]">Coach & Mentor Applications</h2>
                        </div>
                        <span className="text-xs text-gray-500">Submitted via Faculty / Mentor registration</span>
                    </div>

                    {applications.length === 0 ? (
                        <div className="p-12 text-center">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-[#0B2545]">All caught up!</h3>
                            <p className="text-sm text-gray-500 mt-1">There are no pending coach applications at this time.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Applicant</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Message / Qualifications</th>
                                        <th className="px-6 py-4">Applied Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-[#0B2545]">
                                                {app.full_name}
                                                {app.institution_name && (
                                                    <span className="block text-xs font-normal text-gray-400">
                                                        {app.institution_name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    {app.email}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {app.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                                                {app.message || "No custom message provided."}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleApproveApplication(app)}
                                                    disabled={processingId === app.id}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B2545] text-white hover:bg-[#133055] transition-all disabled:opacity-60"
                                                >
                                                    {processingId === app.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                                                            Approve Coach
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ASSIGN MODULE MODAL */}
            {selectedCoach && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-[#0B2545]">Assign Module to Coach</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Assign a program module to <span className="font-semibold text-[#0B2545]">{selectedCoach.first_name} {selectedCoach.last_name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCoach(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B2545] mb-2 uppercase tracking-wide">
                                Select Program Module:
                            </label>
                            <select
                                value={selectedModuleId}
                                onChange={(e) => setSelectedModuleId(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#0B2545] outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                            >
                                <option value="">-- Choose Module --</option>
                                {modules.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {parseTitle(m.title)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setSelectedCoach(null)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAssignModule}
                                disabled={processingId === selectedCoach.id || !selectedModuleId}
                                className="px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133055] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {processingId === selectedCoach.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coach Credentials Modal */}
            {approvedCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setApprovedCredentials(null)}
                            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-bold text-[#0B2545]">
                            Coach Account Activated!
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Coach application approved for <span className="font-semibold text-gray-800">{approvedCredentials.fullName}</span>. Please copy and provide these credentials to the coach directly:
                        </p>

                        <div className="mt-5 space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs">
                            <div>
                                <span className="text-gray-400 block mb-0.5 font-medium">Login Email</span>
                                <span className="font-bold text-[#0B2545] text-sm select-all">{approvedCredentials.email}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5 font-medium">Temporary Password</span>
                                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                                    <span className="font-mono font-bold text-sm text-emerald-600 select-all">
                                        {approvedCredentials.tempPassword}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (approvedCredentials.tempPassword) {
                                                navigator.clipboard.writeText(approvedCredentials.tempPassword);
                                                toast.success("Password copied to clipboard!");
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-[#0B2545] text-white font-bold text-[11px] hover:bg-[#133055] transition-colors"
                                    >
                                        Copy Password
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const text = `Young Leaders Academy Coach Credentials:\nEmail: ${approvedCredentials.email}\nTemporary Password: ${approvedCredentials.tempPassword}\nLogin at: ${window.location.origin}/login`;
                                    navigator.clipboard.writeText(text);
                                    toast.success("Full credentials copied!");
                                }}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#D4AF37] text-[#0B2545] font-bold text-xs hover:bg-[#c4a132] transition-colors text-center"
                            >
                                Copy All Details
                            </button>
                            <button
                                type="button"
                                onClick={() => setApprovedCredentials(null)}
                                className="py-3 px-5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
