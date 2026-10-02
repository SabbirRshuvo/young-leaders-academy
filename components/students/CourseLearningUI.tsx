"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, Menu, X, ArrowLeft, Lock, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Course = {
    id: string;
    title: { en: string; ar: string } | string;
    description?: { en: string; ar: string } | string;
};

type Module = {
    id: string;
    course_id: string;
    serial_number: number;
    title: { en: string; ar: string } | string;
    description?: { en: string; ar: string } | string;
};

type Lesson = {
    id: string;
    module_id: string;
    serial_number: number;
    title: { en: string; ar: string } | string;
    description?: { en: string; ar: string } | string;
    video_url: string;
};

type CourseProgress = {
    id?: string;
    user_id: string;
    lesson_id: string;
    is_completed: boolean;
    watch_time_seconds?: number;
};

export default function CourseLearningUI({ 
    course,
    modules,
    lessons,
    initialProgress, 
    userId,
    locale = "en"
}: { 
    course: Course;
    modules: Module[];
    lessons: Lesson[];
    initialProgress: CourseProgress[]; 
    userId: string;
    locale?: string;
}) {
    const [progressList, setProgressList] = useState<CourseProgress[]>(initialProgress || []);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    // Sort modules and lessons based on serial_number
    const sortedModules = useMemo(() => {
        return [...modules].sort((a, b) => a.serial_number - b.serial_number);
    }, [modules]);

    const sortedLessons = useMemo(() => {
        return [...lessons].sort((a, b) => a.serial_number - b.serial_number);
    }, [lessons]);

    // Flat list of lessons ordered globally by module, then lesson serial
    const flatLessons = useMemo(() => {
        const flat: Lesson[] = [];
        sortedModules.forEach(m => {
            const moduleLessons = sortedLessons.filter(l => l.module_id === m.id);
            flat.push(...moduleLessons);
        });
        return flat;
    }, [sortedModules, sortedLessons]);

    const [currentLessonId, setCurrentLessonId] = useState<string>(flatLessons[0]?.id || "");

    const activeLessonIndex = flatLessons.findIndex(l => l.id === currentLessonId);
    const activeLesson = flatLessons[activeLessonIndex];
    const activeModule = sortedModules.find(m => m.id === activeLesson?.module_id);

    const totalLessons = flatLessons.length;
    const completedLessonsCount = progressList.filter(p => p.is_completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    // Expand the first module by default
    useMemo(() => {
        if (sortedModules.length > 0 && Object.keys(expandedModules).length === 0) {
            setExpandedModules({ [sortedModules[0].id]: true });
        }
    }, [sortedModules]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    // Helper to extract localized string
    const getLocalizedText = (textObj: any) => {
        if (!textObj) return "";
        if (typeof textObj === "string") return textObj;
        return textObj[locale] || textObj.en || "";
    };

    // Check if a lesson is unlocked
    const isLessonUnlocked = (lessonId: string) => {
        const index = flatLessons.findIndex(l => l.id === lessonId);
        if (index === 0) return true; // First lesson is ALWAYS unlocked
        if (index > 0) {
            const prevLesson = flatLessons[index - 1];
            const prevProgress = progressList.find(p => p.lesson_id === prevLesson.id);
            return prevProgress?.is_completed === true;
        }
        return false;
    };

    const isLessonCompleted = (lessonId: string) => {
        return progressList.find(p => p.lesson_id === lessonId)?.is_completed === true;
    };

    const markLessonCompleted = async (lessonId: string) => {
        try {
            setLoading(true);
            
            // Optimistic update
            setProgressList(prev => {
                const existing = prev.find(p => p.lesson_id === lessonId);
                if (existing) {
                    return prev.map(p => p.lesson_id === lessonId ? { ...p, is_completed: true } : p);
                }
                return [...prev, { user_id: userId, lesson_id: lessonId, is_completed: true }];
            });

            // Upsert in Supabase
            const { error } = await supabase
                .from("course_progress")
                .upsert(
                    { user_id: userId, lesson_id: lessonId, is_completed: true },
                    { onConflict: 'user_id,lesson_id' }
                );

            if (error) {
                console.error("Error saving progress:", error);
                toast.error("Failed to save progress.");
                // Revert optimistic update? For simplicity, we just notify error.
            } else {
                toast.success("Lesson completed!");
                
                // Automatically move to the next lesson and expand its module if not already expanded
                const index = flatLessons.findIndex(l => l.id === lessonId);
                if (index < flatLessons.length - 1) {
                    const nextLesson = flatLessons[index + 1];
                    setCurrentLessonId(nextLesson.id);
                    setExpandedModules(prev => ({ ...prev, [nextLesson.module_id]: true }));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving progress.");
        } finally {
            setLoading(false);
        }
    };

    const handleVideoEnded = () => {
        if (activeLesson && !isLessonCompleted(activeLesson.id)) {
            markLessonCompleted(activeLesson.id);
        }
    };

    const handleNext = () => {
        if (activeLessonIndex < totalLessons - 1) {
            const nextLesson = flatLessons[activeLessonIndex + 1];
            setCurrentLessonId(nextLesson.id);
            setExpandedModules(prev => ({ ...prev, [nextLesson.module_id]: true }));
        }
    };

    const handlePrevious = () => {
        if (activeLessonIndex > 0) {
            const prevLesson = flatLessons[activeLessonIndex - 1];
            setCurrentLessonId(prevLesson.id);
            setExpandedModules(prev => ({ ...prev, [prevLesson.module_id]: true }));
        }
    };

    if (!activeLesson) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-[#0B2545]">Course content not found.</h2>
                    <Link href="/student/dashboard" className="mt-4 inline-block text-[#D4AF37] hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-50 overflow-hidden font-sans">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2545] transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center max-w-md w-full px-4">
                    <h1 className="text-sm sm:text-base font-bold text-[#0B2545] truncate w-full text-center">
                        {getLocalizedText(course.title)}
                    </h1>
                    <div className="mt-1 w-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">Course Player</span>
                    </div>
                </div>

                <div className="flex items-center text-xs sm:text-sm font-medium text-gray-500">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#D4AF37]" />
                    <span className="hidden sm:inline">{completedLessonsCount} of {totalLessons} completed</span>
                    <span className="sm:hidden">{completedLessonsCount}/{totalLessons}</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative flex-col lg:flex-row">
                
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 relative">
                    <div className="mx-auto max-w-5xl">
                        
                        {/* Video Player */}
                        <motion.div 
                            key={activeLesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-2xl relative flex items-center justify-center group border border-gray-800"
                        >
                            {activeLesson.video_url ? (
                                <video 
                                    src={activeLesson.video_url} 
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    onEnded={handleVideoEnded}
                                    controlsList="nodownload"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-white/50">
                                    <PlayCircle className="h-16 w-16 mb-4 text-[#D4AF37]" />
                                    <p>No video URL provided for this lesson.</p>
                                    <button 
                                        onClick={handleVideoEnded}
                                        className="mt-4 px-4 py-2 bg-[#D4AF37] text-white rounded hover:bg-[#b5952f] transition"
                                    >
                                        Simulate Video End
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        <div className="mt-8 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545]/10 px-3 py-1.5 text-xs font-bold text-[#0B2545] mb-4">
                                    {activeModule ? getLocalizedText(activeModule.title) : `Module`} • Lesson {activeLesson.serial_number}
                                </div>
                                <h2 className="text-2xl font-black text-[#0B2545] sm:text-3xl mb-4">
                                    {getLocalizedText(activeLesson.title)}
                                </h2>
                                <div className="prose prose-sm sm:prose-base prose-gray max-w-none text-gray-600">
                                    <p>{getLocalizedText(activeLesson.description) || "No description available for this lesson."}</p>
                                </div>
                            </div>

                            <div className="shrink-0 lg:w-72">
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-4">
                                    <h3 className="text-sm font-black text-[#0B2545] mb-4 uppercase tracking-wide">Lesson Actions</h3>
                                    
                                    <button
                                        onClick={() => markLessonCompleted(activeLesson.id)}
                                        disabled={loading || isLessonCompleted(activeLesson.id)}
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50 ${
                                            isLessonCompleted(activeLesson.id)
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-[#0B2545] text-white hover:bg-[#0B2545]/90 hover:shadow-lg hover:-translate-y-0.5"
                                        }`}
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        {isLessonCompleted(activeLesson.id) ? "Completed" : "Mark as Complete"}
                                    </button>

                                    <div className="mt-5 flex gap-3 pt-5 border-t border-gray-100">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={activeLessonIndex === 0}
                                            className="flex-1 flex items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Prev
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={activeLessonIndex === totalLessons - 1 || (!isLessonCompleted(activeLesson.id) && !isLessonUnlocked(flatLessons[activeLessonIndex + 1]?.id))}
                                            className="flex-1 flex items-center justify-center rounded-xl border border-[#0B2545] bg-[#0B2545] text-white py-2.5 text-xs font-bold hover:bg-[#0B2545]/90 disabled:opacity-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
                
                {/* Sidebar (Right side on Desktop) */}
                <aside 
                    className={`absolute inset-y-0 right-0 z-10 w-80 transform border-l border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex flex-col border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">Course Curriculum</h2>
                                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            {/* Course Progress Bar in Sidebar */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-gray-600">Course Progress</span>
                                    <span className="text-xs font-bold text-[#0B2545]">{progressPercentage}% Completed</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-[#D4AF37]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {sortedModules.map((mod, mIdx) => {
                                const moduleLessons = sortedLessons.filter(l => l.module_id === mod.id);
                                const isExpanded = expandedModules[mod.id];
                                
                                return (
                                    <div key={mod.id} className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                        <button 
                                            onClick={() => toggleModule(mod.id)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex flex-col items-start text-left">
                                                <span className="text-xs font-bold text-gray-400 mb-0.5">Module {mIdx + 1}</span>
                                                <span className="text-sm font-bold text-[#0B2545]">{getLocalizedText(mod.title)}</span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-2 space-y-1 bg-white border-t border-gray-100">
                                                        {moduleLessons.map((lesson, lIdx) => {
                                                            const unlocked = isLessonUnlocked(lesson.id);
                                                            const completed = isLessonCompleted(lesson.id);
                                                            const isActive = currentLessonId === lesson.id;
                                                            
                                                            return (
                                                                <button
                                                                    key={lesson.id}
                                                                    disabled={!unlocked}
                                                                    onClick={() => setCurrentLessonId(lesson.id)}
                                                                    className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-all ${
                                                                        isActive 
                                                                            ? "bg-[#0B2545]/5 border border-[#0B2545]/20 shadow-inner" 
                                                                            : unlocked ? "hover:bg-gray-50 border border-transparent cursor-pointer" : "opacity-60 cursor-not-allowed border border-transparent grayscale-[50%]"
                                                                    }`}
                                                                >
                                                                    <div className={`mt-0.5 flex shrink-0 h-6 w-6 items-center justify-center rounded-full border ${
                                                                        completed ? "bg-[#D4AF37] border-[#D4AF37] text-white" : 
                                                                        isActive ? "border-[#0B2545] text-[#0B2545]" : 
                                                                        !unlocked ? "border-gray-200 bg-gray-100 text-gray-400" :
                                                                        "border-gray-300 text-gray-400"
                                                                    }`}>
                                                                        {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                                                                         !unlocked ? <Lock className="h-3 w-3" /> :
                                                                         <span className="text-[10px] font-bold">{lIdx + 1}</span>}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className={`text-sm font-medium line-clamp-2 ${isActive ? "text-[#0B2545]" : "text-gray-700"}`}>
                                                                            {getLocalizedText(lesson.title)}
                                                                        </p>
                                                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                                                            <PlayCircle className="h-3 w-3" />
                                                                            Video
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
            
            {/* Overlay for mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-0 bg-black/20 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
