"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Plus, Loader2, FileText, LayoutList } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function AdminProgramsPage() {
    const [activeTab, setActiveTab] = useState<"Applications" | "Manage">("Applications");
    const [programs, setPrograms] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const locale = useLocale();

    const [formData, setFormData] = useState({
        image_url: "",
        category: "",
        title: "",
        description: "",
        duration: "",
        age_group: "",
        level: "",
        price: ""
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        let finalImageUrl = formData.image_url;

        // 1. Upload image if a new file is selected
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `programs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public-media')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error("Upload Error:", uploadError);
                toast.error(`Failed to upload image: ${uploadError.message}`);
                setIsUploading(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('public-media')
                .getPublicUrl(filePath);

            finalImageUrl = publicUrlData.publicUrl;
        }

        // 2. Insert or Update DB
        let error;
        if (editingId) {
            const { error: updateError } = await supabase.from("programs").update({
                image_url: finalImageUrl,
                category: formData.category,
                title: formData.title,
                description: formData.description,
                duration: formData.duration,
                age_group: formData.age_group,
                level: formData.level,
                price: formData.price ? parseFloat(formData.price as string) : 0
            }).eq("id", editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from("programs").insert({
                image_url: finalImageUrl,
                category: formData.category,
                title: formData.title,
                description: formData.description,
                duration: formData.duration,
                age_group: formData.age_group,
                level: formData.level,
                price: formData.price ? parseFloat(formData.price as string) : 0,
                is_published: true
            });
            error = insertError;
        }

        setIsUploading(false);

        if (error) {
            console.error("Save Error:", error);
            toast.error(`Failed to save program: ${error.message || 'Unknown error'}`);
        } else {
            toast.success(editingId ? "Program updated successfully" : "Program added successfully");
            setIsAdding(false);
            setEditingId(null);
            setImageFile(null);
            setImagePreview(null);
            fetchPrograms();
            // Reset form
            setFormData({ image_url: "", category: "", title: "", description: "", duration: "", age_group: "", level: "", price: "" });
        }
    };

    const handleEdit = (prog: any) => {
        setFormData({
            image_url: prog.image_url || "",
            category: prog.category || "",
            title: prog.title || "",
            description: prog.description || "",
            duration: prog.duration || "",
            age_group: prog.age_group || "",
            level: prog.level || "",
            price: prog.price || ""
        });
        setImagePreview(prog.image_url || null);
        setImageFile(null);
        setEditingId(prog.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this program?")) return;

        const { error } = await supabase.from("programs").delete().eq("id", id);
        if (error) {
            console.error("Delete Error:", error);
            toast.error(`Failed to delete program: ${error.message || 'Unknown error'}`);
        } else {
            toast.success("Program deleted successfully");
            fetchPrograms();
        }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("programs").select("*").order("created_at", { ascending: false });
        if (error) {
            toast.error("Failed to load programs");
        } else {
            setPrograms(data || []);
        }
        setLoading(false);
    };

    const fetchApplications = async () => {
        setLoading(true);
        // Attempt to fetch applications, optionally joining profiles if they exist
        const { data, error } = await supabase
            .from("program_applications")
            .select("*, program:programs(title), profile:profiles(full_name, email)")
            .order("created_at", { ascending: false });

        if (error) {
            // Fallback if profiles relationship fails
            const { data: fallbackData } = await supabase
                .from("program_applications")
                .select("*, program:programs(title)")
                .order("created_at", { ascending: false });
            setApplications(fallbackData || []);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    };

    const handleUpdateApplicationStatus = async (id: string, status: string) => {
        const { error } = await supabase.from("program_applications").update({ status }).eq("id", id);
        if (error) {
            toast.error(`Failed to update status: ${error.message}`);
        } else {
            toast.success("Status updated");
            fetchApplications();
        }
    };

    useEffect(() => {
        if (activeTab === "Manage") {
            fetchPrograms();
        } else {
            fetchApplications();
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
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4">{editingId ? "Edit Program" : "Add New Program"}</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded object-cover border border-gray-200" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Global Young Leaders Fellowship" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. HIGH SCHOOL LEADERSHIP" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" rows={3} placeholder="A transformative program..."></textarea>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. 4 Weeks" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                                    <input type="text" value={formData.age_group} onChange={e => setFormData({ ...formData, age_group: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. 14 - 18" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <input type="text" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Beginner" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); setImageFile(null); setImagePreview(null); setFormData({ image_url: "", category: "", title: "", description: "", duration: "", age_group: "", level: "", price: "" }); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg disabled:opacity-50 flex items-center">
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {isUploading ? "Uploading..." : "Save Program"}
                                </button>
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
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
                        applications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No program applications pending at this time.
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Student</th>
                                        <th className="px-6 py-4 font-semibold">Program</th>
                                        <th className="px-6 py-4 font-semibold">Date Applied</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#0B2545]">{app.profile?.full_name || 'Unknown Student'}</div>
                                                <div className="text-xs text-gray-500">{app.profile?.email || app.student_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{app.program?.title || 'Unknown Program'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')} className="text-green-600 hover:text-green-800 font-medium text-xs">Approve</button>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')} className="text-red-500 hover:text-red-700 font-medium text-xs">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
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
                                                <div className="font-bold text-[#0B2545] mt-1">${prog.price || '0.00'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/${locale}/admin/modules?programId=${prog.id}`} className="text-[#0B2545] hover:underline font-medium text-xs">Manage Modules</Link>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button onClick={() => handleEdit(prog)} className="text-[#D4AF37] hover:text-[#b5952f] font-medium text-xs">Edit</button>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button onClick={() => handleDelete(prog.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
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
