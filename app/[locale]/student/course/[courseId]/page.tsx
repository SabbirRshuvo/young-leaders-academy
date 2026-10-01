import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { programsData } from "@/data/programs";
import { universitiesData } from "@/data/universities";
import CourseLearningUI from "@/components/students/CourseLearningUI";

export default async function CourseLearningPage({
    params
}: {
    params: Promise<{ locale: string; courseId: string }>;
}) {
    const { locale, courseId } = await params;
    const { data: { session } } = await supabase.auth.getSession();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/${locale}/student/dashboard`);
    }

    const decodedCourseId = decodeURIComponent(courseId);

    // Check if the user has an application for the course
    const { data: application } = await supabase
        .from("applications")
        .select("*")
        .ilike("email", user.email || "")
        .eq("program_id", decodedCourseId)
        .limit(1)
        .maybeSingle();

    // Check if the user purchased/enrolled in the course
    // Based on the checkout logic, we check payments using user.email as parent_email
    const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .ilike("parent_email", user.email || "")
        .eq("program_id", decodedCourseId)
        .eq("payment_status", "paid")
        .limit(1)
        .maybeSingle();

    if (!payment && !application) {
        // Not enrolled or paid or applied
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-gray-600">You must have an active application or enrollment to access this course.</p>
                <a href={`/${locale}/student/dashboard`} className="mt-4 font-semibold text-[#D4AF37] hover:underline">
                    Return to Dashboard
                </a>
            </div>
        );
    }

    // Get the program details from static data
    let program: any = programsData.find(
        p => p.id === decodedCourseId || 
             p.title.en === decodedCourseId || 
             p.title.ar === decodedCourseId
    );
    
    if (!program) {
        // Check if it's a university
        const uni = universitiesData.find(
            u => u.id === decodedCourseId || 
                 u.name === decodedCourseId
        );
        if (uni) {
            program = {
                id: uni.id,
                title: { en: uni.name, ar: uni.name },
                curriculum: [
                    {
                        module: "01",
                        title: { en: "University Introduction", ar: "مقدمة الجامعة" },
                        description: { en: "Welcome to the university orientation and introductory guidelines.", ar: "مرحبًا بك في التوجيه الجامعي." }
                    },
                    {
                        module: "02",
                        title: { en: "Campus Tour & Resources", ar: "جولة الحرم الجامعي" },
                        description: { en: "Explore the campus facilities and student resources available to you.", ar: "استكشف مرافق الحرم الجامعي." }
                    },
                    {
                        module: "03",
                        title: { en: "Enrollment & Next Steps", ar: "التسجيل والخطوات التالية" },
                        description: { en: "Complete your enrollment documentation and prepare for your first semester.", ar: "أكمل وثائق التسجيل الخاصة بك." }
                    }
                ]
            };
        }
    }

    if (!program) {
        // Course doesn't exist at all
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-[#0B2545]">Course Not Found</h2>
                <p className="mt-2 text-gray-600">The curriculum for this program is currently unavailable.</p>
                <a href={`/${locale}/student/dashboard`} className="mt-4 font-semibold text-[#D4AF37] hover:underline">
                    Return to Dashboard
                </a>
            </div>
        );
    }

    // Fetch student course progress
    // If the program was found by title, progress might be saved under its true ID
    const progressProgramId = program ? program.id : decodedCourseId;
    
    const { data: progress } = await supabase
        .from("course_progress")
        .select("*")
        .eq("student_id", user.id)
        .eq("program_id", progressProgramId)
        .maybeSingle();

    return (
        <CourseLearningUI 
            program={program} 
            initialProgress={progress} 
            studentId={user.id} 
            locale={locale} 
        />
    );
}
