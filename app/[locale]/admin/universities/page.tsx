"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Loader2, FileText, Globe, MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function AdminUniversitiesPage() {
    const [activeTab, setActiveTab] = useState<"Applications" | "Manage">("Applications");
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        country: "",
        description: "",
        tags: "" // comma separated
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // We can inject tags into the description JSON or handle it as plain text if it's a string column.
        // The schema for universities has description as TEXT. We can store it as JSON string or just text.
        // Let's store description as text, but append tags if needed, or better, make description a JSON string.
        const descObj = {
            text: formData.description,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        const { error } = await supabase.from("universities").insert({
            name: formData.name,
            country: formData.country,
            description: JSON.stringify(descObj),
            status: 'active'
        });

        if (error) {
            toast.error("Failed to add university");
        } else {
            toast.success("University added successfully");
            setIsAdding(false);
            fetchUniversities();
            setFormData({ name: "", country: "", description: "", tags: "" });
        }
    };

    const fetchUniversities = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("universities").select("*").order("created_at", { ascending: false });
        if (error) {
            toast.error("Failed to load universities");
        } else {
            setUniversities(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === "Manage") {
            fetchUniversities();
        }
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545]">Universities</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage university applications and database</p>
                </div>
                {activeTab === "Manage" && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#b5952f] rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add University
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4">Add New University</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Stanford University" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. United States" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                                <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Innovation, Entrepreneurship, Leadership" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" rows={4} placeholder="University description..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg">Save University</button>
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
                        {tab === "Manage" ? "Database Records" : "Student Applications"}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/50">
                    {activeTab === "Manage" ? <Building2 className="h-5 w-5 text-[#0B2545] mr-2" /> : <FileText className="h-5 w-5 text-[#0B2545] mr-2" />}
                    <h2 className="text-lg font-bold text-[#0B2545]">
                        {activeTab === "Manage" ? "University Directory" : "Pending Applications"}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === "Applications" ? (
                        <div className="p-12 text-center text-gray-500">
                            No university applications pending at this time.
                        </div>
                    ) : loading ? (
                        <div className="p-12 flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">University Name</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {universities.map((uni) => (
                                    <tr key={uni.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[#0B2545]">{uni.name}</div>
                                            {uni.website && (
                                                <a href={uni.website} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                                                    <Globe className="h-3 w-3 mr-1" /> {uni.website}
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                                {uni.city ? `${uni.city}, ` : ''}{uni.country || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {uni.email && <div className="flex items-center text-xs"><Mail className="h-3 w-3 mr-1" />{uni.email}</div>}
                                            {uni.phone && <div className="flex items-center text-xs mt-1"><Phone className="h-3 w-3 mr-1" />{uni.phone}</div>}
                                            {!uni.email && !uni.phone && "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                uni.status === 'active' 
                                                ? "bg-green-50 text-green-700 border-green-200" 
                                                : "bg-gray-50 text-gray-700 border-gray-200"
                                            }`}>
                                                {uni.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[#D4AF37] hover:text-[#b5952f] font-medium text-xs">Edit</button>
                                            <span className="text-gray-300 mx-2">|</span>
                                            <button className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {universities.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No universities in the database.
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
