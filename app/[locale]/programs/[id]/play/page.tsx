"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle, ArrowLeft, ArrowRight, Loader2, Award, Video, Type, HelpCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import QuizPlayer from "@/components/programs/QuizPlayer";

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const programId = params.id as string;
    const locale = params.locale as string;

    const [program, setProgram] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Player State
    const [activeContent, setActiveContent] = useState<any>(null);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [isMarking, setIsMarking] = useState(false);

    useEffect(() => {
        fetchData();
    }, [programId]);

    const fetchData = async () => {
        setLoading(true);
        
        // Get user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push(`/${locale}/login`);
            return;
        }
        setUser(session.user);

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

        // Fetch Modules (Sequential to avoid PGRST200 nested join errors)
        const { data: rawModules, error: modError } = await supabase
            .from("modules")
            .select("*")
            .eq("program_id", programId)
            .order("order_index", { ascending: true });

        if (modError) {
            console.error("Supabase Modules Fetch Error:", modError);
            toast.error("Failed to load modules");
            setLoading(false);
            return;
        }

        let rawContents: any[] = [];
        if (rawModules && rawModules.length > 0) {
            const moduleIds = rawModules.map(m => m.id);
            const { data: contentsData } = await supabase
                .from("module_contents")
                .select("*")
                .in("module_id", moduleIds)
                .order("order_index", { ascending: true });
            
            rawContents = contentsData || [];
        }

        const assembledModules = (rawModules || []).map(m => {
            const hasModuleContent = m.video_url || m.pdf_url || m.description || m.quiz_url;
            
            // If the module has its own content fields, treat it as the first playable item!
            const overviewItem = hasModuleContent ? [{
                id: m.id, 
                title: "Module Overview",
                content_type: "module_overview",
                video_url: m.video_url,
                pdf_url: m.pdf_url,
                body_text: m.description,
                quiz_url: m.quiz_url,
                order_index: -1
            }] : [];

            return {
                ...m,
                module_contents: [...overviewItem, ...rawContents.filter((c: any) => c.module_id === m.id)]
            };
        });

        setModules(assembledModules);
        
        // Expand first module by default
        if (assembledModules.length > 0) {
            setExpandedModules([assembledModules[0].id]);
            if (assembledModules[0].module_contents.length > 0) {
                setActiveContent(assembledModules[0].module_contents[0]);
            }
        }

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
            .from("user_progress")
            .select("*")
            .eq("student_id", session.user.id);
            
        if (progressData) {
            setUserProgress(progressData);
        } else if (progressError) {
            console.error("Progress fetch error:", progressError);
        }

        setLoading(false);
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => 
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const isContentCompleted = (contentId: string) => {
        // Fallback to checking 'lesson_id' if 'content_id' doesn't exist yet in the DB
        return userProgress.some(p => (p.content_id === contentId || p.lesson_id === contentId) && p.is_completed);
    };

    const toggleContentCompletion = async (contentId: string) => {
        if (!user) return;
        setIsMarking(true);
        const completed = isContentCompleted(contentId);
        
        const payload = { student_id: user.id, content_id: contentId, is_completed: true, completed_at: new Date().toISOString() };
        
        if (completed) {
            // Unmark
            await supabase.from("user_progress").delete().match({ student_id: user.id, content_id: contentId });
            setUserProgress(prev => prev.filter(p => p.content_id !== contentId));
        } else {
            // Mark
            await supabase.from("user_progress").insert(payload);
            setUserProgress(prev => [...prev, payload]);
        }
        setIsMarking(false);
    };

    // Calculate progress
    const totalContents = modules.reduce((acc, m) => acc + m.module_contents.length, 0);
    const completedCount = modules.reduce((acc, m) => acc + m.module_contents.filter((c: any) => isContentCompleted(c.id)).length, 0);
    const progressPercentage = totalContents === 0 ? 0 : Math.round((completedCount / totalContents) * 100);

    // Find next/prev contents
    const getAllContentsFlattened = () => modules.flatMap(m => m.module_contents);
    const flatContents = getAllContentsFlattened();
    const currentIndex = flatContents.findIndex(c => c.id === activeContent?.id);
    const prevContent = currentIndex > 0 ? flatContents[currentIndex - 1] : null;
    const nextContent = currentIndex < flatContents.length - 1 ? flatContents[currentIndex + 1] : null;

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" /></div>;
    }

    const renderContentPlayer = () => {
        if (!activeContent) {
            return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                    No content available in this module.
                </div>
            );
        }

        const type = activeContent.content_type;

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Media Area based on type */}
                {type === 'video' && (
                    <div className="aspect-video bg-black relative flex items-center justify-center">
                        {activeContent.video_url ? (
                            <iframe 
                                src={activeContent.video_url} 
                                className="w-full h-full absolute inset-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <PlayCircle className="h-16 w-16 mb-2 opacity-50" />
                                <p>No video URL provided</p>
                            </div>
                        )}
                    </div>
                )}

                {type === 'pdf' && (
                    <div className="aspect-video bg-gray-100 border-b border-gray-200 relative flex items-center justify-center">
                        {activeContent.pdf_url ? (
                            <iframe src={`${activeContent.pdf_url}#toolbar=0`} className="w-full h-full absolute inset-0"></iframe>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <FileText className="h-16 w-16 mb-2 opacity-50" />
                                <p>No PDF URL provided</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Content Details Area */}
                <div className="p-6 md:p-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                            {type}
                        </span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0B2545]">{activeContent.title}</h1>
                    
                    {type === 'text' && (
                        <div className="mt-6 prose prose-blue max-w-none text-gray-700">
                            {/* In a real app, this might be parsed markdown or HTML */}
                            <div className="whitespace-pre-wrap leading-relaxed">{activeContent.body_text}</div>
                        </div>
                    )}

                    {type === 'quiz' && (
                        <div className="mt-6">
                            <QuizPlayer 
                                quizJsonStr={activeContent.quiz_data ? JSON.stringify(activeContent.quiz_data) : '[]'} 
                                onComplete={() => toggleContentCompletion(activeContent.id)}
                            />
                        </div>
                    )}

                    {type === 'module_overview' && (
                        <div className="mt-6 space-y-8">
                            {/* Description */}
                            {activeContent.body_text && (
                                <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {activeContent.body_text}
                                </div>
                            )}

                            {/* Video */}
                            {activeContent.video_url && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-[#0B2545] mb-3 flex items-center gap-2"><Video className="w-5 h-5 text-blue-500"/> Module Video</h3>
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                                        <iframe src={activeContent.video_url} className="w-full h-full absolute inset-0" allowFullScreen></iframe>
                                    </div>
                                </div>
                            )}

                            {/* PDF */}
                            {activeContent.pdf_url && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-[#0B2545] mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-red-500"/> Module PDF Resource</h3>
                                    <div className="aspect-[4/3] sm:aspect-video bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                                        <iframe src={`${activeContent.pdf_url}#toolbar=0`} className="w-full h-full absolute inset-0"></iframe>
                                    </div>
                                </div>
                            )}

                            {/* Quiz Link */}
                            {activeContent.quiz_url && (
                                <div className="mt-4 p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-600"/> Module Assessment</h3>
                                        <p className="text-sm text-gray-600 mt-1">Take the quiz to test your knowledge.</p>
                                    </div>
                                    <a 
                                        href={activeContent.quiz_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-5 py-2.5 bg-[#0B2545] text-white font-bold rounded-lg text-sm hover:bg-[#0B2545]/90 transition-colors"
                                    >
                                        Open Quiz
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <button 
                            disabled={!prevContent}
                            onClick={() => prevContent && setActiveContent(prevContent)}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm flex items-center disabled:opacity-50 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                        </button>
                        
                        <button 
                            disabled={isMarking}
                            onClick={() => toggleContentCompletion(activeContent.id)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center transition-colors w-full sm:w-auto justify-center ${
                                isContentCompleted(activeContent.id)
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-[#0B2545] text-white hover:bg-[#0B2545]/90"
                            }`}
                        >
                            {isMarking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className={`w-4 h-4 mr-2 ${isContentCompleted(activeContent.id) ? "text-green-600" : ""}`} />}
                            {isContentCompleted(activeContent.id) ? "Completed" : "Mark as Completed"}
                        </button>

                        <button 
                            disabled={!nextContent}
                            onClick={() => nextContent && setActiveContent(nextContent)}
                            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium text-sm flex items-center disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const getIconForType = (type: string, isActive: boolean, isDone: boolean) => {
        if (isDone) return <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />;
        
        const baseClass = `w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-[#D4AF37]" : "text-gray-400"}`;
        switch(type) {
            case 'video': return <Video className={baseClass} />;
            case 'pdf': return <FileText className={baseClass} />;
            case 'text': return <Type className={baseClass} />;
            case 'quiz': return <HelpCircle className={baseClass} />;
            default: return <PlayCircle className={baseClass} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-4 pb-20">
            <div className="max-w-[1440px] mx-auto px-4 flex gap-6 flex-col lg:flex-row items-start">
                
                {/* Main Content Area */}
                <div className="flex-1 w-full flex flex-col gap-6">
                    <Link href={`/${locale}/programs`} className="text-gray-500 hover:text-navy flex items-center text-sm font-medium w-fit">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Programs
                    </Link>

                    {renderContentPlayer()}
                </div>

                {/* Sidebar Curriculum */}
                <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-6">
                    
                    {/* Course Progress Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-[#0B2545] mb-2">Course Progress</h3>
                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                            <span>{completedCount} / {totalContents} Items</span>
                            <span className="text-[#D4AF37]">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4AF37] transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                        </div>

                        <a 
                            href={program?.certificate_url || "#"} 
                            target={program?.certificate_url ? "_blank" : "_self"}
                            className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
                                progressPercentage === 100 
                                ? "bg-[#0B2545] text-white hover:bg-[#0B2545]/90" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                            onClick={(e) => {
                                if (progressPercentage !== 100 || !program?.certificate_url) {
                                    e.preventDefault();
                                    if (progressPercentage !== 100) toast.error("You must complete 100% of the course to download the certificate.");
                                    else if (!program?.certificate_url) toast.error("Certificate template not provided by admin.");
                                }
                            }}
                        >
                            <Award className="w-4 h-4 mr-2" /> Download Certificate
                        </a>
                    </div>

                    {/* Modules Accordion */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-[#0B2545]">Curriculum</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[600px]">
                            {modules.map((module, i) => (
                                <div key={module.id} className="border-b border-gray-100 last:border-b-0">
                                    <button 
                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-0.5">Module {i + 1}</p>
                                            <p className="font-bold text-[#0B2545] text-sm pr-4">{module.title}</p>
                                        </div>
                                        {expandedModules.includes(module.id) ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />}
                                    </button>
                                    
                                    {expandedModules.includes(module.id) && (
                                        <ul className="bg-gray-50/30">
                                            {module.module_contents.map((content: any, index: number) => {
                                                const isActive = activeContent?.id === content.id;
                                                const isDone = isContentCompleted(content.id);
                                                return (
                                                    <li key={content.id}>
                                                        <button 
                                                            onClick={() => setActiveContent(content)}
                                                            className={`w-full px-5 py-3 flex items-start gap-3 text-left transition-colors border-l-2 ${
                                                                isActive 
                                                                ? "bg-blue-50/50 border-[#D4AF37]" 
                                                                : "border-transparent hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {getIconForType(content.content_type, isActive, isDone)}
                                                            <div>
                                                                <span className={`text-sm ${isActive ? "font-bold text-[#0B2545]" : "font-medium text-gray-600"}`}>
                                                                    {index + 1}. {content.title}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
