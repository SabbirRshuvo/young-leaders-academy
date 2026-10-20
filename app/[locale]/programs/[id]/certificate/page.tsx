"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Printer, ArrowLeft, Award, Download } from "lucide-react";
import Link from "next/link";

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

        // Fetch User Profile with correct column names (display_name, first_name, last_name)
        const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name, first_name, last_name")
            .eq("id", session.user.id)
            .maybeSingle();
        setProfile(profileData);

        // Fetch Program
        const { data: progData } = await supabase
            .from("programs")
            .select("title")
            .eq("id", programId)
            .maybeSingle();
        setProgram(progData);

        // Fetch Progress to verify completion and get completion date
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
            setCompletionDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
        }

        setLoading(false);
    };

    const studentName = 
        profile?.display_name?.trim() ||
        (profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : null) ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Student Name";

    const programTitle = program?.title || "Leadership Excellence Program";

    const handleDownloadPDF = useCallback(async () => {
        setIsDownloading(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            const certificateElement = document.getElementById("certificate-card");
            if (!certificateElement) {
                console.error("Certificate card element '#certificate-card' not found");
                return;
            }

            const canvas = await html2canvas(certificateElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    // Force standard Hex colors on document root to avoid lab()/oklch() calculation
                    clonedDoc.documentElement.style.backgroundColor = "#ffffff";
                    clonedDoc.documentElement.style.color = "#000000";
                    clonedDoc.body.style.backgroundColor = "#ffffff";
                    clonedDoc.body.style.color = "#000000";

                    const clonedCard = clonedDoc.getElementById("certificate-card");
                    if (clonedCard) {
                        // Standard A4 landscape pixel dimensions at 96 DPI
                        clonedCard.style.width = "1123px";
                        clonedCard.style.height = "794px";
                        clonedCard.style.maxWidth = "1123px";
                        clonedCard.style.maxHeight = "794px";
                        clonedCard.style.boxShadow = "none";
                        clonedCard.style.filter = "none";
                        clonedCard.style.transform = "none";
                        clonedCard.style.backgroundColor = "#ffffff";

                        // Strip any potential CSS box-shadows or filters from descendants in clone
                        const allNodes = clonedCard.querySelectorAll("*");
                        allNodes.forEach((node) => {
                            const el = node as HTMLElement;
                            if (el.style) {
                                el.style.boxShadow = "none";
                                el.style.textShadow = "none";
                                el.style.filter = "none";
                            }
                        });
                    }
                }
            });

            const imgData = canvas.toDataURL("image/png");

            // Standard A4 Landscape: 297mm x 210mm
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

            const cleanFileName = `Certificate-${studentName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
            pdf.save(cleanFileName);
        } catch (error) {
            console.error("PDF generation failed", error);
        } finally {
            setIsDownloading(false);
        }
    }, [studentName]);

    // Alias for backward compatibility
    const downloadPDF = handleDownloadPDF;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0 print:py-0">
            {/* Non-printable controls */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link
                    href={`/${locale}/programs/${programId}/play`}
                    className="text-gray-600 hover:text-[#0B2545] flex items-center gap-2 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="bg-[#0B2545] hover:bg-[#07172c] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-70 cursor-pointer"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isDownloading ? "Generating PDF..." : "Download Clean PDF"}
                    </button>
                </div>
            </div>

            {/* Certificate Outer Container (holds drop-shadow outside the captured canvas) */}
            <div className="max-w-[1123px] mx-auto shadow-2xl rounded-sm overflow-hidden print:shadow-none print:max-w-none print:w-[1123px] print:h-[794px]">
                {/* 
                  Target Certificate Card:
                  Explicitly free of Tailwind v4 shadow/gradient classes that trigger lab()/oklch() parser crashes in html2canvas.
                  All colors, borders, and gradients are pure standard Hex and standard RGBA.
                */}
                <div
                    id="certificate-card"
                    className="w-full relative overflow-hidden print:w-[1123px] print:h-[794px]"
                    style={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        boxShadow: "none",
                        aspectRatio: "1.414 / 1",
                        position: "relative"
                    }}
                >
                    {/* Decorative Outer Borders (Pure RGBA, NO Tailwind opacity classes) */}
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: "16px",
                            right: "16px",
                            bottom: "16px",
                            left: "16px",
                            border: "2px solid rgba(212, 175, 55, 0.4)",
                            zIndex: 10
                        }}
                    />
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: "24px",
                            right: "24px",
                            bottom: "24px",
                            left: "24px",
                            border: "8px solid rgba(11, 37, 69, 0.05)",
                            zIndex: 10
                        }}
                    />
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            top: "32px",
                            right: "32px",
                            bottom: "32px",
                            left: "32px",
                            border: "1px solid rgba(212, 175, 55, 0.2)",
                            zIndex: 10
                        }}
                    />

                    {/* Corner Ornaments (Standard RGBA Gradients, NO modern CSS oklch/lab) */}
                    <div
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{
                            width: "128px",
                            height: "128px",
                            background: "linear-gradient(135deg, rgba(11, 37, 69, 0.1) 0%, rgba(11, 37, 69, 0) 100%)"
                        }}
                    />
                    <div
                        className="absolute bottom-0 right-0 pointer-events-none"
                        style={{
                            width: "128px",
                            height: "128px",
                            background: "linear-gradient(315deg, rgba(11, 37, 69, 0.1) 0%, rgba(11, 37, 69, 0) 100%)"
                        }}
                    />
                    <div
                        className="absolute top-0 right-0 pointer-events-none"
                        style={{
                            width: "96px",
                            height: "96px",
                            background: "linear-gradient(225deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 100%)"
                        }}
                    />
                    <div
                        className="absolute bottom-0 left-0 pointer-events-none"
                        style={{
                            width: "96px",
                            height: "96px",
                            background: "linear-gradient(45deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 100%)"
                        }}
                    />

                    {/* Certificate Body Content */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-between p-12 md:p-16 text-center"
                        style={{ zIndex: 20 }}
                    >
                        {/* Header: Academy Brand */}
                        <div className="flex flex-col items-center">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                                style={{ backgroundColor: "#0B2545" }}
                            >
                                <Award className="w-8 h-8" color="#D4AF37" stroke="#D4AF37" />
                            </div>
                            <h1
                                className="text-base md:text-lg font-bold tracking-[0.3em] uppercase"
                                style={{ color: "#0B2545" }}
                            >
                                Young Leaders Academy
                            </h1>
                        </div>

                        {/* Title */}
                        <div className="my-2">
                            <h2
                                className="text-4xl md:text-5xl lg:text-6xl font-bold italic tracking-tight"
                                style={{
                                    color: "#D4AF37",
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
                                }}
                            >
                                Certificate of Completion
                            </h2>
                            <p
                                className="text-sm md:text-base uppercase tracking-widest mt-4"
                                style={{ color: "#6B7280" }}
                            >
                                This is to proudly certify that
                            </p>
                        </div>

                        {/* Student Name */}
                        <div className="my-2">
                            <h3
                                className="text-3xl md:text-4xl lg:text-5xl font-bold pb-2 px-8 md:px-12 inline-block"
                                style={{
                                    color: "#0B2545",
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                    borderBottom: "2px solid #E5E7EB"
                                }}
                            >
                                {studentName}
                            </h3>
                            <p
                                className="text-sm md:text-base max-w-2xl leading-relaxed mt-4"
                                style={{ color: "#4B5563" }}
                            >
                                has successfully completed all requirements, modules, and assessments for the program:
                            </p>
                            <h4
                                className="text-xl md:text-2xl lg:text-3xl font-bold mt-2"
                                style={{ color: "#D4AF37" }}
                            >
                                {programTitle}
                            </h4>
                        </div>

                        {/* Footer Signatures and Official Seal */}
                        <div className="flex justify-between items-end w-full max-w-3xl mt-4 pt-4">
                            {/* Date */}
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="text-sm md:text-base font-bold mb-1 pb-1 w-36 md:w-48 text-center"
                                    style={{
                                        color: "#0B2545",
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                        borderBottom: "1px solid #9CA3AF"
                                    }}
                                >
                                    {completionDate}
                                </div>
                                <span
                                    className="text-[10px] md:text-xs uppercase tracking-widest"
                                    style={{ color: "#6B7280" }}
                                >
                                    Date of Completion
                                </span>
                            </div>

                            {/* Official Seal */}
                            <div
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shrink-0 relative"
                                style={{
                                    border: "4px solid #D4AF37",
                                    backgroundColor: "#ffffff"
                                }}
                            >
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        top: "4px",
                                        right: "4px",
                                        bottom: "4px",
                                        left: "4px",
                                        border: "1px dashed #D4AF37"
                                    }}
                                />
                                <span
                                    className="font-bold text-xs md:text-sm tracking-widest flex flex-col items-center"
                                    style={{
                                        color: "#0B2545",
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
                                    }}
                                >
                                    <span>YLA</span>
                                    <span style={{ fontSize: "8px", color: "#D4AF37" }}>CERTIFIED</span>
                                </span>
                            </div>

                            {/* Director Signature */}
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="text-base md:text-xl italic font-bold mb-1 pb-1 w-36 md:w-48 text-center"
                                    style={{
                                        color: "#0B2545",
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                        borderBottom: "1px solid #9CA3AF"
                                    }}
                                >
                                    Dr. James R.
                                </div>
                                <span
                                    className="text-[10px] md:text-xs uppercase tracking-widest"
                                    style={{ color: "#6B7280" }}
                                >
                                    Program Director
                                </span>
                            </div>
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
                    @page { 
                        size: A4 landscape; 
                        margin: 0; 
                    }
                    body { 
                        background: #ffffff !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                    }
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
