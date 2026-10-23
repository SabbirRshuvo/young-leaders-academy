"use client";

import { useState, useEffect } from "react";
import { Users, Shield, ShieldOff, Loader2, Eye, BookOpen, CheckCircle, Clock, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

type UserData = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
    created_at: string;
};

export default function AdminUsersPage() {
    const t = useTranslations("Admin");
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"All" | "Students" | "Parents" | "Coaches" | "Admins">("All");

    // Student Details Modal State
    const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
    const [studentDetails, setStudentDetails] = useState<{ profile: any, enrollments: any[], progress: any[] } | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const getTabLabel = (tab: string) => {
        switch (tab) {
            case "All": return t("tabAll");
            case "Students": return t("tabStudents");
            case "Parents": return t("tabParents");
            case "Coaches": return t("tabCoaches");
            case "Admins": return t("tabAdmins");
            default: return tab;
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
            toast.error(t("toastLoadUsersError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAdminRole = async (userId: string, currentRoles: string[], email: string) => {
        if (email === "adminsabbir@gmail.com") {
            toast.error(t("toastMasterAdminError"));
            return;
        }

        const isCurrentlyAdmin = currentRoles.includes("admin");
        const action = isCurrentlyAdmin ? "remove_admin" : "make_admin";
        
        setProcessingId(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || t("toastUpdateRoleError"));
            
            toast.success(data.message);
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("toastUpdateRoleError"));
        } finally {
            setProcessingId(null);
        }
    };

    const toggleCoachRole = async (userId: string, currentRoles: string[]) => {
        const isCurrentlyCoach = currentRoles.includes("coach");
        const action = isCurrentlyCoach ? "remove_coach" : "make_coach";
        
        setProcessingId(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || t("toastUpdateCoachError"));
            
            toast.success(data.message);
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("toastUpdateCoachError"));
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        if (activeTab === "All") return true;
        if (activeTab === "Students") return user.roles.includes("student") && !user.roles.includes("admin") && !user.roles.includes("parent") && !user.roles.includes("coach");
        if (activeTab === "Parents") return user.roles.includes("parent") && !user.roles.includes("admin");
        if (activeTab === "Coaches") return user.roles.includes("coach");
        if (activeTab === "Admins") return user.roles.includes("admin");
        return true;
    });

    const openStudentDetails = async (user: UserData) => {
        setSelectedStudent(user);
        setStudentDetails(null);
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch student details");
            const data = await res.json();
            setStudentDetails({ 
                profile: data.profile || null,
                enrollments: data.enrollments || [], 
                progress: data.progress || [] 
            });
        } catch (error) {
            console.error("Gracefully caught details error:", error);
            // DO NOT CRASH: just show whatever basic info we have
            setStudentDetails({
                profile: null,
                enrollments: [],
                progress: []
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545]">{t("userManagement")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("userManagementDesc")}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                {(["All", "Students", "Parents", "Coaches", "Admins"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === tab
                                ? "bg-[#0B2545] text-white shadow-sm"
                                : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                        }`}
                    >
                        {getTabLabel(tab)}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/50">
                    <Users className="h-5 w-5 text-[#0B2545] mr-2" />
                    <h2 className="text-lg font-bold text-[#0B2545]">{t("usersListTitle", { tab: getTabLabel(activeTab) })}</h2>
                </div>
                
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">{t("colUser")}</th>
                                    <th className="px-6 py-4 font-semibold">{t("colEmail")}</th>
                                    <th className="px-6 py-4 font-semibold">{t("colCurrentRole")}</th>
                                    <th className="px-6 py-4 font-semibold text-right">{t("colActions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => {
                                    const isAdmin = user.roles.includes("admin");
                                    const isMaster = user.email === "adminsabbir@gmail.com";
                                    const isCoach = user.roles.includes("coach");
                                    const isParent = user.roles.includes("parent");
                                    
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#0B2545]">
                                                    {user.first_name} {user.last_name}
                                                    {!user.first_name && !user.last_name && t("unnamedUser")}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {t("joinedOn", { date: new Date(user.created_at).toLocaleDateString() })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                    isAdmin 
                                                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                                                    : isCoach
                                                        ? "bg-amber-50 text-amber-800 border-amber-300"
                                                        : isParent
                                                            ? "bg-teal-50 text-teal-700 border-teal-200"
                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                }`}>
                                                    {isAdmin ? t("roleAdmin") : isCoach ? t("roleCoach") : isParent ? t("roleParent") : t("roleStudent")}
                                                    {isMaster && t("roleMaster")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openStudentDetails(user)}
                                                        className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold rounded-lg transition-all bg-gray-100 text-[#0B2545] hover:bg-gray-200"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1.5" />
                                                        {t("viewActivity")}
                                                    </button>
                                                    {!isAdmin && !isMaster && (
                                                        <button
                                                            onClick={() => toggleCoachRole(user.id, user.roles)}
                                                            disabled={processingId === user.id}
                                                            className={`inline-flex items-center justify-center px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                                                                isCoach
                                                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                                                                    : "bg-white text-[#0B2545] border border-gray-200 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {isCoach ? t("revokeCoach") : t("makeCoach")}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => toggleAdminRole(user.id, user.roles, user.email)}
                                                        disabled={isMaster || processingId === user.id}
                                                        className={`inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                                            isMaster 
                                                            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                                                            : isAdmin
                                                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                                : "bg-[#0B2545] text-white hover:bg-[#1a3a63]"
                                                        }`}
                                                    >
                                                        {processingId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : isAdmin ? (
                                                            <>
                                                                <ShieldOff className="h-4 w-4 mr-1.5" />
                                                                {t("revokeAdmin")}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Shield className="h-4 w-4 mr-1.5" />
                                                                {t("makeAdmin")}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            {t("noUsersFound", { tab: getTabLabel(activeTab) })}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[#0B2545]">
                                        {selectedStudent.first_name} {selectedStudent.last_name}
                                    </h2>
                                    <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                                </div>
                                {studentDetails?.profile && (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-max ${
                                        (studentDetails.profile.is_online || studentDetails.profile.status === 'active') 
                                        ? "bg-green-50 text-green-700 border border-green-200" 
                                        : "bg-gray-50 text-gray-600 border border-gray-200"
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${
                                            (studentDetails.profile.is_online || studentDetails.profile.status === 'active') 
                                            ? "bg-green-500 animate-pulse" 
                                            : "bg-gray-400"
                                        }`}></span>
                                        {(studentDetails.profile.is_online || studentDetails.profile.status === 'active') ? t("onlineActive") : t("offline")}
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {loadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-2" />
                                    <p className="text-sm text-gray-500">{t("loadingStudentActivity")}</p>
                                </div>
                            ) : studentDetails ? (
                                <div className="space-y-6">
                                    
                                    {/* Stats Summary */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><BookOpen className="w-5 h-5" /></div>
                                            <div>
                                                <div className="text-sm text-gray-500 font-medium">{t("enrollmentsCount")}</div>
                                                <div className="text-xl font-bold text-[#0B2545]">{studentDetails.enrollments.length}</div>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle className="w-5 h-5" /></div>
                                            <div>
                                                <div className="text-sm text-gray-500 font-medium">{t("completedItems")}</div>
                                                <div className="text-xl font-bold text-[#0B2545]">{studentDetails.progress.length}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enrollments List */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">{t("enrolledPrograms")}</h3>
                                        {studentDetails.enrollments.length === 0 ? (
                                            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                                                {t("studentNotEnrolled")}
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {studentDetails.enrollments.map((enrollment, idx) => (
                                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-blue-200 transition-colors">
                                                        <div>
                                                            <div className="font-bold text-[#0B2545]">{enrollment.program?.title || t("unknownProgram")}</div>
                                                            <div className="text-xs text-gray-500 flex items-center mt-1">
                                                                <Clock className="w-3 h-3 mr-1" /> {t("enrolledOn", { date: new Date(enrollment.created_at).toLocaleDateString() })}
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                                            enrollment.status === 'active' 
                                                                ? "bg-green-50 text-green-700 border-green-200" 
                                                                : "bg-gray-100 text-gray-600 border-gray-200"
                                                        }`}>
                                                            {enrollment.status === 'active' ? t("active") : enrollment.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            ) : (
                                <div className="text-center py-8 text-red-500">{t("failedToLoadData")}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
