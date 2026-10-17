"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Mail,
    Loader2,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    KeyRound
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const t = useTranslations("Auth");
    const locale = useLocale();
    const isAr = locale === "ar";

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error(t("emailError"));
            return;
        }

        try {
            setLoading(true);

            // Construct site URL for redirection
            const origin = typeof window !== "undefined" && window.location.origin
                ? window.location.origin
                : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

            const redirectUrl = `${origin}/${locale}/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: redirectUrl,
            });

            if (error) {
                console.error("Forgot password error:", error);
                toast.error(error.message);
                return;
            }

            setIsSubmitted(true);
            toast.success(t("resetLinkSent"));
        } catch (error: any) {
            console.error("Unexpected error during forgot password:", error);
            toast.error(t("generalError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center overflow-hidden py-10 px-4" dir={isAr ? "rtl" : "ltr"}>
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 relative">
                        {/* Header icon */}
                        <div className="mx-auto w-14 h-14 bg-[#0B2545]/5 rounded-2xl flex items-center justify-center mb-5 text-[#0B2545]">
                            <KeyRound className="w-7 h-7 text-[#D4AF37]" />
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">{t("forgotPasswordTitle")}</h1>
                            <p className="mt-2 text-gray-500 text-sm max-w-sm mx-auto">
                                {t("forgotPasswordDesc")}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-semibold text-[#0B2545] mb-2"
                                        >
                                            {t("emailLabel")}
                                        </label>
                                        <div className="relative">
                                            <Mail className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none`} />
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder={t("emailPlaceholder")}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading}
                                                required
                                                className={`w-full h-12 rounded-xl border border-gray-200 bg-white ${isAr ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"} text-sm text-[#0B2545] placeholder:text-gray-400 outline-none transition-all focus:border-[#0B2545] focus:ring-2 focus:ring-[#0B2545]/10 disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-full bg-[#0B2545] text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#0B2545]/90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {t("sendingResetLink")}
                                            </>
                                        ) : (
                                            <>
                                                {t("sendResetLink")}
                                                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-4 space-y-4"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0B2545]">
                                        {t("resetLinkSent")}
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        {locale === "ar"
                                            ? `لقد أرسلنا تعليمات استعادة كلمة المرور إلى ${email}. يرجى فحص صندوق الوارد ورسائل البريد غير المرغوب فيه (Spam).`
                                            : `We have sent password recovery instructions to ${email}. Please check your inbox and spam folder.`
                                        }
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-xs text-[#0B2545] hover:text-[#D4AF37] font-semibold underline underline-offset-4"
                                    >
                                        {t("requestNewLink")}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Back to Login link */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <Link
                                href={locale === "en" ? "/login" : `/${locale}/login`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37] transition-colors"
                            >
                                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4 text-[#0B2545]" />}
                                {t("backToLogin")}
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">{t("secureAccess")}</p>
                </motion.div>
            </div>
        </main>
    );
}
