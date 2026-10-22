"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("Auth");
    const locale = useLocale();
    const isAr = locale === "ar";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [verifyingSession, setVerifyingSession] = useState(true);
    const [hasValidSession, setHasValidSession] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkRecoveryToken = async () => {
            try {
                // 1. Check if PKCE code or OTP token_hash parameter is present in URL
                const code = searchParams.get("code");
                const token_hash = searchParams.get("token_hash");
                const type = searchParams.get("type") as any;

                if (code) {
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (!exchangeError) {
                        if (isMounted) {
                            setHasValidSession(true);
                            setVerifyingSession(false);
                        }
                        return;
                    }
                } else if (token_hash && type) {
                    const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash, type });
                    if (!verifyError) {
                        if (isMounted) {
                            setHasValidSession(true);
                            setVerifyingSession(false);
                        }
                        return;
                    }
                }

                // 2. Check if active session or recovery session exists
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    if (isMounted) {
                        setHasValidSession(true);
                        setVerifyingSession(false);
                    }
                    return;
                }

                // 3. Listen to Auth State change (Supabase handles URL hash automatically)
                const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
                        if (isMounted) {
                            setHasValidSession(true);
                            setVerifyingSession(false);
                        }
                    }
                });

                // Short delay to allow hash parsing
                setTimeout(async () => {
                    const { data: { session: delayedSession } } = await supabase.auth.getSession();
                    if (isMounted) {
                        if (delayedSession) {
                            setHasValidSession(true);
                        } else {
                            // If no session after hash parsing, flag warning
                            setHasValidSession(false);
                        }
                        setVerifyingSession(false);
                    }
                }, 1000);

                return () => {
                    authListener.subscription.unsubscribe();
                };
            } catch (err) {
                console.error("Error verifying recovery session:", err);
                if (isMounted) {
                    setHasValidSession(false);
                    setVerifyingSession(false);
                }
            }
        };

        checkRecoveryToken();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!password) {
            toast.error(t("passwordError"));
            return;
        }

        if (password.length < 6) {
            toast.error(t("passwordPlaceholderSignUp"));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t("passwordMatchError"));
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                console.error("Password update error:", error);
                toast.error(error.message);
                return;
            }

            setIsSuccess(true);
            toast.success(t("passwordUpdatedSuccess"));

            // Sign out to ensure clean state and prompt login with new credentials
            await supabase.auth.signOut();

            // Redirect to login after a brief moment
            setTimeout(() => {
                router.push(locale === "en" ? "/login" : `/${locale}/login`);
            }, 2500);

        } catch (error: any) {
            console.error("Unexpected error updating password:", error);
            toast.error(t("generalError"));
        } finally {
            setLoading(false);
        }
    };

    if (verifyingSession) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
                <p className="text-sm font-medium text-gray-500">
                    {isAr ? "جاري التحقق من رابط الأمان..." : "Verifying secure recovery link..."}
                </p>
            </div>
        );
    }

    if (!hasValidSession && !isSuccess) {
        return (
            <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[#0B2545]">
                    {t("invalidOrExpiredLink")}
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {isAr
                        ? "انتهت صلاحية هذا الرابط أو تم استخدامه مسبقاً. يمكنك طلب رابط جديد في أي وقت."
                        : "This password recovery link is either expired, already used, or invalid. Please request a new link."
                    }
                </p>
                <div className="pt-2">
                    <Link
                        href={locale === "en" ? "/forgot-password" : `/${locale}/forgot-password`}
                        className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#0B2545] text-white font-bold text-sm hover:bg-[#0B2545]/90 transition-all shadow-sm"
                    >
                        {t("requestNewLink")}
                    </Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[#0B2545]">
                    {isAr ? "تم تحديث كلمة المرور!" : "Password Updated!"}
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {t("passwordUpdatedSuccess")}
                </p>
                <div className="pt-2">
                    <Link
                        href={locale === "en" ? "/login" : `/${locale}/login`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37] transition-colors"
                    >
                        {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        {t("signIn")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#0B2545] mb-2"
                >
                    {t("newPassword")}
                </label>
                <div className="relative">
                    <Lock className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none`} />
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t("newPasswordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className={`w-full h-12 rounded-xl border border-gray-200 bg-white ${isAr ? "pr-12 pl-12 text-right" : "pl-12 pr-12 text-left"} text-sm text-[#0B2545] placeholder:text-gray-400 outline-none transition-all focus:border-[#0B2545] focus:ring-2 focus:ring-[#0B2545]/10 disabled:bg-gray-50 disabled:cursor-not-allowed`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className={`absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B2545] transition-colors`}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Confirm New Password */}
            <div>
                <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-[#0B2545] mb-2"
                >
                    {t("confirmNewPassword")}
                </label>
                <div className="relative">
                    <Lock className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none`} />
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t("confirmNewPasswordPlaceholder")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                        className={`w-full h-12 rounded-xl border border-gray-200 bg-white ${isAr ? "pr-12 pl-12 text-right" : "pl-12 pr-12 text-left"} text-sm text-[#0B2545] placeholder:text-gray-400 outline-none transition-all focus:border-[#0B2545] focus:ring-2 focus:ring-[#0B2545]/10 disabled:bg-gray-50 disabled:cursor-not-allowed`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        disabled={loading}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className={`absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B2545] transition-colors`}
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Password strength notice */}
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                {isAr
                    ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."
                    : "Password must be at least 6 characters long."
                }
            </p>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#0B2545] text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#0B2545]/90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("updatingPassword")}
                    </>
                ) : (
                    <>
                        {t("updatePasswordBtn")}
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                )}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    const t = useTranslations("Auth");
    const locale = useLocale();
    const isAr = locale === "ar";

    return (
        <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center overflow-hidden py-10 px-4" dir="ltr">
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 relative">
                        {/* Header icon */}
                        <div className="mx-auto w-14 h-14 bg-[#0B2545]/5 rounded-2xl flex items-center justify-center mb-5 text-[#0B2545]">
                            <Lock className="w-7 h-7 text-[#D4AF37]" />
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">{t("resetPasswordTitle")}</h1>
                            <p className="mt-2 text-gray-500 text-sm max-w-sm mx-auto">
                                {t("resetPasswordDesc")}
                            </p>
                        </div>

                        <Suspense fallback={
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>

                        {/* Back to Login link */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <Link
                                href={locale === "en" ? "/login" : `/${locale}/login`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B2545] hover:text-[#D4AF37] transition-colors"
                            >
                                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
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
