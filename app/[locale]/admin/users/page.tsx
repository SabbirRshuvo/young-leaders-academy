"use client";

import { useState, useEffect } from "react";
import { Users, Shield, ShieldOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

type UserData = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
    created_at: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"All" | "Students" | "Parents" | "Admins">("All");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAdminRole = async (userId: string, currentRoles: string[], email: string) => {
        if (email === "adminsabbir@gmail.com") {
            toast.error("Cannot modify the Master Admin account!");
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
            
            if (!res.ok) throw new Error(data.error || "Failed to update role");
            
            toast.success(data.message);
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update role");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        if (activeTab === "All") return true;
        if (activeTab === "Students") return user.roles.includes("student") && !user.roles.includes("admin") && !user.roles.includes("parent");
        if (activeTab === "Parents") return user.roles.includes("parent") && !user.roles.includes("admin");
        if (activeTab === "Admins") return user.roles.includes("admin");
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545]">User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage platform users and administrator roles</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                {["All", "Students", "Parents", "Admins"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === tab
                                ? "bg-[#0B2545] text-white shadow-sm"
                                : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/50">
                    <Users className="h-5 w-5 text-[#0B2545] mr-2" />
                    <h2 className="text-lg font-bold text-[#0B2545]">{activeTab} Users</h2>
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
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Current Role</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => {
                                    const isAdmin = user.roles.includes("admin");
                                    const isMaster = user.email === "adminsabbir@gmail.com";
                                    const isParent = user.roles.includes("parent");
                                    
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#0B2545]">
                                                    {user.first_name} {user.last_name}
                                                    {!user.first_name && !user.last_name && "Unnamed User"}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    Joined: {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    isAdmin 
                                                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                                                    : isParent
                                                        ? "bg-teal-50 text-teal-700 border-teal-200"
                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                }`}>
                                                    {isAdmin ? "Administrator" : isParent ? "Parent" : "Student"}
                                                    {isMaster && " (Master)"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
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
                                                            Revoke Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="h-4 w-4 mr-1.5" />
                                                            Make Admin
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No {activeTab.toLowerCase()} found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
