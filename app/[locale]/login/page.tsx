"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    GraduationCap,
    Users
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations("Auth");
    const locale = useLocale();

    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<"student" | "parent" | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push(locale === "en" ? "/student/dashboard" : `/${locale}/student/dashboard`);
                router.refresh();
            }
        };
        checkSession();
    }, [router, locale]);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            toast.error(t("enterEmailPass"));
            return;
        }

        try {
            setLoading(true);

            // 1. Authenticate with Supabase
            const {
                data: authData,
                error: authError,
            } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                console.error("Login error:", authError);
                const message = authError.message.toLowerCase();
                if (message.includes("invalid login credentials")) {
                    toast.error(t("incorrectCredentials"));
                } else if (message.includes("email not confirmed")) {
                    toast.error(t("emailNotConfirmed"));
                } else {
                    toast.error(authError.message);
                }
                return;
            }

            const user = authData.user;
            if (!user) {
                toast.error(t("unableToSignIn"));
                return;
            }

            // 2 & 3. STRICT ROLE VERIFICATION BLOCK
            // Fetch Actual DB Role immediately after auth
            const { data: userRoles } = await supabase
                .from("user_roles")
                .select("role_id")
                .eq("user_id", user.id);

            if (!userRoles || userRoles.length === 0) {
                await supabase.auth.signOut();
                toast.error("No role found for this account.");
                return;
            }

            const roleIds = userRoles.map((r) => r.role_id);
            const { data: roles } = await supabase
                .from("roles")
                .select("name")
                .in("id", roleIds);

            if (!roles || roles.length === 0) {
                await supabase.auth.signOut();
                toast.error("Invalid role configuration for this account.");
                return;
            }

            const dbRole = roles[0].name?.toLowerCase().trim();

            // 4. Strict Comparison & 5. Handle Mismatch
            // If selectedRole is empty (user bypassed role selection for direct login), skip the mismatch check.
            if (selectedRole && dbRole !== selectedRole) {
                await supabase.auth.signOut();
                toast.error(`Access Denied: This email is registered as a ${dbRole}. Please go back and select the correct role.`);
                return;
            }

            // --- Secondary Checks (Profile Active Status) ---
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("is_active")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError || (profile && profile.is_active === false)) {
                await supabase.auth.signOut();
                toast.error(t("accountInactive"));
                return;
            }

            // 6. Proceed to Dashboard
            toast.success(t("welcomeBackSuccess"));

            if (dbRole === "student") {
                router.push(locale === "en" ? `/student/dashboard` : `/${locale}/student/dashboard`);
            } else if (dbRole === "parent") {
                router.push(locale === "en" ? `/parent/dashboard` : `/${locale}/parent/dashboard`);
            } else {
                router.push(locale === "en" ? `/dashboard` : `/${locale}/dashboard`);
            }
            router.refresh();

        } catch (error) {
            console.error("Unexpected login error:", error);
            toast.error(t("generalError"));
            await supabase.auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push(locale === "en" ? `/forgot-password` : `/${locale}/forgot-password`);
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center overflow-hidden py-10 px-4">
            <div className="w-full max-w-lg">
                <AnimatePresence mode="wait">

                    {/* STEP 1 — ROLE SELECTION */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 space-y-8">
                                <div className="text-center">
                                    <div className="mx-auto w-14 h-14 rounded-2xl bg-navy flex items-center justify-center shadow-lg mb-5">
                                        <ShieldCheck className="w-7 h-7 text-gold" />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-navy">Join YLA</h1>
                                    <p className="mt-2 text-gray-500 text-sm">Select your account type to register</p>
                                </div>

                                <div className="flex items-center justify-center gap-6">
                                    <div
                                        onClick={() => setSelectedRole("student")}
                                        className={`flex-1 flex flex-col items-center justify-center gap-3 py-6 px-4 shadow-sm border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${selectedRole === "student" ? "border-gold bg-gold/5 scale-105 shadow-md" : "border-gray-200 hover:border-navy/20"}`}
                                    >
                                        <GraduationCap className={`w-10 h-10 ${selectedRole === "student" ? "text-gold" : "text-navy"}`} />
                                        <span className={`font-bold text-sm ${selectedRole === "student" ? "text-gold" : "text-navy"}`}>Student</span>
                                    </div>
                                    <div
                                        onClick={() => setSelectedRole("parent")}
                                        className={`flex-1 flex flex-col items-center justify-center gap-3 py-6 px-4 shadow-sm border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${selectedRole === "parent" ? "border-gold bg-gold/5 scale-105 shadow-md" : "border-gray-200 hover:border-navy/20"}`}
                                    >
                                        <Users className={`w-10 h-10 ${selectedRole === "parent" ? "text-gold" : "text-navy"}`} />
                                        <span className={`font-bold text-sm ${selectedRole === "parent" ? "text-gold" : "text-navy"}`}>Parent</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedRole) {
                                                toast.error("Please select an account type to continue.");
                                                return;
                                            }
                                            router.push(locale === "en" ? `/sign-up?role=${selectedRole}` : `/${locale}/sign-up?role=${selectedRole}`);
                                        }}
                                        className="w-full h-12 rounded-full bg-navy text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-navy/90 transition-all shadow-sm"
                                    >
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <div className="text-center mt-2">
                                        <span className="text-sm text-gray-500 font-medium">Already have an account? </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedRole(null); // Clear role for direct login
                                                setStep(2); // Go to standard login form
                                            }}
                                            className="text-sm font-bold text-navy hover:text-gold transition-colors cursor-pointer"
                                        >
                                            Log In
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 — LOGIN FORM */}
                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 relative">

                                <button
                                    onClick={() => setStep(1)}
                                    className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                <div className="text-center mb-8 mt-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-navy">{t("welcomeBack")}</h1>
                                    <p className="mt-2 text-gray-500 text-sm">{selectedRole ? `Sign in to your ${selectedRole} account` : 'Sign in to your account'}</p>
                                </div>

                                <form
                                    onSubmit={handleLogin}
                                    className="space-y-5"
                                >

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-semibold text-navy mb-2"
                                        >{t("emailLabel")}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder={t("emailPlaceholder")}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading}
                                                className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-navy placeholder:text-gray-400 outline-none transition-all focus:border-navy focus:ring-2 focus:ring-navy/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label
                                                htmlFor="password"
                                                className="block text-sm font-semibold text-navy"
                                            >{t("passwordLabel")}</label>
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={loading}
                                                className="text-xs font-semibold text-navy hover:text-gold transition-colors"
                                            >{t("forgotPassword")}</button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                placeholder={t("passwordPlaceholder")}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={loading}
                                                className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-12 pr-12 text-sm text-navy placeholder:text-gray-400 outline-none transition-all focus:border-navy focus:ring-2 focus:ring-navy/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                disabled={loading}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Login button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-full bg-navy text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-navy/90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" />{t("signingIn")}</>
                                        ) : (
                                            <>{t("signInButton")}<ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="flex items-center gap-4 my-7">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span className="text-xs text-gray-400 font-medium text-center">{t("newTo")}</span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>

                                {/* Register */}
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full h-12 rounded-full border border-navy text-navy font-bold text-sm hover:bg-navy hover:text-white transition-all"
                                >{t("createAccount")}</button>
                            </div>

                            <p className="text-center text-xs text-gray-400 mt-6">{t("secureAccess")}</p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </main>
    );
}