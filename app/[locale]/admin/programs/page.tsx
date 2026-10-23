"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Plus, Loader2, FileText, LayoutList } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function AdminProgramsPage() {
    const t = useTranslations("Admin");
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
        price: "",
        certificate_url: ""
    });

    const getStatusLabel = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s === "active") return t("active");
        if (s === "draft") return t("draft");
        if (s === "paid") return t("paid");
        if (s === "unpaid") return t("unpaid");
        if (s === "pending") return t("pending");
        if (s === "accepted") return t("accepted");
        if (s === "rejected") return t("rejected");
        return status;
    };

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
                toast.error(`${t("toastUploadImageError")}: ${uploadError.message}`);
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
                price: formData.price ? parseFloat(formData.price as string) : 0,
                certificate_url: formData.certificate_url
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
                certificate_url: formData.certificate_url,
                is_published: true
            });
            error = insertError;
        }

        setIsUploading(false);

        if (error) {
            console.error("Save Error:", error);
            toast.error(`${t("toastSaveProgramError")}: ${error.message || t("unknown")}`);
        } else {
            toast.success(editingId ? t("toastProgramUpdated") : t("toastProgramAdded"));
            setIsAdding(false);
            setEditingId(null);
            setImageFile(null);
            setImagePreview(null);
            fetchPrograms();
            // Reset form
            setFormData({ image_url: "", category: "", title: "", description: "", duration: "", age_group: "", level: "", price: "", certificate_url: "" });
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
            price: prog.price || "",
            certificate_url: prog.certificate_url || ""
        });
        setImagePreview(prog.image_url || null);
        setImageFile(null);
        setEditingId(prog.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("confirmDeleteProgram"))) return;

        const { error } = await supabase.from("programs").delete().eq("id", id);
        if (error) {
            console.error("Delete Error:", error);
            toast.error(`${t("toastDeleteProgramError")}: ${error.message || t("unknown")}`);
        } else {
            toast.success(t("toastProgramDeleted"));
            fetchPrograms();
        }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("programs").select("*").order("created_at", { ascending: false });
        if (error) {
            toast.error(t("toastLoadProgramsError"));
        } else {
            setPrograms(data || []);
        }
        setLoading(false);
    };

    const fetchApplications = async () => {
        setLoading(true);
        // Fetch applications without profiles join
        const { data: appsData, error } = await supabase
            .from("program_applications")
            .select("*, program:programs(title)")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error(t("toastLoadApplicationsError"));
            setApplications([]);
            setLoading(false);
            return;
        }

        const apps = appsData || [];
        
        // Extract unique student IDs
        const studentIds = Array.from(new Set(apps.map(a => a.student_id).filter(Boolean)));
        
        // Fetch profiles for these students manually
        let profilesMap: Record<string, any> = {};
        if (studentIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, email")
                .in("id", studentIds);
                
            if (profiles) {
                profilesMap = profiles.reduce((acc, curr) => {
                    acc[curr.id] = curr;
                    return acc;
                }, {} as Record<string, any>);
            }
        }

        // Map applications to include profile data
        const enrichedApps = apps.map(app => ({
            ...app,
            profile: app.student_id ? profilesMap[app.student_id] : null
        }));

        setApplications(enrichedApps);
        setLoading(false);
    };

    const handleUpdateApplicationStatus = async (id: string, status: string) => {
        const { error } = await supabase.from("program_applications").update({ status }).eq("id", id);
        if (error) {
            toast.error(`${t("toastUpdateStatusError")}: ${error.message}`);
        } else {
            toast.success(t("toastStatusUpdated"));
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
                        {t("programsTitle")}
                        {!loading && <span className="bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full font-medium">{t("totalBadge", { count: programs.length })}</span>}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{t("programsDesc")}</p>
                </div>
                {activeTab === "Manage" && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#b5952f] rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" /> {t("addProgram")}
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4">{editingId ? t("editProgram") : t("addNewProgram")}</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("coverImage")}</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("title")}</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder={t("titlePlaceholder")} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("category")}</label>
                                    <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder={t("categoryPlaceholder")} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")}</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" rows={3} placeholder={t("programDescPlaceholder")}></textarea>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("duration")}</label>
                                    <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder={t("durationPlaceholder")} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("ageGroup")}</label>
                                    <input type="text" value={formData.age_group} onChange={e => setFormData({ ...formData, age_group: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder={t("ageGroupPlaceholder")} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("level")}</label>
                                    <input type="text" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder={t("levelPlaceholder")} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("price")}</label>
                                    <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="0.00" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("certificateTemplateUrl")}</label>
                                <input type="url" value={formData.certificate_url} onChange={e => setFormData({ ...formData, certificate_url: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="https://example.com/certificate.pdf" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); setImageFile(null); setImagePreview(null); setFormData({ image_url: "", category: "", title: "", description: "", duration: "", age_group: "", level: "", price: "", certificate_url: "" }); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">{t("cancel")}</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg disabled:opacity-50 flex items-center">
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {isUploading ? t("uploading") : t("saveProgram")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                {(["Applications", "Manage"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
                            ? "bg-[#0B2545] text-white shadow-sm"
                            : "text-gray-600 hover:text-[#0B2545] hover:bg-gray-100"
                            }`}
                    >
                        {tab === "Manage" ? t("curriculumDatabase") : t("tabStudentApplications")}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/50">
                    {activeTab === "Manage" ? <LayoutList className="h-5 w-5 text-[#0B2545] mr-2" /> : <FileText className="h-5 w-5 text-[#0B2545] mr-2" />}
                    <h2 className="text-lg font-bold text-[#0B2545]">
                        {activeTab === "Manage" ? t("programsDirectory") : t("pendingApplications")}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === "Applications" ? (
                        applications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                {t("noPendingProgramApplications")}
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">{t("colStudent")}</th>
                                        <th className="px-6 py-4 font-semibold">{t("colProgram")}</th>
                                        <th className="px-6 py-4 font-semibold">{t("colDateApplied")}</th>
                                        <th className="px-6 py-4 font-semibold">{t("colStatus")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[#0B2545]">{app.profile?.full_name || t("unknownStudent")}</div>
                                                <div className="text-xs text-gray-500">{app.profile?.email || app.student_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{app.program?.title || t("unknownProgram")}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {getStatusLabel(app.status)}
                                                </span>
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
                                    <th className="px-6 py-4 font-semibold">{t("colProgram")}</th>
                                    <th className="px-6 py-4 font-semibold">{t("colDescription")}</th>
                                    <th className="px-6 py-4 font-semibold">{t("colDetails")}</th>
                                    <th className="px-6 py-4 font-semibold text-right">{t("colActions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {programs.map((prog) => {
                                    // Handle JSON title object if present, else fallback to string (for backwards compatibility)
                                    const title = typeof prog.title === 'string' ? prog.title : (locale === 'ar' ? (prog.title?.ar || prog.title?.en) : (prog.title?.en || t("unknown")));
                                    const desc = typeof prog.description === 'string' ? prog.description : (locale === 'ar' ? (prog.description?.ar || prog.description?.en) : (prog.description?.en || ""));

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
                                                <div>{t("durationLabel")} {prog.duration || t("na")}</div>
                                                <div>{t("agesLabel")} {prog.age_group || t("na")}</div>
                                                <div>{t("levelLabel")} {prog.level || t("na")}</div>
                                                <div className="font-bold text-[#0B2545] mt-1">${prog.price || '0.00'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/${locale}/admin/modules?programId=${prog.id}`} className="text-[#0B2545] hover:underline font-medium text-xs">{t("manageModules")}</Link>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button onClick={() => handleEdit(prog)} className="text-[#D4AF37] hover:text-[#b5952f] font-medium text-xs">{t("edit")}</button>
                                                <span className="text-gray-300 mx-2">|</span>
                                                <button onClick={() => handleDelete(prog.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">{t("delete")}</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {programs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            {t("noPrograms")}
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
