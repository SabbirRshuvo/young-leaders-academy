"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            /*
             * ---------------------------------------------------------------
             * 1. Sign in with Supabase Auth
             * ---------------------------------------------------------------
             */

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
                    toast.error("Incorrect email or password.");
                } else if (message.includes("email not confirmed")) {
                    toast.error(
                        "Please confirm your email address before logging in."
                    );
                } else {
                    toast.error(authError.message);
                }

                return;
            }

            const user = authData.user;

            if (!user) {
                toast.error(
                    "Unable to sign you in. Please try again."
                );

                return;
            }

            /*
             * ---------------------------------------------------------------
             * 2. Check the user's profile
             * ---------------------------------------------------------------
             *
             * profiles contains:
             *
             * id
             * first_name
             * last_name
             * display_name
             * phone
             * avatar_url
             * preferred_language
             * is_active
             * created_at
             * updated_at
             * country
             * date_of_birth
             *
             * There is NO role column here.
             */

            const {
                data: profile,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("id, is_active")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError) {
                console.error(
                    "Profile lookup error:",
                    profileError
                );

                toast.error(
                    "We couldn't verify your account."
                );

                await supabase.auth.signOut();

                return;
            }

            /*
             * ---------------------------------------------------------------
             * 3. Make sure the account is active
             * ---------------------------------------------------------------
             */

            if (profile && profile.is_active === false) {
                toast.error(
                    "Your account is currently inactive. Please contact support."
                );

                await supabase.auth.signOut();

                return;
            }

            /*
             * ---------------------------------------------------------------
             * 4. Get the user's role from user_roles
             * ---------------------------------------------------------------
             *
             * user_roles:
             *
             * user_id
             * role_id
             * created_at
             *
             * We retrieve the role_id belonging to this authenticated user.
             */

            const {
                data: userRoles,
                error: userRoleError,
            } = await supabase
                .from("user_roles")
                .select("role_id, created_at")
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: true,
                });

            if (userRoleError) {
                console.error(
                    "User role lookup error:",
                    userRoleError
                );

                toast.error(
                    "We couldn't determine your account type."
                );

                await supabase.auth.signOut();

                return;
            }

            /*
             * No role assigned to this user.
             */

            if (!userRoles || userRoles.length === 0) {
                console.error(
                    "No role assigned to user:",
                    user.id
                );

                toast.error(
                    "Your account does not have an assigned role. Please contact support."
                );

                await supabase.auth.signOut();

                return;
            }

            /*
             * ---------------------------------------------------------------
             * 5. Resolve role_id against the roles table
             * ---------------------------------------------------------------
             *
             * roles:
             *
             * id
             * description
             * name
             * created_at
             */

            const roleIds = userRoles
                .map((item) => item.role_id)
                .filter(Boolean);

            if (roleIds.length === 0) {
                toast.error(
                    "Your account does not have a valid assigned role."
                );

                await supabase.auth.signOut();

                return;
            }

            const {
                data: roles,
                error: rolesError,
            } = await supabase
                .from("roles")
                .select("id, name, description")
                .in("id", roleIds);

            if (rolesError) {
                console.error(
                    "Roles lookup error:",
                    rolesError
                );

                toast.error(
                    "We couldn't determine your account type."
                );

                await supabase.auth.signOut();

                return;
            }

            if (!roles || roles.length === 0) {
                console.error(
                    "No matching roles found for user:",
                    user.id
                );

                toast.error(
                    "Your assigned account role could not be found."
                );

                await supabase.auth.signOut();

                return;
            }

            /*
             * ---------------------------------------------------------------
             * 6. Find the supported role
             * ---------------------------------------------------------------
             *
             * We support:
             *
             * student
             * parent
             *
             * The role name is normalized so these all work:
             *
             * Student
             * STUDENT
             * student
             */

            const normalizedRoles = roles.map((role) => ({
                ...role,
                normalizedName:
                    role.name?.trim().toLowerCase(),
            }));

            const studentRole = normalizedRoles.find(
                (role) =>
                    role.normalizedName === "student"
            );

            const parentRole = normalizedRoles.find(
                (role) =>
                    role.normalizedName === "parent"
            );

            /*
             * ---------------------------------------------------------------
             * 7. Redirect based on account type
             * ---------------------------------------------------------------
             */

            if (studentRole) {
                toast.success("Welcome back!");

                router.push("/en/student/profile");

                return;
            }

            if (parentRole) {
                toast.success("Welcome back!");

                router.push("/en/parent/profile");

                return;
            }

            /*
             * ---------------------------------------------------------------
             * 8. Unsupported role
             * ---------------------------------------------------------------
             */

            console.error(
                "Unsupported user roles:",
                normalizedRoles
            );

            toast.error(
                "Your account role is not supported. Please contact support."
            );

            await supabase.auth.signOut();

        } catch (error) {
            console.error(
                "Unexpected login error:",
                error
            );

            toast.error(
                "Something went wrong while logging in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push("/en/forgot-password");
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* ============================================================
                    Brand / Header
                ============================================================ */}

                <div className="text-center mb-8">

                    <div className="mx-auto w-14 h-14 rounded-2xl bg-navy flex items-center justify-center shadow-lg">

                        <ShieldCheck className="w-7 h-7 text-gold" />

                    </div>

                    <p className="mt-5 text-sm font-bold text-gold uppercase tracking-wider">
                        Young Leaders Academy
                    </p>

                    <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-navy">
                        Welcome Back
                    </h1>

                    <p className="mt-3 text-gray-500 text-sm sm:text-base">
                        Sign in to access your account.
                    </p>

                </div>

                {/* ============================================================
                    Login Card
                ============================================================ */}

                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8">

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* Email */}

                        <div>

                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-navy mb-2"
                            >
                                Email Address
                            </label>

                            <div className="relative">

                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
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
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={loading}
                                    className="text-xs font-semibold text-navy hover:text-gold transition-colors"
                                >
                                    Forgot password?
                                </button>

                            </div>

                            <div className="relative">

                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-12 pr-12 text-sm text-navy placeholder:text-gray-400 outline-none transition-all focus:border-navy focus:ring-2 focus:ring-navy/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (prev) => !prev
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
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
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}

                        </button>

                    </form>

                    {/* Divider */}

                    <div className="flex items-center gap-4 my-7">

                        <div className="h-px flex-1 bg-gray-200" />

                        <span className="text-xs text-gray-400 font-medium text-center">
                            New to Young Leaders Academy?
                        </span>

                        <div className="h-px flex-1 bg-gray-200" />

                    </div>

                    {/* Register */}

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/en/sign-up")
                        }
                        className="w-full h-12 rounded-full border border-navy text-navy font-bold text-sm hover:bg-navy hover:text-white transition-all"
                    >
                        Create an Account
                    </button>

                </div>

                {/* Footer */}

                <p className="text-center text-xs text-gray-400 mt-6">
                    Secure account access powered by
                    Young Leaders Academy.
                </p>

            </div>

        </main>
    );
}
