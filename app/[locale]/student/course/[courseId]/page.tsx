"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, Menu, X, ArrowLeft, Lock, ChevronDown, ChevronUp, Download } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { programsData } from "@/data/programs";

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

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = decodeURIComponent(params.courseId as string);
    const locale = (params.locale as string) || "en";

    const [user, setUser] = useState<any>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [progressList, setProgressList] = useState<CourseProgress[]>([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [currentLessonId, setCurrentLessonId] = useState<string>("");

    // 1. Fetch Data & Validate Access
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("[DEBUG] Route courseId:", courseId);

                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
                if (userError || !currentUser) {
                    console.log("[DEBUG] No user found, redirecting.");
                    router.push(`/${locale}/student/dashboard`);
                    return;
                }
                setUser(currentUser);

                let targetCourseId = courseId;
                
                // 1. Check enrollment with route courseId
                const { data: directEnrollment } = await supabase
                    .from("course_enrollments")
                    .select("id")
                    .eq("user_id", currentUser.id)
                    .eq("course_id", courseId)
                    .maybeSingle();

                if (!directEnrollment) {
                    console.log("[DEBUG] Direct enrollment not found. Checking fallback...");
                    // Try fallback logic if courseId from URL is a program.id instead of DB UUID
                    const fallbackProgram = programsData.find(p => p.id === courseId);
                    if (fallbackProgram && fallbackProgram.courseDbId) {
                        const { data: fbEnrollment } = await supabase
                            .from("course_enrollments")
                            .select("id")
                            .eq("user_id", currentUser.id)
                            .eq("course_id", fallbackProgram.courseDbId)
                            .maybeSingle();

                        if (!fbEnrollment) {
                            console.log("[DEBUG] Fallback enrollment not found either.");
                            setError("You don't have access to this course.");
                            setLoading(false);
                            return;
                        }
                        console.log("[DEBUG] Found fallback enrollment. Using courseDbId:", fallbackProgram.courseDbId);
                        targetCourseId = fallbackProgram.courseDbId;
                    } else {
                        console.log("[DEBUG] No fallback program found or no courseDbId.");
                        setError("You don't have access to this course.");
                        setLoading(false);
                        return;
                    }
                } else {
                    console.log("[DEBUG] Found direct enrollment.");
                }

                console.log("[DEBUG] Fetching course data for ID:", targetCourseId);
                // 2. Fetch Course
                let { data: dbCourse, error: courseError } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("id", targetCourseId)
                    .maybeSingle();

                if (courseError) {
                    console.error("[DEBUG] Error fetching course:", courseError);
                    // don't throw, let it fallback
                }

                if (!dbCourse) {
                    console.warn("[DEBUG] Course not found in DB. Applying fallback.");
                    const fallbackProgram = programsData.find(p => p.id === courseId || p.courseDbId === targetCourseId);
                    
                    if (fallbackProgram) {
                        console.log("[DEBUG] Found fallback program data.");
                        dbCourse = {
                            id: targetCourseId,
                            title: fallbackProgram.title,
                            description: fallbackProgram.overview
                        };
                    } else {
                        console.log("[DEBUG] No fallback program data found. Using generic fallback.");
                        dbCourse = {
                            id: targetCourseId,
                            title: { en: "Enrolled Course", ar: "دورة مسجلة" },
                            description: { en: "Course details are currently unavailable.", ar: "تفاصيل الدورة غير متاحة حالياً." }
                        };
                    }
                }

                console.log("[DEBUG] Fetched Course:", dbCourse);
                setCourse(dbCourse);

                // 3. Fetch Modules
                const { data: dbModules, error: modulesError } = await supabase
                    .from("modules")
                    .select("*")
                    .eq("course_id", targetCourseId)
                    .order("serial_number", { ascending: true });

                if (modulesError) {
                    console.error("[DEBUG] Error fetching modules:", modulesError);
                    throw modulesError;
                }

                console.log("[DEBUG] Fetched Modules:", dbModules?.length || 0);
                let modulesData = dbModules || [];

                // 4. Fetch Lessons
                let lessonsData: Lesson[] = [];
                if (modulesData.length > 0) {
                    const moduleIds = modulesData.map((m) => m.id);
                    const { data: dbLessons, error: lessonsError } = await supabase
                        .from("lessons")
                        .select("*")
                        .in("module_id", moduleIds)
                        .order("serial_number", { ascending: true });

                    if (lessonsError) {
                        console.error("[DEBUG] Error fetching lessons:", lessonsError);
                        // don't throw, let it fallback if empty
                    }
                    lessonsData = dbLessons || [];
                }

                // 4.5 Fallback for missing curriculum
                if (modulesData.length === 0) {
                    console.log("[DEBUG] No curriculum found in DB. Generating mocks.");
                    const fallbackProgram = programsData.find(p => p.id === courseId || p.courseDbId === targetCourseId);
                    
                    if (fallbackProgram && fallbackProgram.curriculum) {
                        modulesData = fallbackProgram.curriculum.map((c, i) => ({
                            id: `mock-module-${i}`,
                            course_id: targetCourseId,
                            serial_number: i + 1,
                            title: c.title,
                            description: c.description
                        }));
                        // generate generic lessons for each module
                        lessonsData = modulesData.map((m, i) => ({
                            id: `mock-lesson-${i}`,
                            module_id: m.id,
                            serial_number: 1,
                            title: { en: "Lesson 1", ar: "الدرس 1" },
                            video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
                        }));
                    } else {
                        modulesData = [{
                            id: "generic-mock-module",
                            course_id: targetCourseId,
                            serial_number: 1,
                            title: { en: "Getting Started", ar: "البدء" },
                            description: { en: "Introduction module.", ar: "مقدمة" }
                        }];
                        lessonsData = [{
                            id: "generic-mock-lesson",
                            module_id: "generic-mock-module",
                            serial_number: 1,
                            title: { en: "Welcome to the Course", ar: "مرحباً بكم في الدورة" },
                            video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
                        }];
                    }
                }

                console.log("[DEBUG] Final Modules:", modulesData.length);
                console.log("[DEBUG] Final Lessons:", lessonsData.length);
                
                setModules(modulesData);
                setLessons(lessonsData);

                // 5. Fetch Progress
                // Using the unified course_progress schema (student_id, program_id, completed_lessons)
                const { data: progressData, error: progressError } = await supabase
                    .from("course_progress")
                    .select("completed_lessons")
                    .eq("student_id", currentUser.id)
                    .eq("program_id", courseId)
                    .maybeSingle();

                if (progressError && progressError.code !== 'PGRST116') {
                    console.error("[DEBUG] Error fetching progress:", progressError);
                    // Don't throw, just warn
                }
                
                const completedLessons = progressData?.completed_lessons || [];
                console.log("[DEBUG] Fetched Progress (completed lessons):", completedLessons.length);
                
                setProgressList(completedLessons.map((id: string) => ({
                    user_id: currentUser.id,
                    lesson_id: id,
                    is_completed: true
                })));

            } catch (err: any) {
                console.error("[DEBUG] Unexpected error in fetchCourseData:", err);
                setError(err.message || "Failed to load course.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, locale, router]);

    // 2. Sorting & Computed State
    const sortedModules = useMemo(() => {
        return [...modules].sort((a, b) => a.serial_number - b.serial_number);
    }, [modules]);

    const sortedLessons = useMemo(() => {
        return [...lessons].sort((a, b) => a.serial_number - b.serial_number);
    }, [lessons]);

    const flatLessons = useMemo(() => {
        const flat: Lesson[] = [];
        sortedModules.forEach(m => {
            const moduleLessons = sortedLessons.filter(l => l.module_id === m.id);
            flat.push(...moduleLessons);
        });
        return flat;
    }, [sortedModules, sortedLessons]);

    useEffect(() => {
        if (!loading && flatLessons.length > 0 && !currentLessonId) {
            // Find the first unlocked but incomplete lesson to auto-select
            let lessonToSelect = flatLessons[0].id;
            for (let i = 0; i < flatLessons.length; i++) {
                if (progressList.find(p => p.lesson_id === flatLessons[i].id)?.is_completed) {
                    continue; // Skip completed lessons
                }
                // Unlocked but not complete yet
                if (i === 0 || progressList.find(p => p.lesson_id === flatLessons[i - 1].id)?.is_completed) {
                    lessonToSelect = flatLessons[i].id;
                    break;
                }
            }
            setCurrentLessonId(lessonToSelect);
            const activeModId = flatLessons.find(l => l.id === lessonToSelect)?.module_id;
            if (activeModId && !expandedModules[activeModId]) {
                setExpandedModules({ [activeModId]: true });
            }
        }
        if (!loading && sortedModules.length > 0 && Object.keys(expandedModules).length === 0) {
            setExpandedModules({ [sortedModules[0].id]: true });
        }
    }, [loading, flatLessons, currentLessonId, sortedModules, expandedModules, progressList]);

    const activeLessonIndex = flatLessons.findIndex(l => l.id === currentLessonId);
    const activeLesson = flatLessons[activeLessonIndex];
    const activeModule = sortedModules.find(m => m.id === activeLesson?.module_id);

    // Dynamic Progress Stats
    const totalLessons = flatLessons.length;
    const completedLessonsCount = progressList.filter(p => p.is_completed).length;
    const remainingLessonsCount = Math.max(0, totalLessons - completedLessonsCount);
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    // 3. UI Action Handlers
    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const getLocalizedText = (textObj: any) => {
        if (!textObj) return "";
        if (typeof textObj === "string") return textObj;
        return textObj[locale] || textObj.en || "";
    };

    // LOCKING LOGIC
    const isLessonCompleted = (lessonId: string) => {
        return progressList.find(p => p.lesson_id === lessonId)?.is_completed === true;
    };

    const isLessonUnlocked = (lessonId: string) => {
        const index = flatLessons.findIndex(l => l.id === lessonId);
        if (index === 0) return true; // Lesson 1 is ALWAYS unlocked
        if (isLessonCompleted(lessonId)) return true; // Unlocked if IT is completed

        if (index > 0) {
            const prevLesson = flatLessons[index - 1];
            return isLessonCompleted(prevLesson.id); // Check if PREVIOUS is complete
        }
        return false;
    };

    // SAVE PROGRESS ON SUPABASE
    const markLessonCompleted = async (lessonId: string) => {
        if (!user) return;
        try {
            setActionLoading(true);

            // Instantly update UI optimistically
            setProgressList(prev => {
                const existing = prev.find(p => p.lesson_id === lessonId);
                if (existing) {
                    return prev.map(p => p.lesson_id === lessonId ? { ...p, is_completed: true } : p);
                }
                return [...prev, { user_id: user.id, lesson_id: lessonId, is_completed: true }];
            });

            // Safely persist to Supabase via API route
            // This natively supports our mock string IDs and properly manages the completed_lessons array
            const res = await fetch('/api/student/course/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.id,
                    programId: courseId,
                    lessonModule: lessonId,
                    isCompleted: true
                })
            });

            if (!res.ok) {
                throw new Error("Failed to persist progress to DB");
            }

            toast.success("Lesson completed!");

            // Auto unlock next lesson & expand its parent module
            const index = flatLessons.findIndex(l => l.id === lessonId);
            if (index < flatLessons.length - 1) {
                const nextLesson = flatLessons[index + 1];
                setCurrentLessonId(nextLesson.id);
                setExpandedModules(prev => ({ ...prev, [nextLesson.module_id]: true }));
            }
        } catch (err: any) {
            console.error("Error saving progress:", err);
            toast.error("Failed to save progress.");
            // Revert optimistic UI on error
            setProgressList(prev => prev.filter(p => p.lesson_id !== lessonId));
        } finally {
            setActionLoading(false);
        }
    };

    // TRIGGERED WHEN HTML5 VIDEO FINISHES
    const handleVideoEnded = () => {
        if (activeLesson && !isLessonCompleted(activeLesson.id)) {
            markLessonCompleted(activeLesson.id);
        }
    };

    // GENERATE AND DOWNLOAD PDF CERTIFICATE
    const handleDownloadCertificate = () => {
        if (!user || !course) return;

        toast.success("Generating Certificate PDF...");

        const courseTitle = (typeof course.title === 'string' ? course.title : course.title?.en) || "Enrolled Program";
        const studentName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Please allow popups to download your certificate.");
            return;
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificate of Completion - ${studentName}</title>
            <style>
                @page { size: landscape; margin: 0; }
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .certificate-container {
                    width: 1000px;
                    height: 700px;
                    background: white;
                    border: 20px solid #0B2545;
                    position: relative;
                    padding: 40px;
                    box-sizing: border-box;
                    text-align: center;
                }
                .certificate-container::before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    bottom: 10px;
                    border: 2px solid #D4AF37;
                    pointer-events: none;
                }
                .header { margin-top: 40px; }
                .title {
                    font-size: 56px;
                    color: #0B2545;
                    margin: 0;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                }
                .subtitle {
                    font-size: 24px;
                    color: #D4AF37;
                    margin-top: 10px;
                    font-weight: 600;
                    letter-spacing: 2px;
                }
                .content { margin-top: 60px; }
                .presented-to { font-size: 18px; color: #666; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
                .student-name {
                    font-size: 48px;
                    color: #0B2545;
                    font-family: 'Georgia', serif;
                    font-style: italic;
                    margin: 0 0 40px 0;
                    border-bottom: 2px solid #D4AF37;
                    display: inline-block;
                    padding: 0 40px 10px 40px;
                }
                .course-info { font-size: 18px; color: #666; margin-bottom: 20px; }
                .course-name {
                    font-size: 32px;
                    color: #0B2545;
                    font-weight: 700;
                    margin: 0;
                }
                .footer {
                    margin-top: 80px;
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-end;
                }
                .signature-box { text-align: center; }
                .signature-line {
                    width: 200px;
                    border-top: 1px solid #0B2545;
                    margin-bottom: 10px;
                }
                .signature-text { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                .date-text { font-size: 18px; color: #0B2545; font-weight: bold; }
                
                @media print {
                    body { background: white; }
                    .certificate-container { border-color: #0B2545 !important; }
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="header">
                    <h1 class="title">Certificate</h1>
                    <div class="subtitle">OF COMPLETION</div>
                </div>
                
                <div class="content">
                    <div class="presented-to">This certificate is proudly presented to</div>
                    <h2 class="student-name">${studentName}</h2>
                    
                    <div class="course-info">For successfully completing the program</div>
                    <h3 class="course-name">${courseTitle}</h3>
                </div>
                
                <div class="footer">
                    <div class="signature-box">
                        <div class="date-text">${dateStr}</div>
                        <div class="signature-line" style="margin-top: 10px; border-top-color: transparent;"></div>
                        <div class="signature-text">Date Completed</div>
                    </div>
                    
                    <div class="signature-box">
                        <div style="font-family: 'Georgia', serif; font-size: 32px; color: #0B2545; margin-bottom: -5px; font-style: italic;">Young Leaders Academy</div>
                        <div class="signature-line"></div>
                        <div class="signature-text">Authorized Signature</div>
                    </div>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }, 500);
                }
            </script>
        </body>
        </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleNext = () => {
        if (activeLessonIndex < totalLessons - 1) {
            // Auto-mark current lesson completed in background
            if (activeLesson && !isLessonCompleted(activeLesson.id)) {
                markLessonCompleted(activeLesson.id);
            }
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

    // 4. Render Layouts
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B2545]/20 border-t-[#0B2545]"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-red-600">{error || "Course Not Found"}</h2>
                <Link href={`/${locale}/student/dashboard`} className="mt-4 font-semibold text-[#D4AF37] hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    if (!activeLesson) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-[#0B2545]">No curriculum available yet.</h2>
                    <Link href={`/${locale}/student/dashboard`} className="mt-4 inline-block text-[#D4AF37] hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center w-full">
            <div className="flex h-screen w-full max-w-[1440px] flex-col bg-white overflow-hidden font-sans shadow-2xl border-x border-gray-200">
                {/* 5. Header */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <Link href={`/${locale}/student/dashboard`} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2545] transition-colors">
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

                    <div className="flex flex-col items-end text-xs sm:text-sm font-medium text-gray-500">
                        <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#D4AF37]" />
                            <span className="hidden sm:inline">{completedLessonsCount} of {totalLessons} completed</span>
                        </div>
                        {remainingLessonsCount > 0 && (
                            <span className="text-[10px] text-gray-400 font-normal">{remainingLessonsCount} lessons remaining</span>
                        )}
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden relative flex-col lg:flex-row">

                    {/* 6. MAIN CONTENT (Video Player Left) */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 relative">
                        <div className="mx-auto w-full max-w-[1440px] flex flex-col">

                            {/* Video Player */}
                            <motion.div
                                key={activeLesson.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-2xl relative flex items-center justify-center group border border-gray-800"
                            >
                                {activeLesson.video_url ? (
                                    activeLesson.video_url.includes("youtube.com") || activeLesson.video_url.includes("youtu.be") ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${activeLesson.video_url.split('v=')[1]?.split('&')[0] || activeLesson.video_url.split('/').pop()}`}
                                            className="w-full h-full object-cover"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={activeLesson.video_url}
                                            className="w-full h-full object-contain"
                                            controls
                                            autoPlay
                                            onEnded={handleVideoEnded}
                                            controlsList="nodownload"
                                        />
                                    )
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
                                            disabled={actionLoading || isLessonCompleted(activeLesson.id)}
                                            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50 ${isLessonCompleted(activeLesson.id)
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

                    {/* 7. SIDEBAR (Progress Bar & Modules on Right) */}
                    <aside
                        className={`absolute inset-y-0 right-0 z-10 w-80 transform border-l border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                            }`}
                    >
                        <div className="flex h-full flex-col">
                            <div className="flex flex-col border-b border-gray-100 px-6 py-4 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">Course Curriculum</h2>
                                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Course Progress Bar & Certificate */}
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-500">Course Progress</span>
                                        <span className="text-xs font-bold text-[#0B2545]">{progressPercentage}% Completed</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
                                        <motion.div
                                            className="h-full bg-[#D4AF37]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] text-gray-400 font-medium">{completedLessonsCount} / {totalLessons} Lessons</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{remainingLessonsCount} Remaining</span>
                                    </div>

                                    <button
                                        disabled={progressPercentage < 100}
                                        onClick={handleDownloadCertificate}
                                        className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${progressPercentage === 100
                                            ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Download className="h-4 w-4" />
                                        {progressPercentage === 100 ? "Download Certificate" : "Complete to get Certificate"}
                                    </button>
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
                                                className="w-full flex items-center justify-between p-4 bg-gray-50/30 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1">Module {mIdx + 1}</span>
                                                    <span className="text-sm font-bold text-[#0B2545] leading-tight">{getLocalizedText(mod.title)}</span>
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
                                                                        className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-all ${isActive
                                                                            ? "bg-[#0B2545]/5 border border-[#0B2545]/20 shadow-inner"
                                                                            : unlocked ? "hover:bg-gray-50 border border-transparent cursor-pointer" : "opacity-60 cursor-not-allowed border border-transparent grayscale-[50%]"
                                                                            }`}
                                                                    >
                                                                        <div className={`mt-0.5 flex shrink-0 h-6 w-6 items-center justify-center rounded-full border ${completed ? "bg-[#D4AF37] border-[#D4AF37] text-white" :
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
                                                                            <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
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
        </div>
    );
}
