"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, 
    PlayCircle, 
    CheckCircle2, 
    Circle, 
    BookOpen, 
    Trophy, 
    Clock,
    Lock,
    Unlock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type ClassItem = {
    id: string;
    title: string;
    duration: string;
    status: "completed" | "in-progress" | "locked";
};

type Module = {
    id: string;
    title: string;
    description: string;
    classes: ClassItem[];
};

// Mock data to simulate the class progress system
const MOCK_MODULES: Module[] = [
    {
        id: "mod_1",
        title: "Module 1: Getting Started",
        description: "Introduction to the program and foundational concepts.",
        classes: [
            { id: "c1", title: "Welcome to the Program", duration: "10 mins", status: "completed" },
            { id: "c2", title: "Setting up your environment", duration: "25 mins", status: "completed" },
            { id: "c3", title: "First Assignment", duration: "45 mins", status: "in-progress" },
        ]
    },
    {
        id: "mod_2",
        title: "Module 2: Core Concepts",
        description: "Dive deep into the main topics of this program.",
        classes: [
            { id: "c4", title: "Understanding the Basics", duration: "30 mins", status: "locked" },
            { id: "c5", title: "Advanced Techniques", duration: "40 mins", status: "locked" },
            { id: "c6", title: "Module Project", duration: "120 mins", status: "locked" },
        ]
    },
    {
        id: "mod_3",
        title: "Module 3: Mastery & Beyond",
        description: "Final concepts and graduation project.",
        classes: [
            { id: "c7", title: "Real-world Applications", duration: "45 mins", status: "locked" },
            { id: "c8", title: "Career Preparation", duration: "30 mins", status: "locked" },
            { id: "c9", title: "Final Assessment", duration: "90 mins", status: "locked" },
        ]
    }
];

export default function ProgramDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const programId = params.programId as string;
    
    const [loading, setLoading] = useState(true);
    const [programName, setProgramName] = useState<string>("Loading Program...");

    useEffect(() => {
        // In a real application, you would fetch the program details and student's progress from the database here.
        // For now, we simulate fetching data.
        const fetchProgramDetails = async () => {
            try {
                // Example of checking if the user actually purchased this
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login");
                    return;
                }

                // Try to find the payment to get the program title
                const { data: payments } = await supabase
                    .from("payments")
                    .select("program_title")
                    .eq("program_id", programId)
                    .eq("payment_status", "paid")
                    .limit(1);

                if (payments && payments.length > 0 && payments[0].program_title) {
                    setProgramName(payments[0].program_title);
                } else {
                    setProgramName(`Program ${programId}`);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching program details", error);
                setProgramName("Enrolled Program");
                setLoading(false);
            }
        };

        fetchProgramDetails();
    }, [programId, router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50/60 p-6 flex items-center justify-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0B2545]" />
            </main>
        );
    }

    // Calculate stats based on mock data
    const totalClasses = MOCK_MODULES.reduce((acc, mod) => acc + mod.classes.length, 0);
    const completedClasses = MOCK_MODULES.reduce((acc, mod) => 
        acc + mod.classes.filter(c => c.status === "completed").length, 0
    );
    const progressPercentage = Math.round((completedClasses / totalClasses) * 100);

    return (
        <main className="min-h-screen bg-gray-50/60">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                
                {/* Back Button */}
                <Link 
                    href="/student/dashboard" 
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2545] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header Section */}
                <section className="rounded-2xl bg-[#0B2545] px-6 py-8 text-white shadow-sm sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2 text-sm text-[#D4AF37]">
                                <BookOpen className="h-4 w-4" />
                                My Learning
                            </div>
                            <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                                {programName}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                Pick up right where you left off. Complete your modules, track your progress, and master new skills.
                            </p>
                        </div>

                        {/* Overall Progress Card (Inside Header) */}
                        <div className="w-full lg:w-72 shrink-0 rounded-xl bg-white/10 p-5 backdrop-blur-md border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white/90">Course Progress</span>
                                <span className="text-lg font-bold text-[#D4AF37]">{progressPercentage}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/20">
                                <div 
                                    className="h-full rounded-full bg-[#D4AF37] transition-all duration-1000"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-white/60">Completed</p>
                                    <p className="font-semibold">{completedClasses} Classes</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/60">Remaining</p>
                                    <p className="font-semibold">{totalClasses - completedClasses} Classes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    
                    {/* Left Column: Course Modules */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                            Course Content
                        </h2>

                        {MOCK_MODULES.map((module, mIdx) => {
                            const modCompletedClasses = module.classes.filter(c => c.status === "completed").length;
                            const modTotalClasses = module.classes.length;
                            const isModuleLocked = module.classes.every(c => c.status === "locked");

                            return (
                                <div key={module.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                    {/* Module Header */}
                                    <div className="border-b border-gray-100 bg-gray-50/50 p-5 sm:px-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-[#0B2545]">
                                                    {module.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {module.description}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-sm font-medium text-gray-500 flex items-center gap-2">
                                                {isModuleLocked ? (
                                                    <span className="flex items-center gap-1 text-gray-400 bg-gray-100 px-3 py-1 rounded-full text-xs">
                                                        <Lock className="h-3.5 w-3.5" /> Locked
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-[#0B2545]/10 text-[#0B2545] px-3 py-1 rounded-full">
                                                        {modCompletedClasses} / {modTotalClasses} Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Module Classes */}
                                    <div className="divide-y divide-gray-100 p-2 sm:p-4">
                                        {module.classes.map((cls, cIdx) => (
                                            <div 
                                                key={cls.id} 
                                                className={`group flex items-center justify-between rounded-xl p-3 sm:p-4 transition-colors ${
                                                    cls.status === "locked" 
                                                        ? "opacity-60" 
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Status Icon */}
                                                    <div className="flex shrink-0 items-center justify-center">
                                                        {cls.status === "completed" && (
                                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                        )}
                                                        {cls.status === "in-progress" && (
                                                            <div className="relative flex h-6 w-6 items-center justify-center">
                                                                <Circle className="h-6 w-6 text-[#D4AF37]" />
                                                                <PlayCircle className="absolute h-4 w-4 text-[#D4AF37]" />
                                                            </div>
                                                        )}
                                                        {cls.status === "locked" && (
                                                            <Lock className="h-5 w-5 text-gray-300" />
                                                        )}
                                                    </div>

                                                    {/* Class Title */}
                                                    <div>
                                                        <p className={`text-sm sm:text-base font-semibold ${
                                                            cls.status === "locked" ? "text-gray-500" : "text-[#0B2545]"
                                                        }`}>
                                                            {cIdx + 1}. {cls.title}
                                                        </p>
                                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock className="h-3 w-3" /> {cls.duration}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {cls.status !== "locked" && (
                                                    <button 
                                                        className={`hidden shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold sm:block transition-all ${
                                                            cls.status === "in-progress" 
                                                                ? "bg-[#0B2545] text-white hover:bg-[#0B2545]/90"
                                                                : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                        }`}
                                                        onClick={() => toast.success(
                                                            cls.status === "in-progress" ? "Resuming class..." : "Replaying class..."
                                                        )}
                                                    >
                                                        {cls.status === "in-progress" ? "Continue" : "Watch Again"}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column: Achievements & Extras */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/20 mb-4">
                                <Trophy className="h-6 w-6 text-[#9a7e23]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0B2545]">
                                Keep it up!
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                You are doing great. Complete all modules in this program to earn your official certificate.
                            </p>
                            
                            <div className="mt-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0B2545]">Next Milestone</p>
                                    <p className="text-xs text-gray-500">Finish Module 1</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-[#0B2545] mb-4">
                                Resources
                            </h3>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                                    <BookOpen className="h-5 w-5 text-[#0B2545]" />
                                    <span className="text-sm font-medium text-[#0B2545]">Program Syllabus</span>
                                </a>
                                <a href="#" className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                                    <Trophy className="h-5 w-5 text-[#0B2545]" />
                                    <span className="text-sm font-medium text-[#0B2545]">Community Guidelines</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
