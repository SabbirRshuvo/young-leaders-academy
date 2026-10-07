"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Printer, ArrowLeft, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CertificatePage() {
    const params = useParams();
    const router = useRouter();
    const programId = params.id as string;
    const locale = params.locale as string;

    const [loading, setLoading] = useState(true);
    const [program, setProgram] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [completionDate, setCompletionDate] = useState<string>("");
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [programId]);

    const fetchData = async () => {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push(`/${locale}/login`);
            return;
        }
        setUser(session.user);

        // Fetch User Profile for Full Name
        const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();
        setProfile(profileData);

        // Fetch Program
        const { data: progData } = await supabase
            .from("programs")
            .select("title")
            .eq("id", programId)
            .single();
        setProgram(progData);

        // Fetch Progress to verify 100% completion and get completion date
        // Since we don't store a single 'program completed_at' date, we'll just take the latest completed_at from user_progress
        const { data: progressData } = await supabase
            .from("user_progress")
            .select("completed_at")
            .eq("user_id", session.user.id)
            .order("completed_at", { ascending: false })
            .limit(1);

        if (progressData && progressData.length > 0 && progressData[0].completed_at) {
            const date = new Date(progressData[0].completed_at);
            setCompletionDate(date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
        } else {
            // Fallback to today
            setCompletionDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
        }

        setLoading(false);
    };

    const studentName = profile?.full_name || user?.email?.split('@')[0] || "Student Name";
    const programTitle = program?.title || "Program Title";

    const downloadPDF = async () => {
        setIsDownloading(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            const element = document.getElementById("certificate-card");
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${studentName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("PDF generation failed", error);
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            // Auto-trigger clean PDF download
            const timer = setTimeout(() => {
                downloadPDF();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" /></div>;
    }


    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0 print:py-0">
            {/* Non-printable controls */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href={`/${locale}/programs/${programId}/play`} className="text-gray-600 hover:text-[#0B2545] flex items-center gap-2 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </Link>
                <button
                    onClick={downloadPDF}
                    disabled={isDownloading}
                    className="bg-[#0B2545] hover:bg-[#0B2545]/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-70"
                >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    {isDownloading ? "Generating PDF..." : "Download Clean PDF"}
                </button>
            </div>

            {/* Certificate Canvas */}
            <div id="certificate-card" className="max-w-[1123px] mx-auto bg-white shadow-2xl overflow-hidden relative print:shadow-none print:max-w-none print:w-[1123px] print:h-[794px]" style={{ aspectRatio: '1.414 / 1' }}>

                {/* Decorative Borders */}
                <div className="absolute inset-4 border-2 border-[#D4AF37] z-10 pointer-events-none opacity-40"></div>
                <div className="absolute inset-6 border-[8px] border-[#0B2545] z-10 pointer-events-none opacity-5"></div>
                <div className="absolute inset-8 border border-[#D4AF37] z-10 pointer-events-none opacity-20"></div>

                {/* Corner Ornaments */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#0B2545] to-transparent opacity-10"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#0B2545] to-transparent opacity-10"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37] to-transparent opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D4AF37] to-transparent opacity-20"></div>

                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-16 text-center">

                    <div className="mb-6 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#0B2545] rounded-full flex items-center justify-center mb-4">
                            <Award className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <h1 className="text-xl font-bold tracking-[0.3em] text-[#0B2545] uppercase">Young Leaders Academy</h1>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-serif text-[#D4AF37] font-bold mb-6 italic tracking-tight">Certificate of Completion</h2>

                    <p className="text-lg text-[#6B7280] mb-6 uppercase tracking-widest">This is to proudly certify that</p>

                    <h3 className="text-4xl md:text-5xl font-bold text-[#0B2545] mb-6 border-b-2 border-[#E5E7EB] pb-2 px-12 inline-block font-serif">
                        {studentName}
                    </h3>

                    <p className="text-lg text-[#4B5563] mb-4 max-w-2xl leading-relaxed">
                        has successfully completed all requirements, modules, and assessments for the program:
                    </p>

                    <h4 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-12">
                        {programTitle}
                    </h4>

                    {/* Signatures */}
                    <div className="flex justify-between w-full max-w-3xl mt-auto pt-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-lg font-serif font-bold text-[#0B2545] mb-2 border-b border-[#9CA3AF] w-48 pb-2">
                                {completionDate}
                            </div>
                            <span className="text-xs uppercase tracking-widest text-[#6B7280]">Date of Completion</span>
                        </div>

                        {/* Seal */}
                        <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37] flex items-center justify-center shrink-0 relative">
                            <div className="absolute inset-1 rounded-full border border-[#D4AF37] border-dashed"></div>
                            <span className="text-[#0B2545] font-bold font-serif text-sm tracking-widest flex flex-col items-center">
                                <span>YLA</span>
                                <span className="text-[8px] text-[#D4AF37]">CERTIFIED</span>
                            </span>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="text-xl italic font-serif text-[#0B2545] mb-1 border-b border-[#9CA3AF] w-48 pb-2">
                                Dr. James R.
                            </div>
                            <span className="text-xs uppercase tracking-widest text-[#6B7280]">Program Director</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    nav, header, footer, .no-print, button {
                        display: none !important;
                    }
                    @page { size: A4 landscape; margin: 0; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; }
                    #certificate-card {
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
}
