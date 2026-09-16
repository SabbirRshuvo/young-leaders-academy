"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Page() {
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<
        "student" | "parent" | null
    >(null);
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        date_of_birth: "",
        phone: "",
        country: "",
        preferred_language: "english",
        password: "",
        confirm_password: "",
        terms: false,
        privacy: false,
    });

    const nextStep = () => {
        setStep((prev) => prev + 1);
    };

    const previousStep = () => {
        setStep((prev) => prev - 1);
    };

    const handleSelectedRole = (role: "student" | "parent") => {
        setSelectedRole(role);
    };

    // Handle all input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        const checked =
            type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : undefined;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle final registration submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        // Role validation
        if (!selectedRole) {
            toast.error("Please select a role.");
            return;
        }

        // First name validation
        if (!formData.first_name.trim()) {
            toast.error("Please enter your first name.");
            return;
        }

        // Last name validation
        if (!formData.last_name.trim()) {
            toast.error("Please enter your last name.");
            return;
        }

        // Email validation
        if (!formData.email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        // Student-specific validation
        if (selectedRole === "student" && !formData.date_of_birth) {
            toast.error("Please enter your date of birth.");
            return;
        }

        // Parent-specific validation
        if (selectedRole === "parent" && !formData.phone.trim()) {
            toast.error("Please enter your phone number.");
            return;
        }

        // Country validation
        if (!formData.country) {
            toast.error("Please select your country.");
            return;
        }

        // Preferred language validation
        if (!formData.preferred_language) {
            toast.error("Please select your preferred language.");
            return;
        }

        // Password validation
        if (!formData.password) {
            toast.error("Please enter a password.");
            return;
        }

        // Confirm password validation
        if (!formData.confirm_password) {
            toast.error("Please confirm your password.");
            return;
        }

        // Password match validation
        if (formData.password !== formData.confirm_password) {
            toast.error("Passwords do not match.");
            return;
        }

        // Terms validation
        if (!formData.terms) {
            toast.error("You must agree to the Terms & Conditions.");
            return;
        }

        // Privacy validation
        if (!formData.privacy) {
            toast.error("You must acknowledge the Privacy Policy.");
            return;
        }

        setIsLoading(true);

        try {
            // ==========================================
            // 1. CREATE AUTH USER
            // ==========================================

            const { data, error } = await supabase.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,

                options: {
                    data: {
                        first_name: formData.first_name.trim(),
                        last_name: formData.last_name.trim(),
                    },
                },
            });

            if (error) {
                console.error("Supabase signup error:", error);
                toast.error(error.message);
                return;
            }

            if (!data.user) {
                toast.error("Unable to create account.");
                return;
            }

            const userId = data.user.id;

            console.log("Supabase Auth User:", data.user);

            // ==========================================
            // 2. CREATE PROFILE
            // ==========================================

            const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                    id: userId,
                    first_name: formData.first_name.trim(),
                    last_name: formData.last_name.trim(),
                    country: formData.country,
                    preferred_language: formData.preferred_language,

                    phone:
                        selectedRole === "parent"
                            ? formData.phone.trim()
                            : null,

                    date_of_birth:
                        selectedRole === "student"
                            ? formData.date_of_birth
                            : null,
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);

                toast.error(
                    "Account created, but profile setup failed."
                );

                return;
            }

            console.log("Profile created successfully.");

            // ==========================================
            // 3. FIND ROLE ID
            // ==========================================

            const { data: roleData, error: roleError } = await supabase
                .from("roles")
                .select("id")
                .eq("name", selectedRole)
                .single();

            console.log("Testing Role: ", roleData)

            if (roleError) {
                console.log("Role Data: ", roleData)
                console.error("Role lookup error:", roleError);

                toast.error(
                    "Account created, but role setup failed."
                );

                return;
            }

            if (!roleData) {
                toast.error(
                    "Account created, but the selected role was not found."
                );

                return;
            }

            console.log("RoleData: ", roleData)

            // ==========================================
            // 4. CREATE USER ↔ ROLE RELATIONSHIP
            // ==========================================

            const { error: userRoleError } = await supabase
                .from("user_roles")
                .insert({
                    user_id: userId,
                    role_id: roleData.id,
                });

            if (userRoleError) {
                console.error(
                    "User role creation error:",
                    userRoleError
                );

                toast.error(
                    "Account created, but role assignment failed."
                );

                return;
            }

            console.log("User role assigned successfully.");

            // ==========================================
            // 5. SUCCESS
            // ==========================================

            router.push("/en")

            toast.success(
                selectedRole === "student"
                    ? "Student account created successfully!"
                    : "Parent account created successfully!"
            );

        } catch (error) {
            console.error("Registration error:", error);

            toast.error(
                "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden py-8">
            <div className="w-full max-w-2xl">

                <AnimatePresence mode="wait">

                    {/* STEP 1 — ROLE SELECTION */}

                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{
                                duration: 0.4,
                                ease: "easeInOut",
                            }}
                        >
                            <div className="rounded-2xl border border-navy p-8 space-y-6">

                                {/* Logo */}

                                <div className="flex-1 flex items-center justify-start">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-0"
                                    >
                                        <Image
                                            src="/logo.jpeg"
                                            alt="Logo"
                                            width={150}
                                            height={150}
                                            priority
                                            className="w-16 h-16 md:w-[120px] md:h-[70px] object-contain"
                                        />

                                        <div className="hidden sm:flex flex-col justify-center -ml-3 md:-ml-4">
                                            <div className="text-[14px] md:text-[16px] font-extrabold text-navy leading-none tracking-[0.05em] mb-[6px]">
                                                YOUNG LEADERS
                                            </div>

                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-[1px] w-4 bg-gold"></div>

                                                <div className="text-[9px] md:text-[10px] font-bold text-gold tracking-[0.2em] leading-none">
                                                    ACADEMY
                                                </div>

                                                <div className="h-[1px] w-4 bg-gold"></div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div>
                                    <h2 className="text-center text-3xl">
                                        Please let us know your identity!
                                    </h2>
                                </div>

                                <div className="flex items-center justify-center space-x-6">

                                    {/* Student */}

                                    <div
                                        onClick={() =>
                                            handleSelectedRole("student")
                                        }
                                        className={`py-4 px-5 shadow-lg border-2 rounded-xl cursor-pointer transition-all duration-300 ease-out hover:scale-110 ${selectedRole === "student"
                                            ? "border-gold scale-110"
                                            : "border-navy"
                                            }`}
                                    >
                                        <Image
                                            src="/students.png"
                                            alt="Student"
                                            width={60}
                                            height={60}
                                        />
                                    </div>

                                    {/* Parent */}

                                    <div
                                        onClick={() =>
                                            handleSelectedRole("parent")
                                        }
                                        className={`py-4 px-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ease-out hover:scale-110 ${selectedRole === "parent"
                                            ? "border-gold scale-110"
                                            : "border-navy"
                                            }`}
                                    >
                                        <Image
                                            src="/parents.png"
                                            alt="Parent"
                                            width={60}
                                            height={60}
                                        />
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedRole === null) {
                                            toast.error(
                                                "Please select at least one role!"
                                            );
                                            return;
                                        }

                                        nextStep();
                                    }}
                                    className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[#0B2545] px-6 text-[13px] font-semibold text-white hover:bg-[#0B2545]/90 transition-colors w-full"
                                >
                                    Next

                                    <ArrowRight className="w-4 h-4 text-white" />
                                </button>

                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 — REGISTRATION FORM */}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{
                                duration: 0.4,
                                ease: "easeInOut",
                            }}
                        >
                            <div className="rounded-2xl border border-navy p-8 space-y-5">

                                {/* Logo */}

                                <div className="flex items-center justify-start">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-0"
                                    >
                                        <Image
                                            src="/logo.jpeg"
                                            alt="Logo"
                                            width={150}
                                            height={150}
                                            priority
                                            className="w-16 h-16 md:w-[120px] md:h-[70px] object-contain"
                                        />

                                        <div className="hidden sm:flex flex-col justify-center -ml-3 md:-ml-4">
                                            <div className="text-[14px] md:text-[16px] font-extrabold text-navy leading-none tracking-[0.05em] mb-[6px]">
                                                YOUNG LEADERS
                                            </div>

                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-[1px] w-4 bg-gold"></div>

                                                <div className="text-[9px] md:text-[10px] font-bold text-gold tracking-[0.2em] leading-none">
                                                    ACADEMY
                                                </div>

                                                <div className="h-[1px] w-4 bg-gold"></div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Heading */}

                                <div>
                                    <h3 className="text-navy text-center text-2xl font-bold">
                                        {selectedRole === "student"
                                            ? "Create your Student Account"
                                            : "Create your Parent Account"}
                                    </h3>

                                    <p className="mt-2 text-gray-600 text-center text-sm">
                                        Enter your information below.
                                    </p>
                                </div>

                                {/* FORM */}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >

                                    {/* First Name + Last Name */}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* First Name */}

                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">
                                                First Name
                                            </span>

                                            <input
                                                type="text"
                                                name="first_name"
                                                id="first_name"
                                                title="First Name"
                                                placeholder="Enter first name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />
                                        </label>

                                        {/* Last Name */}

                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">
                                                Last Name
                                            </span>

                                            <input
                                                type="text"
                                                name="last_name"
                                                id="last_name"
                                                title="Last Name"
                                                placeholder="Enter last name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />
                                        </label>

                                    </div>

                                    {/* Email */}

                                    <label className="flex flex-col space-y-2">
                                        <span className="text-sm font-medium text-navy">
                                            Email
                                        </span>

                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            title="Email"
                                            placeholder="Enter your email address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                        />
                                    </label>

                                    {/* Student → Date of Birth */}

                                    {selectedRole === "student" && (
                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">
                                                Date of Birth
                                            </span>

                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                id="date_of_birth"
                                                title="Date of Birth"
                                                value={
                                                    formData.date_of_birth
                                                }
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg text-gray-700 focus:border-gold transition-colors"
                                            />
                                        </label>
                                    )}

                                    {/* Parent → Phone Number */}

                                    {selectedRole === "parent" && (
                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">
                                                Phone Number
                                            </span>

                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                title="Phone Number"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />
                                        </label>
                                    )}

                                    {/* Country + Preferred Language */}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* Country */}

                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">
                                                Country
                                            </span>

                                            <select
                                                name="country"
                                                id="country"
                                                title="Country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg bg-white text-gray-700 focus:border-gold transition-colors"
                                            >
                                                <option value="" disabled>
                                                    Select country
                                                </option>

                                                <option value="usa">
                                                    United States
                                                </option>

                                                <option value="canada">
                                                    Canada
                                                </option>

                                                <option value="uk">
                                                    United Kingdom
                                                </option>

                                                <option value="australia">
                                                    Australia
                                                </option>

                                                <option value="bangladesh">
                                                    Bangladesh
                                                </option>
                                            </select>
                                        </label>

                                        {/* Preferred Language */}

                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">
                                                Preferred Language
                                            </span>

                                            <select
                                                name="preferred_language"
                                                id="preferred_language"
                                                title="Preferred Language"
                                                value={
                                                    formData.preferred_language
                                                }
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg bg-white text-gray-700 focus:border-gold transition-colors"
                                            >
                                                <option value="english">
                                                    English
                                                </option>

                                                <option value="arabic">
                                                    Arabic
                                                </option>
                                            </select>
                                        </label>

                                    </div>

                                    {/* Password */}

                                    <label className="flex flex-col space-y-2">
                                        <span className="text-sm font-medium text-navy">
                                            Password
                                        </span>

                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                id="password"
                                                title="Password"
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 pr-11 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-gray-500 hover:text-navy cursor-pointer transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </label>

                                    {/* Confirm Password */}

                                    <label className="flex flex-col space-y-2">
                                        <span className="text-sm font-medium text-navy">
                                            Confirm Password
                                        </span>

                                        <div className="relative">
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirm_password"
                                                id="confirm_password"
                                                title="Confirm Password"
                                                placeholder="Confirm your password"
                                                value={
                                                    formData.confirm_password
                                                }
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 pr-11 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide confirm password"
                                                        : "Show confirm password"
                                                }
                                                className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-gray-500 hover:text-navy cursor-pointer transition-colors"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </label>

                                    {/* Terms & Privacy */}

                                    <div className="space-y-3 pt-2">

                                        {/* Terms */}

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="terms"
                                                id="terms"
                                                checked={formData.terms}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 h-4 w-4 accent-[#0B2545]"
                                            />

                                            <span className="text-sm text-gray-600">
                                                I agree to the{" "}
                                                <Link
                                                    href="/terms"
                                                    className="text-navy font-semibold hover:text-gold transition-colors"
                                                >
                                                    Terms & Conditions
                                                </Link>
                                            </span>
                                        </label>

                                        {/* Privacy */}

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="privacy"
                                                id="privacy"
                                                checked={formData.privacy}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 h-4 w-4 accent-[#0B2545]"
                                            />

                                            <span className="text-sm text-gray-600">
                                                I acknowledge the{" "}
                                                <Link
                                                    href="/privacy"
                                                    className="text-navy font-semibold hover:text-gold transition-colors"
                                                >
                                                    Privacy Policy
                                                </Link>
                                            </span>
                                        </label>

                                    </div>

                                    {/* Buttons */}

                                    <div className="flex gap-3 pt-3">

                                        <button
                                            type="button"
                                            onClick={previousStep}
                                            className="flex-1 h-[44px] rounded-full border-2 border-navy text-navy text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 h-[44px] rounded-full bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#0B2545]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                                                    {selectedRole === "student"
                                                        ? "Creating Student Account..."
                                                        : "Creating Parent Account..."}
                                                </>
                                            ) : (
                                                selectedRole === "student"
                                                    ? "Create Student Account"
                                                    : "Create Parent Account"
                                            )}
                                        </button>

                                    </div>

                                    {/* Login */}

                                    <p className="text-center text-sm text-gray-600 pt-1">
                                        Already have an account?{" "}
                                        <Link
                                            href="/en/login"
                                            className="font-semibold text-navy hover:text-gold transition-colors"
                                        >
                                            Log in
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

            </div>
        </div>
    );
}
