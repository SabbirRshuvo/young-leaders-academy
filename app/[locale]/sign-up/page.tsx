"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GraduationCap, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

function SignUpForm() {
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role") as "student" | "parent" | "admin" | null;

    const [step, setStep] = useState(initialRole ? 2 : 1);
    const [selectedRole, setSelectedRole] = useState<
        "student" | "parent" | "admin" | null
    >(initialRole);
    const router = useRouter();
    const t = useTranslations("Auth");
    const locale = useLocale();

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

    const handleSelectedRole = (role: "student" | "parent" | "admin") => {
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
            toast.error(t("selectRoleError"));
            return;
        }

        // First name validation
        if (!formData.first_name.trim()) {
            toast.error(t("firstNameError"));
            return;
        }

        // Last name validation
        if (!formData.last_name.trim()) {
            toast.error(t("lastNameError"));
            return;
        }

        // Email validation
        if (!formData.email.trim()) {
            toast.error(t("emailError"));
            return;
        }

        // Student-specific validation
        if (selectedRole === "student" && !formData.date_of_birth) {
            toast.error(t("dobError"));
            return;
        }

        // Parent-specific validation
        if (selectedRole === "parent" && !formData.phone.trim()) {
            toast.error(t("phoneError"));
            return;
        }

        // Country validation
        if (!formData.country) {
            toast.error(t("countryError"));
            return;
        }

        // Preferred language validation
        if (!formData.preferred_language) {
            toast.error(t("langError"));
            return;
        }

        // Password validation
        if (!formData.password) {
            toast.error(t("passwordError"));
            return;
        }

        // Confirm password validation
        if (!formData.confirm_password) {
            toast.error(t("confirmPasswordError"));
            return;
        }

        // Password match validation
        if (formData.password !== formData.confirm_password) {
            toast.error(t("passwordMatchError"));
            return;
        }

        // Terms validation
        if (!formData.terms) {
            toast.error(t("termsError"));
            return;
        }

        // Privacy validation
        if (!formData.privacy) {
            toast.error(t("privacyError"));
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
                        role: selectedRole === "admin" ? "pending_admin" : selectedRole,
                    },
                },
            });

            if (error) {
                console.error("Supabase signup error:", error);
                toast.error(error.message);
                return;
            }

            if (!data.user) {
                toast.error(t("unableCreate"));
                return;
            }

            const userId = data.user.id;

            console.log("Supabase Auth User:", data.user);

            // ==========================================
            // 2. CREATE PROFILE
            // ==========================================

            const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();

            const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                    id: userId,
                    first_name: formData.first_name.trim(),
                    last_name: formData.last_name.trim(),
                    display_name: fullName,
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
                    t("setupFailedProfile")
                );

                return;
            }

            console.log("Profile created successfully.");

            // ==========================================
            // 3. FIND ROLE ID
            // ==========================================

            const roleNameToQuery = selectedRole === "admin" ? "pending_admin" : selectedRole;
            const { data: roleData, error: roleError } = await supabase
                .from("roles")
                .select("id")
                .eq("name", roleNameToQuery)
                .single();

            console.log("Testing Role: ", roleData)

            if (roleError) {
                console.log("Role Data: ", roleData)
                console.error("Role lookup error:", roleError);

                toast.error(
                    t("setupFailedRole")
                );

                return;
            }

            if (!roleData) {
                toast.error(
                    t("roleNotFound")
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
                    t("roleAssignFailed")
                );

                return;
            }

            console.log("User role assigned successfully.");

            // ==========================================
            // 5. SUCCESS
            // ==========================================

            router.push(locale === "en" ? "/" : `/${locale}`)

            toast.success(
                selectedRole === "student"
                    ? t("studentSuccess")
                    : selectedRole === "parent"
                        ? t("parentSuccess")
                        : "Admin account created. Pending approval."
            );

        } catch (error) {
            console.error("Registration error:", error);

            toast.error(
                t("signupError")
            );
        } finally {
            setIsLoading(false);
        }
    };

    const countryCodes = [
        "AF", // Afghanistan
        "AL", // Albania
        "DZ", // Algeria
        "AD", // Andorra
        "AO", // Angola
        "AG", // Antigua and Barbuda
        "AR", // Argentina
        "AM", // Armenia
        "AU", // Australia
        "AT", // Austria
        "AZ", // Azerbaijan
        "BS", // Bahamas
        "BH", // Bahrain
        "BD", // Bangladesh
        "BB", // Barbados
        "BY", // Belarus
        "BE", // Belgium
        "BZ", // Belize
        "BJ", // Benin
        "BT", // Bhutan
        "BO", // Bolivia
        "BA", // Bosnia and Herzegovina
        "BW", // Botswana
        "BR", // Brazil
        "BN", // Brunei
        "BG", // Bulgaria
        "BF", // Burkina Faso
        "BI", // Burundi
        "CV", // Cabo Verde
        "KH", // Cambodia
        "CM", // Cameroon
        "CA", // Canada
        "CF", // Central African Republic
        "TD", // Chad
        "CL", // Chile
        "CN", // China
        "CO", // Colombia
        "KM", // Comoros
        "CG", // Republic of the Congo
        "CD", // Democratic Republic of the Congo
        "CR", // Costa Rica
        "CI", // Côte d'Ivoire
        "HR", // Croatia
        "CU", // Cuba
        "CY", // Cyprus
        "CZ", // Czechia
        "DK", // Denmark
        "DJ", // Djibouti
        "DM", // Dominica
        "DO", // Dominican Republic
        "EC", // Ecuador
        "EG", // Egypt
        "SV", // El Salvador
        "GQ", // Equatorial Guinea
        "ER", // Eritrea
        "EE", // Estonia
        "SZ", // Eswatini
        "ET", // Ethiopia
        "FJ", // Fiji
        "FI", // Finland
        "FR", // France
        "GA", // Gabon
        "GM", // Gambia
        "GE", // Georgia
        "DE", // Germany
        "GH", // Ghana
        "GR", // Greece
        "GD", // Grenada
        "GT", // Guatemala
        "GN", // Guinea
        "GW", // Guinea-Bissau
        "GY", // Guyana
        "HT", // Haiti
        "HN", // Honduras
        "HU", // Hungary
        "IS", // Iceland
        "IN", // India
        "ID", // Indonesia
        "IR", // Iran
        "IQ", // Iraq
        "IE", // Ireland
        "IL", // Israel
        "IT", // Italy
        "JM", // Jamaica
        "JP", // Japan
        "JO", // Jordan
        "KZ", // Kazakhstan
        "KE", // Kenya
        "KI", // Kiribati
        "KP", // North Korea
        "KR", // South Korea
        "KW", // Kuwait
        "KG", // Kyrgyzstan
        "LA", // Laos
        "LV", // Latvia
        "LB", // Lebanon
        "LS", // Lesotho
        "LR", // Liberia
        "LY", // Libya
        "LI", // Liechtenstein
        "LT", // Lithuania
        "LU", // Luxembourg
        "MG", // Madagascar
        "MW", // Malawi
        "MY", // Malaysia
        "MV", // Maldives
        "ML", // Mali
        "MT", // Malta
        "MH", // Marshall Islands
        "MR", // Mauritania
        "MU", // Mauritius
        "MX", // Mexico
        "FM", // Micronesia
        "MD", // Moldova
        "MC", // Monaco
        "MN", // Mongolia
        "ME", // Montenegro
        "MA", // Morocco
        "MZ", // Mozambique
        "MM", // Myanmar
        "NA", // Namibia
        "NR", // Nauru
        "NP", // Nepal
        "NL", // Netherlands
        "NZ", // New Zealand
        "NI", // Nicaragua
        "NE", // Niger
        "NG", // Nigeria
        "MK", // North Macedonia
        "NO", // Norway
        "OM", // Oman
        "PK", // Pakistan
        "PW", // Palau
        "PS", // Palestine
        "PA", // Panama
        "PG", // Papua New Guinea
        "PY", // Paraguay
        "PE", // Peru
        "PH", // Philippines
        "PL", // Poland
        "PT", // Portugal
        "QA", // Qatar
        "RO", // Romania
        "RU", // Russia
        "RW", // Rwanda
        "KN", // Saint Kitts and Nevis
        "LC", // Saint Lucia
        "VC", // Saint Vincent and the Grenadines
        "WS", // Samoa
        "SM", // San Marino
        "ST", // São Tomé and Príncipe
        "SA", // Saudi Arabia
        "SN", // Senegal
        "RS", // Serbia
        "SC", // Seychelles
        "SL", // Sierra Leone
        "SG", // Singapore
        "SK", // Slovakia
        "SI", // Slovenia
        "SB", // Solomon Islands
        "SO", // Somalia
        "ZA", // South Africa
        "SS", // South Sudan
        "ES", // Spain
        "LK", // Sri Lanka
        "SD", // Sudan
        "SR", // Suriname
        "SE", // Sweden
        "CH", // Switzerland
        "SY", // Syria
        "TJ", // Tajikistan
        "TZ", // Tanzania
        "TH", // Thailand
        "TL", // Timor-Leste
        "TG", // Togo
        "TO", // Tonga
        "TT", // Trinidad and Tobago
        "TN", // Tunisia
        "TR", // Turkey
        "TM", // Turkmenistan
        "TV", // Tuvalu
        "UG", // Uganda
        "UA", // Ukraine
        "AE", // United Arab Emirates
        "GB", // United Kingdom
        "US", // United States
        "UY", // Uruguay
        "UZ", // Uzbekistan
        "VU", // Vanuatu
        "VA", // Vatican City
        "VE", // Venezuela
        "VN", // Vietnam
        "YE", // Yemen
        "ZM", // Zambia
        "ZW", // Zimbabwe
    ];

    const countryNames = new Intl.DisplayNames([locale], {
        type: "region",
    });


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

                                <div className="flex-1 flex items-center justify-center">
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
                                    <h2 className="text-center text-3xl">{t("selectRoleTitle")}</h2>
                                </div>

                                <div className="flex items-center justify-center space-x-4 md:space-x-6">

                                    {/* Student */}

                                    <div
                                        onClick={() =>
                                            handleSelectedRole("student")
                                        }
                                        className={`flex flex-col items-center justify-center gap-2 py-4 px-3 md:px-5 shadow-lg border-2 rounded-xl cursor-pointer transition-all duration-300 ease-out hover:scale-105 ${selectedRole === "student"
                                            ? "border-gold scale-105"
                                            : "border-navy"
                                            }`}
                                    >
                                        <GraduationCap className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] text-navy" />
                                        <span className="text-navy font-semibold text-sm md:text-base">{t("student")}</span>
                                    </div>

                                    {/* Parent */}

                                    <div
                                        onClick={() =>
                                            handleSelectedRole("parent")
                                        }
                                        className={`flex flex-col items-center justify-center gap-2 py-4 px-3 md:px-5 shadow-lg border-2 rounded-xl cursor-pointer transition-all duration-300 ease-out hover:scale-105 ${selectedRole === "parent"
                                            ? "border-gold scale-105"
                                            : "border-navy"
                                            }`}
                                    >
                                        <Users className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] text-navy" />
                                        <span className="text-navy font-semibold text-sm md:text-base">{t("parent")}</span>
                                    </div>
                                </div>


                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedRole === null) {
                                            toast.error(
                                                t("selectOneRole")
                                            );
                                            return;
                                        }

                                        nextStep();
                                    }}
                                    className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[#0B2545] px-6 text-[13px] font-semibold text-white hover:bg-[#0B2545]/90 transition-colors w-full"
                                >{t("next")}<ArrowRight className="w-4 h-4 text-white" />
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

                                <div className="flex items-center justify-center">
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
                                            ? t("createStudentTitle")
                                            : selectedRole === "parent"
                                                ? t("createParentTitle")
                                                : "Create Admin Account"}
                                    </h3>

                                    <p className="mt-2 text-gray-600 text-center text-sm">{t("enterInfo")}</p>
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
                                            <span className="text-sm font-medium text-navy">{t("firstName")}</span>

                                            <input
                                                type="text"
                                                name="first_name"
                                                id="first_name"
                                                title="First Name"
                                                placeholder={t("firstNamePlaceholder")}
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />
                                        </label>

                                        {/* Last Name */}

                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">{t("lastName")}</span>

                                            <input
                                                type="text"
                                                name="last_name"
                                                id="last_name"
                                                title="Last Name"
                                                placeholder={t("lastNamePlaceholder")}
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                            />
                                        </label>

                                    </div>

                                    {/* Email */}

                                    <label className="flex flex-col space-y-2">
                                        <span className="text-sm font-medium text-navy">{t("email")}</span>

                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            title="Email"
                                            placeholder={t("emailPlaceholderSignUp")}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg focus:border-gold transition-colors"
                                        />
                                    </label>

                                    {/* Student → Date of Birth */}

                                    {selectedRole === "student" && (
                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">{t("dob")}</span>

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
                                            <span className="text-sm font-medium text-navy">{t("phone")}</span>

                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                title="Phone Number"
                                                placeholder={t("phonePlaceholder")}
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
                                            <span className="text-sm font-medium text-navy">{t("country")}</span>

                                            <select name="country" id="country" title="Country" value={formData.country} onChange={handleInputChange} required className="w-full px-3 py-2.5 outline-none border-2 border-gray-300 rounded-lg bg-white text-gray-700 focus:border-gold transition-colors" > <option value="" disabled> {t("selectCountry")} </option> {countryCodes.map((code) => (<option key={code} value={code.toLowerCase()}> {countryNames.of(code)} </option>))} </select>
                                        </label>

                                        {/* Preferred Language */}

                                        <label className="flex flex-col space-y-2">
                                            <span className="text-sm font-medium text-navy">{t("preferredLanguage")}</span>

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
                                                    {t("englishLang")}
                                                </option>

                                                <option value="arabic">
                                                    {t("arabicLang")}
                                                </option>
                                            </select>
                                        </label>

                                    </div>

                                    {/* Password */}

                                    <label className="flex flex-col space-y-2">
                                        <span className="text-sm font-medium text-navy">{t("password")}</span>

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
                                        <span className="text-sm font-medium text-navy">{t("confirmPassword")}</span>

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
                                                placeholder={t("confirmPasswordPlaceholder")}
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
                                                {t("termsText1")}{" "}
                                                <Link
                                                    href="/terms"
                                                    className="text-navy font-semibold hover:text-gold transition-colors"
                                                >
                                                    {t("termsText2")}
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
                                                {t("privacyText1")}{" "}
                                                <Link
                                                    href="/privacy"
                                                    className="text-navy font-semibold hover:text-gold transition-colors"
                                                >
                                                    {t("privacyText2")}
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
                                        >{t("back")}</button>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 h-[44px] rounded-full bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#0B2545]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                                                    {selectedRole === "student"
                                                        ? t("creatingStudentAccount")
                                                        : t("creatingParentAccount")}
                                                </>
                                            ) : (
                                                selectedRole === "student"
                                                    ? t("createStudentAccountBtn")
                                                    : t("createParentAccountBtn")
                                            )}
                                        </button>

                                    </div>

                                    {/* Login */}

                                    <p className="text-center text-sm text-gray-600 pt-1">
                                        {t("alreadyHaveAccount")}{" "}
                                        <Link
                                            href={locale === "en" ? `/login` : `/${locale}/login`}
                                            className="font-semibold text-navy hover:text-gold transition-colors"
                                        >
                                            {t("logInText")}
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

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>}>
            <SignUpForm />
        </Suspense>
    );
}
