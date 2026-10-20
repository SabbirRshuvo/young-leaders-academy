"use client";

import React, { useState } from "react";
import { ArrowRight, Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import EnrollmentCheckoutModal from "@/components/checkout/EnrollmentCheckoutModal";

interface EnrollNowButtonProps {
    program: {
        id: string;
        title: string;
        price: number;
        category?: string;
        duration?: string;
    };
    user?: {
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
    } | null;
    isEnrolled: boolean;
    locale?: string;
}

export default function EnrollNowButton({
    program,
    user,
    isEnrolled,
    locale = "en",
}: EnrollNowButtonProps) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const isAr = locale === "ar";

    if (isEnrolled) {
        return (
            <Link
                href={`/${locale}/programs/${program.id}/play`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer"
            >
                <PlayCircle className="w-5 h-5 text-emerald-200" />
                <span>{isAr ? "متابعة الدورة" : "Access Program"}</span>
                <ArrowRight className={`w-5 h-5 transition-transform ${isAr ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"}`} />
            </Link>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer"
            >
                <Lock className="w-5 h-5 text-[#0B2545]/70" />
                <span>{isAr ? "سجل الآن (مدى / Apple Pay)" : "Enroll Now (MADA / Apple Pay)"}</span>
                <ArrowRight className={`w-5 h-5 transition-transform ${isAr ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"}`} />
            </button>

            {/* MADA & Apple Pay Checkout Modal */}
            <EnrollmentCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                program={program}
                user={user}
                locale={locale}
                onSuccess={() => {
                    setIsCheckoutOpen(false);
                }}
            />
        </>
    );
}
