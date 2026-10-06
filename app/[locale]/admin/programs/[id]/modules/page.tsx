"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, ArrowLeft, ChevronDown, ChevronRight, Video, FileText, Trash2, Edit2, Loader2, Award, Type, HelpCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function ManageModulesPage() {
    const params = useParams();
    const router = useRouter();
    const programId = params.id as string;
    const locale = params.locale as string;

    const [program, setProgram] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    // Modals state
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    
    // Module Forms state
    const [moduleData, setModuleData] = useState({ title: "", order_index: 0 });
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

    // Content Forms state
    const [contentData, setContentData] = useState({
        title: "",
        content_type: "video",
        content_url_or_text: "",
        order_index: 0
    });
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);

    // Certificate
    const [certificateUrl, setCertificateUrl] = useState("");
    const [isSavingCert, setIsSavingCert] = useState(false);

    useEffect(() => {
        fetchProgramAndModules();
    }, [programId]);

    const fetchProgramAndModules = async () => {
        setLoading(true);
        // Fetch Program
        const { data: progData, error: progError } = await supabase
            .from("programs")
            .select("*")
            .eq("id", programId)
            .single();

        if (progError) {
            toast.error("Failed to load program");
            setLoading(false);
            return;
        }
        setProgram(progData);
        setCertificateUrl(progData.certificate_url || ""); 

        // Fetch Modules and Contents
        const { data: modData, error: modError } = await supabase
            .from("modules")
            .select(`
                *,
                module_contents (*)
            `)
            .eq("program_id", programId)
            .order("order_index", { ascending: true });

        if (modError) {
            console.error("Fetch Modules Error:", modError);
            toast.error("Failed to load modules");
        } else {
            // Sort contents within modules
            const sortedModules = modData?.map(m => ({
                ...m,
                module_contents: (m.module_contents || []).sort((a: any, b: any) => a.order_index - b.order_index)
            })) || [];
            setModules(sortedModules);
        }
        setLoading(false);
    };

    // ================= MODULES ================= //
    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingModuleId) {
            const { error } = await supabase.from("modules").update({ 
                title: moduleData.title,
                order_index: moduleData.order_index 
            }).eq("id", editingModuleId);
            if (error) return toast.error(`Failed: ${error.message}`);
            toast.success("Module updated");
        } else {
            const { error } = await supabase.from("modules").insert({
                program_id: programId,
                title: moduleData.title,
                order_index: moduleData.order_index
            });
            if (error) return toast.error(`Failed: ${error.message}`);
            toast.success("Module created");
        }
        
        setIsModuleModalOpen(false);
        setModuleData({ title: "", order_index: 0 });
        setEditingModuleId(null);
        fetchProgramAndModules();
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Are you sure? This deletes the module and all its contents.")) return;
        const { error } = await supabase.from("modules").delete().eq("id", id);
        if (error) return toast.error(`Failed: ${error.message}`);
        toast.success("Module deleted");
        fetchProgramAndModules();
    };

    // ================= CONTENTS ================= //
    const openAddContent = (moduleId: string, type: string) => {
        const targetModule = modules.find(m => m.id === moduleId);
        setActiveModuleId(moduleId);
        setContentData({ 
            title: "", 
            content_type: type, 
            content_url_or_text: "",
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
            content_url_or_text: content.content_url_or_text || "",
            order_index: content.order_index || 0
        });
        setIsContentModalOpen(true);
    };

    const handleSaveContent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            title: contentData.title,
            content_type: contentData.content_type,
            content_url_or_text: contentData.content_url_or_text,
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
        fetchProgramAndModules();
    };

    const handleDeleteContent = async (id: string) => {
        if (!confirm("Delete this content?")) return;
        const { error } = await supabase.from("module_contents").delete().eq("id", id);
        if (error) return toast.error(`Failed: ${error.message}`);
        toast.success("Content deleted");
        fetchProgramAndModules();
    };

    // ================= CERTIFICATE ================= //
    const handleSaveCertificate = async () => {
        setIsSavingCert(true);
        const { error } = await supabase.from("programs").update({ certificate_url: certificateUrl }).eq("id", programId);
        setIsSavingCert(false);
        if (error) {
            console.error(error);
            toast.error("Failed to save certificate template!");
        } else {
            toast.success("Certificate saved");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href={`/${locale}/admin/programs`} className="text-gray-500 hover:text-navy flex items-center text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Programs
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0B2545]">Manage Modules: {program?.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">Create curriculum structure and add dynamic contents.</p>
                    </div>
                    <button 
                        onClick={() => { setModuleData({title: "", order_index: modules.length}); setEditingModuleId(null); setIsModuleModalOpen(true); }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#b5952f] rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Module
                    </button>
                </div>
            </div>

            {/* Certificate Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-[#D4AF37]" />
                    <h2 className="text-lg font-bold text-[#0B2545]">Certificate Template</h2>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="url" 
                        value={certificateUrl} 
                        onChange={e => setCertificateUrl(e.target.value)}
                        placeholder="https://example.com/certificate-template.pdf"
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                    <button 
                        onClick={handleSaveCertificate}
                        disabled={isSavingCert}
                        className="px-6 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg disabled:opacity-50"
                    >
                        {isSavingCert ? "Saving..." : "Save Template"}
                    </button>
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
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <button 
                                    className="flex items-center gap-2 flex-1 text-left"
                                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                >
                                    {expandedModule === module.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                    <h3 className="font-bold text-[#0B2545]">{module.title}</h3>
                                    <span className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full ml-2">
                                        {module.module_contents?.length || 0} Items
                                    </span>
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <button onClick={() => openAddContent(module.id, 'video')} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center border-r border-gray-200" title="Add Video">
                                            <Video className="w-3.5 h-3.5 mr-1" /> Video
                                        </button>
                                        <button onClick={() => openAddContent(module.id, 'pdf')} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center border-r border-gray-200" title="Add PDF">
                                            <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                                        </button>
                                        <button onClick={() => openAddContent(module.id, 'text')} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center border-r border-gray-200" title="Add Text">
                                            <Type className="w-3.5 h-3.5 mr-1" /> Text
                                        </button>
                                        <button onClick={() => openAddContent(module.id, 'quiz')} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center" title="Add Quiz">
                                            <HelpCircle className="w-3.5 h-3.5 mr-1" /> Quiz
                                        </button>
                                    </div>
                                    <span className="text-gray-300 ml-1">|</span>
                                    <button onClick={() => { setModuleData({title: module.title, order_index: module.order_index}); setEditingModuleId(module.id); setIsModuleModalOpen(true); }} className="text-gray-500 hover:text-gray-700">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteModule(module.id)} className="text-red-400 hover:text-red-600">
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
                                                <li key={content.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors pl-10">
                                                    <div className="flex items-start gap-3">
                                                        {content.content_type === 'video' && <Video className="w-5 h-5 text-blue-500 mt-0.5" />}
                                                        {content.content_type === 'pdf' && <FileText className="w-5 h-5 text-red-500 mt-0.5" />}
                                                        {content.content_type === 'text' && <Type className="w-5 h-5 text-gray-500 mt-0.5" />}
                                                        {content.content_type === 'quiz' && <HelpCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                                                        
                                                        <div>
                                                            <div className="font-medium text-[#0B2545] text-sm">
                                                                <span className="text-gray-400 text-xs mr-2 border border-gray-200 rounded px-1.5 py-0.5">Order: {content.order_index}</span>
                                                                {content.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 max-w-lg truncate">
                                                                {content.content_url_or_text ? (
                                                                    content.content_type === 'text' ? 'Rich text content attached' :
                                                                    content.content_type === 'quiz' ? 'Quiz data attached' :
                                                                    content.content_url_or_text
                                                                ) : 'No content URL/Text provided'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
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

            {/* Module Modal */}
            {isModuleModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4">{editingModuleId ? "Edit Module" : "New Module"}</h2>
                        <form onSubmit={handleSaveModule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                                <input required type="text" value={moduleData.title} onChange={e => setModuleData({...moduleData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" placeholder="e.g. Introduction to Leadership" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                <input required type="number" value={moduleData.order_index} onChange={e => setModuleData({...moduleData, order_index: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] hover:bg-[#0B2545]/90 rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Modal */}
            {isContentModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4 capitalize">
                            {editingContentId ? "Edit Content" : `Add ${contentData.content_type}`}
                        </h2>
                        <form onSubmit={handleSaveContent} className="space-y-4">
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
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
                                
                                {contentData.content_type === 'text' || contentData.content_type === 'quiz' ? (
                                    <textarea 
                                        required 
                                        value={contentData.content_url_or_text} 
                                        onChange={e => setContentData({...contentData, content_url_or_text: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37] font-mono text-sm" 
                                        rows={6} 
                                        placeholder={contentData.content_type === 'quiz' ? 'Enter quiz questions in JSON format...' : 'Enter your rich text content here...'}
                                    ></textarea>
                                ) : (
                                    <input 
                                        required 
                                        type="url" 
                                        value={contentData.content_url_or_text} 
                                        onChange={e => setContentData({...contentData, content_url_or_text: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D4AF37] focus:border-[#D4AF37]" 
                                        placeholder="https://..." 
                                    />
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {contentData.content_type === 'video' && 'Provide a valid YouTube, Vimeo, or MP4 URL.'}
                                    {contentData.content_type === 'pdf' && 'Provide a valid URL to a PDF document.'}
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
