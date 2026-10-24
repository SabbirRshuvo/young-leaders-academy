"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronDown, ChevronRight, Video, FileText, Trash2, Edit2, Loader2, Award, Type, HelpCircle, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function GlobalModulesManagerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const programIdParam = searchParams.get("programId");

    const [allPrograms, setAllPrograms] = useState<any[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState<string>(programIdParam || "");
    const [selectedProgram, setSelectedProgram] = useState<any>(null);
    
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    // Modals state
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    
    // Upload state
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Module Forms state
    const [moduleData, setModuleData] = useState({ 
        title: "", 
        description: "",
        video_url: "",
        pdf_url: "",
        quiz_url: "",
        order_index: 0 
    });
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

    // Content Forms state
    const [contentData, setContentData] = useState({
        title: "",
        content_type: "video",
        video_url: "",
        pdf_url: "",
        body_text: "",
        quiz_data: "",
        order_index: 0
    });
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);

    // Certificate
    const [certificateUrl, setCertificateUrl] = useState("");
    const [isSavingCert, setIsSavingCert] = useState(false);

    useEffect(() => {
        fetchAllPrograms();
    }, []);

    useEffect(() => {
        if (selectedProgramId) {
            fetchModulesForProgram(selectedProgramId);
            // Update URL without reloading to keep state sync
            const url = new URL(window.location.href);
            url.searchParams.set("programId", selectedProgramId);
            window.history.pushState({}, "", url);
        } else {
            setModules([]);
            setSelectedProgram(null);
            setLoading(false);
        }
    }, [selectedProgramId]);

    const fetchAllPrograms = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("programs").select("id, title").order("created_at", { ascending: false });
        if (!error && data) {
            setAllPrograms(data);
            if (!selectedProgramId && data.length > 0) {
                setSelectedProgramId(data[0].id);
            }
        }
        setLoading(false);
    };

    const fetchModulesForProgram = async (pId: string) => {
        setLoading(true);
        // Fetch Program details
        const { data: progData } = await supabase.from("programs").select("*").eq("id", pId).single();
        setSelectedProgram(progData);
        setCertificateUrl(progData?.certificate_url || ""); 

        // Fetch Modules
        const { data: rawModules, error: modError } = await supabase
            .from("modules")
            .select("*")
            .eq("program_id", pId)
            .order("order_index", { ascending: true });

        if (modError) {
            console.error("Supabase Modules Fetch Error:", modError);
            // If the error is about a missing column (like order_index before migration), fail gracefully instead of breaking the UI.
            if (modError.message.includes("does not exist") || modError.code === "PGRST200") {
                setModules([]);
            } else {
                toast.error(`Failed to load modules: ${modError.message}`);
            }
            setLoading(false);
            return;
        }

        // If no modules exist for this program, stop here cleanly
        if (!rawModules || rawModules.length === 0) {
            setModules([]);
            setLoading(false);
            return;
        }

        // Fetch Module Contents if we have modules
        let rawContents: any[] = [];
        if (rawModules && rawModules.length > 0) {
            const moduleIds = rawModules.map(m => m.id);
            const { data: contentsData, error: contentsError } = await supabase
                .from("module_contents")
                .select("*")
                .in("module_id", moduleIds)
                .order("order_index", { ascending: true });

            if (contentsError) {
                console.error("Supabase Contents Fetch Error:", contentsError);
            } else {
                rawContents = contentsData || [];
            }
        }

        // Map contents into their respective modules
        const assembledModules = (rawModules || []).map(m => {
            const mContents = rawContents.filter(c => c.module_id === m.id);
            return {
                ...m,
                module_contents: mContents
            };
        });

        setModules(assembledModules);
        setLoading(false);
    };

    // ================= MODULES ================= //
    const openAddModule = () => {
        setModuleData({
            title: "",
            description: "",
            video_url: "",
            pdf_url: "",
            quiz_url: "",
            order_index: modules.length
        });
        setVideoFile(null);
        setPdfFile(null);
        setIsUploading(false);
        setEditingModuleId(null);
        setIsModuleModalOpen(true);
    };

    const openEditModule = (mod: any) => {
        setModuleData({
            title: mod.title,
            description: mod.description || "",
            video_url: mod.video_url || "",
            pdf_url: mod.pdf_url || "",
            quiz_url: mod.quiz_url || "",
            order_index: mod.order_index || 0
        });
        setVideoFile(null);
        setPdfFile(null);
        setIsUploading(false);
        setEditingModuleId(mod.id);
        setIsModuleModalOpen(true);
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgramId) return toast.error("Select a program first");

        setIsUploading(true);
        let finalVideoUrl = moduleData.video_url;
        let finalPdfUrl = moduleData.pdf_url;

        try {
            if (videoFile) {
                const fileExt = videoFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('module-assets').upload(`videos/${fileName}`, videoFile);
                if (uploadError) throw new Error(`Video upload failed: ${uploadError.message}`);
                
                const { data: { publicUrl } } = supabase.storage.from('module-assets').getPublicUrl(`videos/${fileName}`);
                finalVideoUrl = publicUrl;
            }

            if (pdfFile) {
                const fileExt = pdfFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('module-assets').upload(`pdfs/${fileName}`, pdfFile);
                if (uploadError) throw new Error(`PDF upload failed: ${uploadError.message}`);
                
                const { data: { publicUrl } } = supabase.storage.from('module-assets').getPublicUrl(`pdfs/${fileName}`);
                finalPdfUrl = publicUrl;
            }
        } catch (error: any) {
            setIsUploading(false);
            return toast.error(error.message);
        }

        const payload = {
            title: moduleData.title,
            description: moduleData.description,
            video_url: finalVideoUrl,
            pdf_url: finalPdfUrl,
            quiz_url: moduleData.quiz_url,
            order_index: moduleData.order_index,
            serial_number: moduleData.order_index
        };

        if (editingModuleId) {
            const { error } = await supabase.from("modules").update(payload).eq("id", editingModuleId);
            if (error) {
                setIsUploading(false);
                return toast.error(`Failed: ${error.message}`);
            }
            toast.success("Module updated");
        } else {
            const { error } = await supabase.from("modules").insert({
                ...payload,
                program_id: selectedProgramId
            });
            if (error) {
                setIsUploading(false);
                return toast.error(`Failed: ${error.message}`);
            }
            toast.success("Module created");
        }
        
        setIsUploading(false);
        setIsModuleModalOpen(false);
        fetchModulesForProgram(selectedProgramId);
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Are you sure? This deletes the module and all its contents.")) return;
        const { error } = await supabase.from("modules").delete().eq("id", id);
        if (error) return toast.error(`Failed: ${error.message}`);
        toast.success("Module deleted");
        fetchModulesForProgram(selectedProgramId);
    };

    // ================= CONTENTS ================= //
    const openAddContent = (moduleId: string, type: string) => {
        const targetModule = modules.find(m => m.id === moduleId);
        setActiveModuleId(moduleId);
        setContentData({ 
            title: "", 
            content_type: type, 
            video_url: "",
            pdf_url: "",
            body_text: "",
            quiz_data: "",
            order_index: targetModule?.module_contents?.length || 0 
        });
        setEditingContentId(null);
        setIsContentModalOpen(true);
    };

    const openEditContent = (moduleId: string, content: any) => {
        setActiveModuleId(moduleId);
        setEditingContentId(content.id);
        setContentData({ 
            title: content.title, 
            content_type: content.content_type, 
            video_url: content.video_url || "",
            pdf_url: content.pdf_url || "",
            body_text: content.body_text || "",
            quiz_data: content.quiz_data ? JSON.stringify(content.quiz_data, null, 2) : "",
            order_index: content.order_index || 0
        });
        setIsContentModalOpen(true);
    };

    const handleSaveContent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let parsedQuizData = null;
        if (contentData.content_type === 'quiz') {
            try {
                parsedQuizData = contentData.quiz_data ? JSON.parse(contentData.quiz_data) : [];
            } catch (e) {
                return toast.error("Invalid Quiz JSON format. Please check your data.");
            }
        }

        const payload = {
            title: contentData.title,
            content_type: contentData.content_type,
            video_url: contentData.content_type === 'video' ? contentData.video_url : null,
            pdf_url: contentData.content_type === 'pdf' ? contentData.pdf_url : null,
            body_text: contentData.content_type === 'text' ? contentData.body_text : null,
            quiz_data: contentData.content_type === 'quiz' ? parsedQuizData : null,
            order_index: contentData.order_index
        };

        if (editingContentId) {
            const { error } = await supabase.from("module_contents").update(payload).eq("id", editingContentId);
            if (error) return toast.error(`Failed: ${error.message}`);
            toast.success("Content updated");
        } else {
            const { error } = await supabase.from("module_contents").insert({
                ...payload,
                module_id: activeModuleId,
            });
            if (error) return toast.error(`Failed: ${error.message}`);
            toast.success("Content created");
        }
        
        setIsContentModalOpen(false);
        fetchModulesForProgram(selectedProgramId);
    };

    const handleDeleteContent = async (id: string) => {
        if (!confirm("Delete this content?")) return;
        const { error } = await supabase.from("module_contents").delete().eq("id", id);
        if (error) return toast.error(`Failed: ${error.message}`);
        toast.success("Content deleted");
        fetchModulesForProgram(selectedProgramId);
    };

    // ================= CERTIFICATE ================= //
    const handleSaveCertificate = async () => {
        if (!selectedProgramId) return;
        setIsSavingCert(true);
        const { error } = await supabase.from("programs").update({ certificate_url: certificateUrl }).eq("id", selectedProgramId);
        setIsSavingCert(false);
        if (error) {
            console.error(error);
            toast.error("Failed to save certificate template!");
        } else {
            toast.success("Certificate saved");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header & Program Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-[#D4AF37]" />
                        Modules Manager
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Select a program to manage its curriculum structure.</p>
                </div>
                
                <div className="w-full sm:w-72">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Program</label>
                    <select 
                        value={selectedProgramId} 
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-gray-50 outline-none"
                    >
                        <option value="" disabled>-- Select a Program --</option>
                        {allPrograms.map(p => (
                            <option key={p.id} value={p.id}>
                                {typeof p.title === 'string' ? p.title : p.title?.en || "Unknown"}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
            ) : !selectedProgramId ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                    Please select a program from the dropdown above to manage its modules.
                </div>
            ) : (
                <>
                    {/* Program Overview Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-[#0B2545]">{selectedProgram?.title}</h2>
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                                    {modules.length} Modules
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                {selectedProgram?.description || "No description provided for this program."}
                            </p>
                            
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => router.push(`/${searchParams.get("locale") || "en"}/admin/programs?edit=${selectedProgramId}`)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Program
                                </button>
                                <button 
                                    onClick={openAddModule}
                                    className="px-5 py-2 text-sm font-bold text-white bg-[#D4AF37] hover:bg-[#b5952f] rounded-lg flex items-center transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Module
                                </button>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-auto shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="h-5 w-5 text-[#D4AF37]" />
                                <h3 className="text-sm font-bold text-[#0B2545]">Certificate Link</h3>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    value={certificateUrl} 
                                    onChange={e => setCertificateUrl(e.target.value)}
                                    placeholder="https://.../cert.pdf"
                                    className="w-full md:w-48 px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                />
                                <button 
                                    onClick={handleSaveCertificate}
                                    disabled={isSavingCert}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-md disabled:opacity-50"
                                >
                                    {isSavingCert ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>



                    {/* Modules List */}
                    <div className="space-y-4">
                        {modules.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                                No modules created yet. Click "Add Module" to start building the curriculum.
                            </div>
                        ) : (
                            modules.map((module) => (
                                <div key={module.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    {/* Module Header */}
                                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                        <button 
                                            className="flex items-center gap-2 flex-1 text-left"
                                            onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                        >
                                            {expandedModule === module.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                            <h3 className="font-bold text-[#0B2545] text-sm sm:text-base">{module.title}</h3>
                                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full ml-2 shrink-0">
                                                {module.module_contents?.length || 0} Items
                                            </span>
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pl-7 xl:pl-0">
                                            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm shrink-0">
                                                <button onClick={() => openAddContent(module.id, 'video')} className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center border-r border-gray-200" title="Add Video">
                                                    <Video className="w-3.5 h-3.5 mr-1" /> Video
                                                </button>
                                                <button onClick={() => openAddContent(module.id, 'pdf')} className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center border-r border-gray-200" title="Add PDF">
                                                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                                                </button>
                                                <button onClick={() => openAddContent(module.id, 'text')} className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center border-r border-gray-200" title="Add Text">
                                                    <Type className="w-3.5 h-3.5 mr-1" /> Text
                                                </button>
                                                <button onClick={() => openAddContent(module.id, 'quiz')} className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center" title="Add Quiz">
                                                    <HelpCircle className="w-3.5 h-3.5 mr-1" /> Quiz
                                                </button>
                                            </div>
                                            <span className="text-gray-300 mx-1 hidden sm:block">|</span>
                                            <button onClick={() => openEditModule(module)} className="text-gray-500 hover:text-gray-700 p-1">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteModule(module.id)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contents List */}
                                    {expandedModule === module.id && (
                                        <div className="p-0 bg-white">
                                            {module.module_contents?.length === 0 ? (
                                                <div className="p-6 text-sm text-gray-500 text-center bg-gray-50/30">No contents in this module. Use the buttons above to add media.</div>
                                            ) : (
                                                <ul className="divide-y divide-gray-100">
                                                    {module.module_contents.map((content: any) => (
                                                        <li key={content.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors pl-4 sm:pl-10">
                                                            <div className="flex items-start gap-3">
                                                                {content.content_type === 'video' && <Video className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />}
                                                                {content.content_type === 'pdf' && <FileText className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                                                                {content.content_type === 'text' && <Type className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />}
                                                                {content.content_type === 'quiz' && <HelpCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />}
                                                                
                                                                <div>
                                                                    <div className="font-medium text-[#0B2545] text-sm">
                                                                        <span className="text-gray-400 text-[10px] mr-2 border border-gray-200 rounded px-1.5 py-0.5">Order: {content.order_index}</span>
                                                                        {content.title}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1 max-w-[200px] sm:max-w-md truncate">
                                                                        {content.content_type === 'video' && (content.video_url || 'No video URL')}
                                                                        {content.content_type === 'pdf' && (content.pdf_url || 'No PDF URL')}
                                                                        {content.content_type === 'text' && (content.body_text ? 'Rich text content attached' : 'No text content')}
                                                                        {content.content_type === 'quiz' && (content.quiz_data ? 'Quiz data attached' : 'No quiz data')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 ml-2">
                                                                <button 
                                                                    onClick={() => openEditContent(module.id, content)}
                                                                    className="text-gray-400 hover:text-[#0B2545]"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteContent(content.id)} className="text-red-400 hover:text-red-600">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Module Modal */}
            {isModuleModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4">{editingModuleId ? "Edit Module" : "New Module"}</h2>
                        <form onSubmit={handleSaveModule} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 pb-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                                <input required type="text" value={moduleData.title} onChange={e => setModuleData({...moduleData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Introduction to Leadership" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea value={moduleData.description} onChange={e => setModuleData({...moduleData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm" rows={3} placeholder="Brief overview of the module..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Video className="w-4 h-4" /> Video (Upload or URL)</label>
                                <div className="border border-dashed border-gray-300 p-3 rounded-lg bg-gray-50 mb-2">
                                    <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0B2545] file:text-white hover:file:bg-[#0B2545]/90 cursor-pointer" />
                                </div>
                                {!videoFile && (
                                    <input type="url" value={moduleData.video_url} onChange={e => setModuleData({...moduleData, video_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm" placeholder="Or enter external URL (https://youtube.com/...)" />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FileText className="w-4 h-4" /> PDF Resource (Upload or URL)</label>
                                <div className="border border-dashed border-gray-300 p-3 rounded-lg bg-gray-50 mb-2">
                                    <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0B2545] file:text-white hover:file:bg-[#0B2545]/90 cursor-pointer" />
                                </div>
                                {!pdfFile && (
                                    <input type="url" value={moduleData.pdf_url} onChange={e => setModuleData({...moduleData, pdf_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm" placeholder="Or enter external PDF URL (https://...)" />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quiz Link / URL (Optional)</label>
                                <input type="url" value={moduleData.quiz_url} onChange={e => setModuleData({...moduleData, quiz_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="https://..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                <input required type="number" value={moduleData.order_index} onChange={e => setModuleData({...moduleData, order_index: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModuleModalOpen(false)} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-5 py-2 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg disabled:opacity-50 flex items-center">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {isUploading ? "Uploading..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Modal */}
            {isContentModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4 capitalize">
                            {editingContentId ? "Edit Content" : `Add ${contentData.content_type}`}
                        </h2>
                        <form onSubmit={handleSaveContent} className="space-y-4">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input required type="text" value={contentData.title} onChange={e => setContentData({...contentData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="Content Title..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                    <input required type="number" value={contentData.order_index} onChange={e => setContentData({...contentData, order_index: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                                <select 
                                    value={contentData.content_type} 
                                    onChange={e => setContentData({...contentData, content_type: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-gray-50"
                                >
                                    <option value="video">Video</option>
                                    <option value="pdf">PDF Document</option>
                                    <option value="text">Rich Text / Article</option>
                                    <option value="quiz">Quiz</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {contentData.content_type === 'video' ? 'Video URL' :
                                     contentData.content_type === 'pdf' ? 'PDF URL' :
                                     contentData.content_type === 'text' ? 'Rich Text Content' :
                                     'Quiz JSON Data'}
                                </label>
                                
                                {contentData.content_type === 'video' && (
                                    <input 
                                        required 
                                        type="url" 
                                        value={contentData.video_url} 
                                        onChange={e => setContentData({...contentData, video_url: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" 
                                        placeholder="https://youtube.com/..." 
                                    />
                                )}

                                {contentData.content_type === 'pdf' && (
                                    <input 
                                        required 
                                        type="url" 
                                        value={contentData.pdf_url} 
                                        onChange={e => setContentData({...contentData, pdf_url: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" 
                                        placeholder="https://.../document.pdf" 
                                    />
                                )}

                                {contentData.content_type === 'text' && (
                                    <textarea 
                                        required 
                                        value={contentData.body_text} 
                                        onChange={e => setContentData({...contentData, body_text: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm" 
                                        rows={6} 
                                        placeholder="Enter your rich text markdown or content here..."
                                    ></textarea>
                                )}

                                {contentData.content_type === 'quiz' && (
                                    <textarea 
                                        required 
                                        value={contentData.quiz_data} 
                                        onChange={e => setContentData({...contentData, quiz_data: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] font-mono text-sm" 
                                        rows={6} 
                                        placeholder='[{"question": "What is 2+2?", "options": ["3", "4"], "correctAnswerIndex": 1}]'
                                    ></textarea>
                                )}
                                
                                <p className="text-xs text-gray-500 mt-1">
                                    {contentData.content_type === 'video' && 'Provide a valid YouTube, Vimeo, or MP4 URL.'}
                                    {contentData.content_type === 'pdf' && 'Provide a valid URL to a PDF document.'}
                                    {contentData.content_type === 'quiz' && 'Provide a valid JSON array of questions.'}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg">Save Content</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
