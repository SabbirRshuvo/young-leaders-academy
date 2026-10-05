"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Plus, Loader2, FileText, LayoutList } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function AdminProgramsPage() {
    const [activeTab, setActiveTab] = useState<"Applications" | "Manage">("Applications");
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        titleEn: "",
        titleAr: "",
        descEn: "",
        descAr: "",
        duration: "",
        format: "",
        ageGroup: ""
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const titleJson = { en: formData.titleEn, ar: formData.titleAr };
        // We can inject duration/format/ageGroup into the description JSON if there are no dedicated columns
        const descJson = { 
            en: formData.descEn, 
            ar: formData.descAr,
            metadata: {
                duration: formData.duration,
                format: formData.format,
                ageGroup: formData.ageGroup
            }
        };

        const { error } = await supabase.from("courses").insert({
            title: titleJson,
            description: descJson,
            is_published: true
        });

        if (error) {
            toast.error("Failed to add program");
        } else {
            toast.success("Program added successfully");
            setIsAdding(false);
            fetchPrograms();
            // Reset form
            setFormData({ titleEn: "", titleAr: "", descEn: "", descAr: "", duration: "", format: "", ageGroup: "" });
        }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        // Programs are stored in the "courses" table
        const { data, error } = await supabase.from("courses").select("*");
        if (error) {
            toast.error("Failed to load programs");
        } else {
            setPrograms(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === "Manage") {
            fetchPrograms();
        }
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545]">Programs & Courses</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage program applications and curriculum database</p>
                </div>
                {activeTab === "Manage" && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#b5952f] rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Program
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4">Add New Program</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                                    <input required type="text" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Global Young Leaders Fellowship" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic)</label>
                                    <input type="text" value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                                    <textarea required value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" rows={3} placeholder="A transformative program..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
                                    <textarea value={formData.descAr} onChange={e => setFormData({...formData, descAr: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" rows={3}></textarea>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. 2 Weeks" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                                    <input type="text" value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. 16 - 22" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                                    <input type="text" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. In-Person + Online" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg">Save Program</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                {["Applications", "Manage"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === tab
                                ? "bg-[#0B2545] text-white shadow-sm"
                                : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                        }`}
                    >
                        {tab === "Manage" ? "Curriculum Database" : "Student Applications"}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/50">
                    {activeTab === "Manage" ? <LayoutList className="h-5 w-5 text-[#0B2545] mr-2" /> : <FileText className="h-5 w-5 text-[#0B2545] mr-2" />}
                    <h2 className="text-lg font-bold text-[#0B2545]">
                        {activeTab === "Manage" ? "Programs Directory" : "Pending Applications"}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === "Applications" ? (
                        <div className="p-12 text-center text-gray-500">
                            No program applications pending at this time.
                        </div>
                    ) : loading ? (
                        <div className="p-12 flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Program Name</th>
                                    <th className="px-6 py-4 font-semibold">Description</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {programs.map((prog) => {
                                    // Handle JSON title object if present, else fallback to string
                                    const title = typeof prog.title === 'string' ? prog.title : prog.title?.en || "Unknown";
                                    const desc = typeof prog.description === 'string' ? prog.description : prog.description?.en || "";
                                    
                                    return (
                                        <tr key={prog.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#0B2545]">{title}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                                                {desc}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-[#0B2545] hover:underline font-medium text-xs">Manage Modules</button>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button className="text-[#D4AF37] hover:text-[#b5952f] font-medium text-xs">Edit</button>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {programs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No programs found in the database.
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
