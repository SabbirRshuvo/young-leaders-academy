"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, Menu, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type CurriculumModule = {
    module: string;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
};

type Program = {
    id: string;
    title: { en: string; ar: string };
    curriculum: CurriculumModule[];
};

export default function CourseLearningUI({ 
    program, 
    initialProgress, 
    studentId,
    locale = "en"
}: { 
    program: Program; 
    initialProgress: any; 
    studentId: string;
    locale?: string;
}) {
    const [completedLessons, setCompletedLessons] = useState<string[]>(initialProgress?.completed_lessons || []);
    const [currentLesson, setCurrentLesson] = useState<string>(initialProgress?.current_lesson || program.curriculum[0]?.module);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const totalLessons = program.curriculum.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    
    const activeIndex = program.curriculum.findIndex(c => c.module === currentLesson);
    const activeModule = program.curriculum[activeIndex];

    // Handle saving progress
    const saveProgress = async (moduleToToggle: string, isCompleted: boolean) => {
        try {
            setLoading(true);
            const res = await fetch("/api/student/course/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    programId: program.id,
                    lessonModule: moduleToToggle,
                    isCompleted,
                    currentLesson
                })
            });

            if (res.ok) {
                const data = await res.json();
                setCompletedLessons(data.completed_lessons);
                if (isCompleted) {
                    toast.success("Lesson marked as complete!");
                }
            } else {
                toast.error("Failed to save progress.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving progress.");
        } finally {
            setLoading(false);
        }
    };

    const toggleLessonComplete = (moduleId: string) => {
        const isCurrentlyCompleted = completedLessons.includes(moduleId);
        saveProgress(moduleId, !isCurrentlyCompleted);
    };

    const handleNext = () => {
        if (activeIndex < totalLessons - 1) {
            const nextModule = program.curriculum[activeIndex + 1].module;
            setCurrentLesson(nextModule);
            // Optionally save current lesson to DB
            fetch("/api/student/course/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    programId: program.id,
                    currentLesson: nextModule
                })
            });
        }
    };

    const handlePrevious = () => {
        if (activeIndex > 0) {
            const prevModule = program.curriculum[activeIndex - 1].module;
            setCurrentLesson(prevModule);
            fetch("/api/student/course/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    programId: program.id,
                    currentLesson: prevModule
                })
            });
        }
    };

    if (!activeModule) {
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
        <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">
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
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center max-w-md w-full px-4">
                    <h1 className="text-sm sm:text-base font-bold text-[#0B2545] truncate w-full text-center">
                        {program.title[locale as keyof typeof program.title] || program.title.en}
                    </h1>
                    <div className="mt-1 w-full flex items-center gap-2 max-w-[200px]">
                        <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                            <div 
                                className="h-full bg-[#D4AF37] transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-[#0B2545] w-8 text-right">{progressPercentage}%</span>
                    </div>
                </div>

                <div className="flex items-center text-xs sm:text-sm font-medium text-gray-500">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#D4AF37]" />
                    <span className="hidden sm:inline">{completedLessons.length} of {totalLessons} completed</span>
                    <span className="sm:hidden">{completedLessons.length}/{totalLessons}</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <aside 
                    className={`absolute inset-y-0 left-0 z-10 w-80 transform border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">Course Content</h2>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {program.curriculum.map((lesson, idx) => {
                                const isCompleted = completedLessons.includes(lesson.module);
                                const isActive = currentLesson === lesson.module;
                                
                                return (
                                    <button
                                        key={lesson.module}
                                        onClick={() => setCurrentLesson(lesson.module)}
                                        className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all ${
                                            isActive 
                                                ? "bg-[#0B2545]/5 border border-[#0B2545]/10 shadow-sm" 
                                                : "hover:bg-gray-50 border border-transparent"
                                        }`}
                                    >
                                        <div className={`mt-0.5 flex shrink-0 h-6 w-6 items-center justify-center rounded-full border ${
                                            isCompleted ? "bg-[#D4AF37] border-[#D4AF37] text-white" : 
                                            isActive ? "border-[#0B2545] text-[#0B2545]" : "border-gray-300 text-gray-400"
                                        }`}>
                                            {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-medium line-clamp-2 ${isActive ? "text-[#0B2545]" : "text-gray-700"}`}>
                                                {lesson.title[locale as keyof typeof lesson.title] || lesson.title.en}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                                <PlayCircle className="h-3 w-3" />
                                                Video Lesson
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
                    <div className="mx-auto max-w-4xl">
                        
                        {/* Video Player Placeholder */}
                        <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden shadow-lg relative flex items-center justify-center group">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10 flex flex-col items-center justify-center">
                                <button className="h-16 w-16 rounded-full bg-[#D4AF37] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                                    <PlayCircle className="h-8 w-8 ml-1" />
                                </button>
                                <p className="mt-4 text-white/80 text-sm font-medium">Video Player Placeholder</p>
                            </div>
                            <img 
                                src="/features-program.png" 
                                alt="Video Thumbnail" 
                                className="w-full h-full object-cover opacity-60 grayscale"
                            />
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545]/10 px-2.5 py-1 text-xs font-semibold text-[#0B2545] mb-3">
                                    Lesson {activeIndex + 1} of {totalLessons}
                                </div>
                                <h2 className="text-2xl font-bold text-[#0B2545] sm:text-3xl">
                                    {activeModule.title[locale as keyof typeof activeModule.title] || activeModule.title.en}
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-gray-600">
                                    {activeModule.description[locale as keyof typeof activeModule.description] || activeModule.description.en}
                                </p>
                            </div>

                            <div className="shrink-0 sm:w-64">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-[#0B2545] mb-4">Lesson Actions</h3>
                                    
                                    <button
                                        onClick={() => toggleLessonComplete(activeModule.module)}
                                        disabled={loading}
                                        className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                                            completedLessons.includes(activeModule.module)
                                                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                                : "bg-[#0B2545] text-white hover:bg-[#0B2545]/90"
                                        }`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {completedLessons.includes(activeModule.module) ? "Completed" : "Mark as Complete"}
                                    </button>

                                    <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={activeIndex === 0}
                                            className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={activeIndex === totalLessons - 1}
                                            className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-0 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
