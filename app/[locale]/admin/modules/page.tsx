"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";

export default function GlobalModulesPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const locale = useLocale();

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        setLoading(true);
        // Fetch all modules with their parent program and a count of contents
        const { data, error } = await supabase
            .from("modules")
            .select(`
                id,
                title,
                created_at,
                program_id,
                program:programs(title),
                module_contents(id)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Global Modules Fetch Error:", error);
            toast.error("Failed to load modules directory.");
        } else {
            setModules(data || []);
        }
        setLoading(false);
    };

    const filteredModules = modules.filter(m => 
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.program?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-3">
                        Global Modules Directory
                        {!loading && <span className="bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full font-medium">{modules.length} Total</span>}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">A centralized view of all modules across all programs in the system.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
                    <div className="flex items-center text-[#0B2545] font-bold">
                        <BookOpen className="h-5 w-5 mr-2" />
                        All Modules
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by module or program..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                        />
                    </div>
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
                                    <th className="px-6 py-4 font-semibold">Module Title</th>
                                    <th className="px-6 py-4 font-semibold">Parent Program</th>
                                    <th className="px-6 py-4 font-semibold">Items</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredModules.length > 0 ? (
                                    filteredModules.map((mod) => {
                                        const programTitle = typeof mod.program?.title === 'string' ? mod.program?.title : mod.program?.title?.en || "Unknown Program";
                                        
                                        return (
                                            <tr key={mod.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-[#0B2545]">{mod.title}</div>
                                                    <div className="text-xs text-gray-400 mt-1">ID: {mod.id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                        {programTitle}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-700">{mod.module_contents?.length || 0}</span>
                                                    <span className="text-gray-400 ml-1">contents</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link 
                                                        href={`/${locale}/admin/programs/${mod.program_id}/modules`} 
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg transition-colors"
                                                    >
                                                        Manage Curriculum <ArrowRight className="w-3 h-3 ml-1.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            {searchQuery ? "No modules match your search." : "No modules found in the database."}
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
