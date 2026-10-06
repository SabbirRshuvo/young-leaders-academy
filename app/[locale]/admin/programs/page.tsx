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
        image_url: "",
        category: "",
        title: "",
        description: "",
        duration: "",
        age_group: "",
        level: ""
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { error } = await supabase.from("programs").insert({
            image_url: formData.image_url,
            category: formData.category,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            age_group: formData.age_group,
            level: formData.level,
            is_published: true
        });

        if (error) {
            console.error("Insert Error:", error);
            toast.error(`Failed to add program: ${error.message || 'Unknown error'}`);
        } else {
            toast.success("Program added successfully");
            setIsAdding(false);
            fetchPrograms();
            // Reset form
            setFormData({ image_url: "", category: "", title: "", description: "", duration: "", age_group: "", level: "" });
        }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        // Programs are stored in the "programs" table
        const { data, error } = await supabase.from("programs").select("*").order("created_at", { ascending: false });
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
                    <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-3">
                        Programs & Courses
                        {!loading && <span className="bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full font-medium">{programs.length} Total</span>}
                    </h1>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                                <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="https://example.com/image.jpg" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Global Young Leaders Fellowship" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. HIGH SCHOOL LEADERSHIP" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" rows={3} placeholder="A transformative program..."></textarea>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. 4 Weeks" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                                    <input type="text" value={formData.age_group} onChange={e => setFormData({...formData, age_group: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. 14 - 18" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <input type="text" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Beginner" />
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
                                    <th className="px-6 py-4 font-semibold">Program</th>
                                    <th className="px-6 py-4 font-semibold">Description</th>
                                    <th className="px-6 py-4 font-semibold">Details</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {programs.map((prog) => {
                                    // Handle JSON title object if present, else fallback to string (for backwards compatibility)
                                    const title = typeof prog.title === 'string' ? prog.title : prog.title?.en || "Unknown";
                                    const desc = typeof prog.description === 'string' ? prog.description : prog.description?.en || "";
                                    
                                    return (
                                        <tr key={prog.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {prog.image_url && <img src={prog.image_url} alt={title} className="w-10 h-10 rounded object-cover border border-gray-100" />}
                                                    <div>
                                                        <div className="font-medium text-[#0B2545]">{title}</div>
                                                        <div className="text-xs text-[#D4AF37] mt-0.5">{prog.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                {desc}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-xs">
                                                <div>Duration: {prog.duration || 'N/A'}</div>
                                                <div>Ages: {prog.age_group || 'N/A'}</div>
                                                <div>Level: {prog.level || 'N/A'}</div>
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
