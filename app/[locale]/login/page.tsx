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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // i want to push the code in my github.

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .maybeSingle();

                let dbRole = profile?.role?.toLowerCase().trim() || "";

                // 2. Fallback to user_roles if profiles.role is missing
                if (!dbRole) {
                    const { data: userRoles } = await supabase
                        .from("user_roles")
                        .select("role_id")
                        .eq("user_id", session.user.id);

                    if (userRoles && userRoles.length > 0) {
                        const { data: roles } = await supabase
                            .from("roles")
                            .select("name")
                            .eq("id", userRoles[0].role_id)
                            .single();
                        if (roles) {
                            dbRole = roles.name?.toLowerCase().trim() || "";
                        }
                    }
                }

                // 3. Ultimate fallback to metadata (guaranteed for admin)
                if (!dbRole) {
                    dbRole = (session.user.user_metadata?.role || session.user.app_metadata?.role || "").toLowerCase().trim();
                }

                if (session.user.email === 'adminsabbir@gmail.com' || dbRole === "admin") {
                    router.push(locale === "en" ? `/admin/dashboard` : `/${locale}/admin/dashboard`);
                    return;
                } else if (dbRole === "parent") {
                    router.push(locale === "en" ? `/parent/dashboard` : `/${locale}/parent/dashboard`);
                    return;
                } else {
                    router.push(locale === "en" ? `/student/dashboard` : `/${locale}/student/dashboard`);
                    return;
                }
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
            toast.loading("Redirecting...", { id: "redirecting" });

            // 1. Try fetching role from profiles table (per requirements)
            const { data: profileRole } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();

            let dbRole = profileRole?.role?.toLowerCase().trim() || "";

            // 2. Fallback to user_roles if profiles.role is missing
            if (!dbRole) {
                const { data: userRoles } = await supabase
                    .from("user_roles")
                    .select("role_id")
                    .eq("user_id", user.id);

                if (userRoles && userRoles.length > 0) {
                    const roleIds = userRoles.map((r) => r.role_id);
                    const { data: roles } = await supabase
                        .from("roles")
                        .select("name")
                        .in("id", roleIds);

                    if (roles && roles.length > 0) {
                        dbRole = roles[0].name?.toLowerCase().trim() || "";
                    }
                }
            }

            // 3. Ultimate fallback to metadata (guaranteed for admin)
            if (!dbRole) {
                dbRole = (user.user_metadata?.role || user.app_metadata?.role || "").toLowerCase().trim();
            }

            if (!dbRole) {
                await supabase.auth.signOut();
                toast.dismiss("redirecting");
                toast.error("No role found for this account.");
                return;
            }

            // Check if profile is active
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("is_active")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError || (profile && profile.is_active === false)) {
                await supabase.auth.signOut();
                toast.dismiss("redirecting");
                toast.error(t("accountInactive"));
                return;
            }

            // 5. Proceed to Dashboard

            toast.dismiss("redirecting");
            toast.success(t("welcomeBackSuccess"));

            if (user.email === 'adminsabbir@gmail.com' || dbRole === "admin") {
                router.push(locale === "en" ? `/admin/dashboard` : `/${locale}/admin/dashboard`);
                return;
            } else if (dbRole === "parent") {
                router.push(locale === "en" ? `/parent/dashboard` : `/${locale}/parent/dashboard`);
                return;
            } else {
                router.push(locale === "en" ? `/student/dashboard` : `/${locale}/student/dashboard`);
                return;
            }

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

                    {/* LOGIN FORM */}
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -80 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 relative">
                            <div className="text-center mb-8 mt-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-navy">{t("welcomeBack")}</h1>
                                <p className="mt-2 text-gray-500 text-sm">Sign in to your account</p>
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
                                onClick={() => router.push(locale === "en" ? '/sign-up' : `/${locale}/sign-up`)}
                                className="w-full h-12 rounded-full border border-navy text-navy font-bold text-sm hover:bg-navy hover:text-white transition-all"
                            >{t("createAccount")}</button>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-6">{t("secureAccess")}</p>
                    </motion.div>

                </AnimatePresence>
            </div>
        </main>
    );
}