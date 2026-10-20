"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, Award, Download } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

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

    const programTitle = typeof program?.title === "string"
        ? program.title
        : (program?.title?.en || program?.title?.ar || "Leadership Excellence Program");

    const handleDownloadPDF = useCallback(async () => {
        setIsDownloading(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            const certificateElement = document.getElementById("certificate-card");
            if (!certificateElement) {
                console.error("Certificate card element '#certificate-card' not found");
                toast.error("Certificate element not found");
                return;
            }

            const canvas = await html2canvas(certificateElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    // 1. Remove all external stylesheets to eliminate Tailwind v4 oklch() / lab() color parser errors
                    const stylesheets = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
                    stylesheets.forEach((s) => s.remove());

                    // 2. Inject clean, standard CSS reset into clonedDoc
                    const cleanStyle = clonedDoc.createElement("style");
                    cleanStyle.textContent = `
                        *, *::before, *::after {
                            box-sizing: border-box !important;
                            border-color: #E5E7EB !important;
                            outline-color: transparent !important;
                            text-decoration-color: currentColor !important;
                            box-shadow: none !important;
                            text-shadow: none !important;
                            filter: none !important;
                        }
                        html, body {
                            background-color: #FFFFFF !important;
                            color: #000000 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 1123px !important;
                            height: 794px !important;
                            font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
                        }
                    `;
                    clonedDoc.head.appendChild(cleanStyle);

                    // 3. Isolate strictly #certificate-card in the cloned document body
                    const clonedCard = clonedDoc.getElementById("certificate-card");
                    if (clonedCard) {
                        clonedDoc.body.innerHTML = "";
                        clonedDoc.body.style.backgroundColor = "#FFFFFF";
                        clonedDoc.body.style.margin = "0";
                        clonedDoc.body.style.padding = "0";
                        clonedDoc.body.appendChild(clonedCard);

                        // Exact standard A4 landscape dimensions (1123px x 794px at 96 DPI)
                        clonedCard.style.width = "1123px";
                        clonedCard.style.height = "794px";
                        clonedCard.style.minWidth = "1123px";
                        clonedCard.style.minHeight = "794px";
                        clonedCard.style.maxWidth = "1123px";
                        clonedCard.style.maxHeight = "794px";
                        clonedCard.style.position = "relative";
                        clonedCard.style.margin = "0";
                        clonedCard.style.padding = "0";
                        clonedCard.style.boxShadow = "none";
                        clonedCard.style.filter = "none";
                        clonedCard.style.transform = "none";
                        clonedCard.style.backgroundColor = "#FFFFFF";
                        clonedCard.style.color = "#000000";
                        clonedCard.style.overflow = "hidden";

                        // Strip any remaining shadows, filters, or modern CSS from all descendants
                        const allNodes = clonedCard.querySelectorAll("*");
                        allNodes.forEach((node) => {
                            const el = node as HTMLElement;
                            el.style.boxShadow = "none";
                            el.style.textShadow = "none";
                            el.style.filter = "none";
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
            toast.success("Certificate downloaded successfully!");
        } catch (error) {
            console.error("PDF generation failed", error);
            toast.error("PDF generation failed. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    }, [studentName]);

    // Backward compatibility alias
    const downloadPDF = handleDownloadPDF;

    if (loading) {
        return (
            <div
                className="flex justify-center items-center min-h-screen"
                style={{ backgroundColor: "#F9FAFB" }}
            >
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#D4AF37" }} />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-10 px-4 print:p-0 print:py-0"
            style={{ backgroundColor: "#F3F4F6" }}
        >
            {/* Non-printable controls */}
            <div
                className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden"
            >
                <Link
                    href={`/${locale}/programs/${programId}/play`}
                    className="flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    style={{
                        backgroundColor: "#FFFFFF",
                        color: "#0B2545",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                    }}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-70 cursor-pointer"
                        style={{
                            backgroundColor: "#0B2545",
                            color: "#FFFFFF",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        }}
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isDownloading ? "Generating PDF..." : "Download Clean PDF"}
                    </button>
                </div>
            </div>

            {/* Certificate Outer Container (holds drop-shadow outside the captured canvas) */}
            <div
                className="max-w-[1123px] mx-auto rounded-sm overflow-hidden print:max-w-none print:w-[1123px] print:h-[794px]"
                style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
            >
                {/* 
                  Target Certificate Card:
                  Strictly 100% pure Hex (#FFFFFF, #0B2545, #D4AF37) and standard RGBA.
                  Zero Tailwind v4 color/gradient/opacity utility classes that could produce modern CSS lab()/oklch().
                */}
                <div
                    id="certificate-card"
                    style={{
                        width: "100%",
                        aspectRatio: "1.414 / 1",
                        position: "relative",
                        backgroundColor: "#FFFFFF",
                        color: "#000000",
                        boxShadow: "none",
                        overflow: "hidden"
                    }}
                >
                    {/* Decorative Outer Borders (Pure Standard RGBA) */}
                    <div
                        style={{
                            position: "absolute",
                            pointerEvents: "none",
                            top: "16px",
                            right: "16px",
                            bottom: "16px",
                            left: "16px",
                            border: "2px solid rgba(212, 175, 55, 0.4)",
                            zIndex: 10
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            pointerEvents: "none",
                            top: "24px",
                            right: "24px",
                            bottom: "24px",
                            left: "24px",
                            border: "8px solid rgba(11, 37, 69, 0.05)",
                            zIndex: 10
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            pointerEvents: "none",
                            top: "32px",
                            right: "32px",
                            bottom: "32px",
                            left: "32px",
                            border: "1px solid rgba(212, 175, 55, 0.2)",
                            zIndex: 10
                        }}
                    />

                    {/* Corner Ornaments (Standard RGBA Gradients) */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "128px",
                            height: "128px",
                            pointerEvents: "none",
                            background: "linear-gradient(135deg, rgba(11, 37, 69, 0.1) 0%, rgba(11, 37, 69, 0) 100%)"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: "128px",
                            height: "128px",
                            pointerEvents: "none",
                            background: "linear-gradient(315deg, rgba(11, 37, 69, 0.1) 0%, rgba(11, 37, 69, 0) 100%)"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "96px",
                            height: "96px",
                            pointerEvents: "none",
                            background: "linear-gradient(225deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 100%)"
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "96px",
                            height: "96px",
                            pointerEvents: "none",
                            background: "linear-gradient(45deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 100%)"
                        }}
                    />

                    {/* Certificate Body Content */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "48px 56px",
                            textAlign: "center",
                            zIndex: 20
                        }}
                    >
                        {/* Header: Academy Brand */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "9999px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "12px",
                                    backgroundColor: "#0B2545"
                                }}
                            >
                                <Award style={{ width: "32px", height: "32px", color: "#D4AF37", stroke: "#D4AF37", fill: "none" }} />
                            </div>
                            <h1
                                style={{
                                    fontSize: "17px",
                                    fontWeight: 700,
                                    letterSpacing: "0.25em",
                                    textTransform: "uppercase",
                                    color: "#0B2545",
                                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    margin: 0
                                }}
                            >
                                Young Leaders Academy
                            </h1>
                        </div>

                        {/* Title */}
                        <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                            <h2
                                style={{
                                    fontSize: "46px",
                                    fontWeight: 700,
                                    fontStyle: "italic",
                                    letterSpacing: "-0.02em",
                                    color: "#D4AF37",
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                    margin: 0,
                                    lineHeight: 1.15
                                }}
                            >
                                Certificate of Completion
                            </h2>
                            <p
                                style={{
                                    fontSize: "14px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.15em",
                                    marginTop: "12px",
                                    color: "#6B7280",
                                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    margin: "12px 0 0 0"
                                }}
                            >
                                This is to proudly certify that
                            </p>
                        </div>

                        {/* Student Name */}
                        <div style={{ marginTop: "4px", marginBottom: "4px" }}>
                            <h3
                                style={{
                                    fontSize: "36px",
                                    fontWeight: 700,
                                    paddingBottom: "8px",
                                    paddingLeft: "32px",
                                    paddingRight: "32px",
                                    display: "inline-block",
                                    color: "#0B2545",
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                    borderBottom: "2px solid #E5E7EB",
                                    margin: 0
                                }}
                            >
                                {studentName}
                            </h3>
                            <p
                                style={{
                                    fontSize: "15px",
                                    maxWidth: "600px",
                                    lineHeight: 1.6,
                                    marginTop: "12px",
                                    color: "#4B5563",
                                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    margin: "12px auto 0 auto"
                                }}
                            >
                                has successfully completed all requirements, modules, and assessments for the program:
                            </p>
                            <h4
                                style={{
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    marginTop: "8px",
                                    color: "#D4AF37",
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                    margin: "8px 0 0 0"
                                }}
                            >
                                {programTitle}
                            </h4>
                        </div>

                        {/* Footer Signatures and Official Seal */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                width: "100%",
                                maxWidth: "750px",
                                marginTop: "16px",
                                paddingTop: "16px"
                            }}
                        >
                            {/* Date */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div
                                    style={{
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        marginBottom: "4px",
                                        paddingBottom: "4px",
                                        width: "160px",
                                        textAlign: "center",
                                        color: "#0B2545",
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                        borderBottom: "1px solid #9CA3AF"
                                    }}
                                >
                                    {completionDate}
                                </div>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.15em",
                                        color: "#6B7280",
                                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                    }}
                                >
                                    Date of Completion
                                </span>
                            </div>

                            {/* Official Seal */}
                            <div
                                style={{
                                    width: "88px",
                                    height: "88px",
                                    borderRadius: "9999px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    position: "relative",
                                    border: "4px solid #D4AF37",
                                    backgroundColor: "#FFFFFF"
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        borderRadius: "9999px",
                                        top: "4px",
                                        right: "4px",
                                        bottom: "4px",
                                        left: "4px",
                                        border: "1px dashed #D4AF37"
                                    }}
                                />
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: "13px",
                                        letterSpacing: "0.1em",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        color: "#0B2545",
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
                                    }}
                                >
                                    <span>YLA</span>
                                    <span style={{ fontSize: "8px", color: "#D4AF37", letterSpacing: "0.15em" }}>CERTIFIED</span>
                                </span>
                            </div>

                            {/* Director Signature */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div
                                    style={{
                                        fontSize: "19px",
                                        fontStyle: "italic",
                                        fontWeight: 700,
                                        marginBottom: "4px",
                                        paddingBottom: "4px",
                                        width: "160px",
                                        textAlign: "center",
                                        color: "#0B2545",
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                        borderBottom: "1px solid #9CA3AF"
                                    }}
                                >
                                    Dr. James R.
                                </div>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.15em",
                                        color: "#6B7280",
                                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                    }}
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
                        background: #FFFFFF !important; 
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
