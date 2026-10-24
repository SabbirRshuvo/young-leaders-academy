"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
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
    isEnrolled: initialIsEnrolled,
    locale = "en",
}: EnrollNowButtonProps) {
    const t = useTranslations("ProgramDetails");
    const isAr = locale === "ar";
    const [enrolled, setEnrolled] = useState(initialIsEnrolled);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    useEffect(() => {
        setEnrolled(initialIsEnrolled);
    }, [initialIsEnrolled]);

    // Client-side verification to detect logged-in user enrollment instantly
    useEffect(() => {
        let isMounted = true;
        async function checkClientEnrollment() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUserId = user?.id || session?.user?.id;
                if (currentUserId && program.id) {
                    const { data: enrollment } = await supabase
                        .from("enrollments")
                        .select("id")
                        .eq("user_id", currentUserId)
                        .eq("program_id", program.id)
                        .maybeSingle();

                    if (enrollment && isMounted) {
                        setEnrolled(true);
                    }
                }
            } catch (err) {
                console.warn("Client enrollment check:", err);
            }
        }
        checkClientEnrollment();
        return () => {
            isMounted = false;
        };
    }, [program.id, user?.id]);

    if (enrolled) {
        return (
            <Link
                href={`/${locale}/programs/${program.id}/play`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer"
            >
                <PlayCircle className="w-5 h-5 text-emerald-200" />
                <span>{isAr ? "متابعة التعلم (مسجل بالفعل)" : "Continue Learning"}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
        );
    }

    const handleOpenCheckout = () => {
        if (enrolled) {
            window.location.href = `/${locale}/programs/${program.id}/play`;
            return;
        }
        setIsCheckoutOpen(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpenCheckout}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group cursor-pointer"
            >
                <Lock className="w-5 h-5 text-[#0B2545]/70" />
                <span>{t("enrollNowMadaApplePay")}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* MADA & Apple Pay Checkout Modal */}
            <EnrollmentCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                program={program}
                user={user}
                locale={locale}
                onSuccess={() => {
                    setEnrolled(true);
                    setIsCheckoutOpen(false);
                }}
            />
        </>
    );
}
