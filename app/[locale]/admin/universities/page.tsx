"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Loader2, FileText, Globe, MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function AdminUniversitiesPage() {
    const [activeTab, setActiveTab] = useState<"Applications" | "Manage">("Applications");
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        logo_url: "",
        name: "",
        country: "",
        city: "",
        email: "",
        phone: "",
        website: "",
        description: "",
        tags: "" // comma separated or plain text
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        let finalLogoUrl = formData.logo_url;

        // 1. Upload image if a new file is selected
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `universities/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public-media')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error("Upload Error:", uploadError);
                toast.error(`Failed to upload logo: ${uploadError.message}`);
                setIsUploading(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('public-media')
                .getPublicUrl(filePath);

            finalLogoUrl = publicUrlData.publicUrl;
        }
        
        const payload = {
            logo_url: finalLogoUrl,
            name: formData.name,
            country: formData.country,
            city: formData.city,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            tags: formData.tags,
            description: formData.description,
            status: 'active'
        };

        if (editingId) {
            const { error } = await supabase.from("universities").update(payload).eq('id', editingId);
            setIsUploading(false);
            if (error) {
                toast.error(`Failed to update: ${error.message}`);
            } else {
                toast.success("University updated");
                closeModal();
                fetchUniversities();
            }
        } else {
            const { error } = await supabase.from("universities").insert(payload);
            setIsUploading(false);
            if (error) {
                toast.error(`Failed to add: ${error.message}`);
            } else {
                toast.success("University added");
                closeModal();
                fetchUniversities();
            }
        }
    };

    const handleEdit = (uni: any) => {
        setFormData({
            logo_url: uni.logo_url || "",
            name: uni.name || "",
            country: uni.country || "",
            city: uni.city || "",
            email: uni.email || "",
            phone: uni.phone || "",
            website: uni.website || "",
            description: uni.description || "",
            tags: uni.tags || ""
        });
        setImagePreview(uni.logo_url || null);
        setImageFile(null);
        setEditingId(uni.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this university?")) return;
        const { error } = await supabase.from("universities").delete().eq("id", id);
        if (error) {
            toast.error(`Delete failed: ${error.message}`);
        } else {
            toast.success("University deleted");
            fetchUniversities();
        }
    };

    const closeModal = () => {
        setIsAdding(false);
        setEditingId(null);
        setImageFile(null);
        setImagePreview(null);
        setFormData({ logo_url: "", name: "", country: "", city: "", email: "", phone: "", website: "", description: "", tags: "" });
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
                    <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-3">
                        Universities
                        {!loading && <span className="bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full font-medium">{universities.length} Total</span>}
                    </h1>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">University Logo</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Stanford University" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. United States" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Stanford" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="contact@stanford.edu" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="+1 234 567 890" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                    <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="https://stanford.edu" />
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
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg disabled:opacity-50 flex items-center">
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {isUploading ? "Uploading..." : "Save University"}
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
                                            <div className="flex items-center gap-3">
                                                {uni.logo_url && <img src={uni.logo_url} alt={uni.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 bg-white" />}
                                                <div>
                                                    <div className="font-medium text-[#0B2545]">{uni.name}</div>
                                                    {uni.website && (
                                                        <a href={uni.website} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                                                            <Globe className="h-3 w-3 mr-1" /> {uni.website}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
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
                                            <button onClick={() => handleEdit(uni)} className="text-[#D4AF37] hover:text-[#b5952f] font-medium text-xs">Edit</button>
                                            <span className="text-gray-300 mx-2">|</span>
                                            <button onClick={() => handleDelete(uni.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
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
