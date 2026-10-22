"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Lock, Loader2, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { PaymentMethodType, MadaCardDetails } from "@/lib/payments/mada-applepay";

export interface EnrollmentCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
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
    locale?: string;
    onSuccess?: (paymentData: any) => void;
}

export default function EnrollmentCheckoutModal({
    isOpen,
    onClose,
    program,
    user,
    locale = "en",
    onSuccess,
}: EnrollmentCheckoutModalProps) {
    const isAr = locale === "ar";

    // Form / Billing details
    const [studentName, setStudentName] = useState(user?.name || "");
    const [parentEmail, setParentEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");

    // Payment Selection
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("mada");
    const [cardDetails, setCardDetails] = useState<MadaCardDetails>({
        cardNumber: "",
        cardHolderName: user?.name || "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Saudi 15% VAT calculation
    const basePrice = Number(program.price) || 0;
    const vatAmount = basePrice * 0.15;
    const totalAmount = basePrice + vatAmount;

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        // Validations
        if (!studentName.trim() || !parentEmail.trim()) {
            const err = isAr ? "يرجى تعبئة جميع بيانات الاتصال" : "Please fill in all contact details";
            toast.error(err);
            setErrorMessage(err);
            return;
        }

        if (selectedMethod === "mada" || selectedMethod === "card") {
            const cleanCardNumber = cardDetails.cardNumber.replace(/\s+/g, "");
            if (cleanCardNumber.length < 16) {
                const err = isAr ? "رقم البطاقة غير مكتمل" : "Card number is incomplete";
                toast.error(err);
                setErrorMessage(err);
                return;
            }
            if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
                const err = isAr ? "رمز التحقق (CVV) غير صالح" : "CVV code is invalid";
                toast.error(err);
                setErrorMessage(err);
                return;
            }
        }

        try {
            setIsProcessing(true);

            const payload = {
                method: selectedMethod,
                amount: basePrice,
                vatAmount: vatAmount,
                totalAmount: totalAmount,
                currency: "SAR",
                studentName: studentName.trim(),
                parentEmail: parentEmail.trim(),
                phone: phone.trim(),
                programId: program.id,
                programTitle: program.title,
                userId: user?.id || null,
                locale,
                cardDetails: selectedMethod === "mada" || selectedMethod === "card" ? cardDetails : undefined,
            };

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || (isAr ? "فشلت عملية الدفع" : "Payment initialization failed"));
            }

            // 1. If Gateway requires 3D Secure Verification (MADA OTP from Saudi Bank)
            if (data.redirect3dsUrl) {
                toast.loading(isAr ? "جاري تحويلك لصفحة التحقق البنكي (مدى)..." : "Redirecting to Saudi Bank 3D Secure verification...");
                window.location.href = data.redirect3dsUrl;
                return;
            }

            // 2. Direct Instant Confirmation
            toast.success(isAr ? "تم التسجيل وتأكيد الدفع بنجاح!" : "Enrollment & Payment Confirmed Successfully!");

            if (onSuccess) {
                onSuccess(data);
            }

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                onClose();
            }

        } catch (err: any) {
            console.error("Enrollment checkout error:", err);
            const msg = err.message || (isAr ? "حدث خطأ أثناء معالجة الدفع" : "Payment processing error occurred");
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8"
                    dir="ltr"
                >
                    {/* Top Accent Gradient Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#0B2545] via-[#D4AF37] to-[#007A3D]" />

                    {/* Modal Close Button */}
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        aria-label="Close modal"
                        className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-6 sm:p-8">
                        {/* Header: Program Summary */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B2545]/5 text-[#0B2545]">
                                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    {program.category || (isAr ? "برنامج تدريبي" : "Academy Program")}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-[#0B2545]">
                                {program.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                {isAr
                                    ? "أكمل بيانات التسجيل والدفع للوصول الفوري للمقررات وورش العمل."
                                    : "Complete enrollment to unlock instant access to modules and live coaching sessions."}
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                            {/* 1. Student / Billing Contact Info */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                                    {isAr ? "بيانات الطالب والمسؤول" : "Student & Contact Details"}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                                            {isAr ? "الاسم بالكامل *" : "Full Name *"}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={studentName}
                                            onChange={(e) => setStudentName(e.target.value)}
                                            placeholder={isAr ? "محمد السعيد" : "e.g. Sultan Al-Otaibi"}
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                                            {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={parentEmail}
                                            onChange={(e) => setParentEmail(e.target.value)}
                                            placeholder="student@example.com"
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                                        {isAr ? "رقم الجوال (السعودية / الخليج)" : "Mobile Phone (Saudi / GCC)"}
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+966 50 000 0000"
                                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545] outline-none transition-all text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* 2. MADA & Apple Pay Selector Component */}
                            <div className="pt-2">
                                <PaymentMethodSelector
                                    amount={basePrice}
                                    currency="SAR"
                                    selectedMethod={selectedMethod}
                                    onSelectMethod={setSelectedMethod}
                                    cardDetails={cardDetails}
                                    onCardDetailsChange={setCardDetails}
                                    isProcessing={isProcessing}
                                    locale={locale}
                                />
                            </div>

                            {/* 3. Pricing & VAT Summary Breakdown */}
                            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-500">
                                    <span>{isAr ? "رسوم البرنامج" : "Program Tuition"}</span>
                                    <span className="font-semibold text-gray-700">{basePrice.toLocaleString()} SAR</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>{isAr ? "ضريبة القيمة المضافة (15% VAT)" : "Saudi VAT (15%)"}</span>
                                    <span className="font-semibold text-gray-700">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-extrabold text-[#0B2545]">
                                    <span>{isAr ? "المجموع الكلي المستحق" : "Total Amount Due"}</span>
                                    <span className="text-base text-[#0B2545]">
                                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
                                    </span>
                                </div>
                            </div>

                            {/* Submit & Security Trust Badges */}
                            <div className="space-y-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full h-14 rounded-full bg-[#0B2545] hover:bg-[#0B2545]/90 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{isAr ? "جاري معالجة الدفع الآمن..." : "Securing Payment..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 text-[#D4AF37]" />
                                            <span>
                                                {selectedMethod === "apple_pay"
                                                    ? (isAr ? "الدفع بواسطة Apple Pay" : "Pay with Apple Pay")
                                                    : selectedMethod === "mada"
                                                        ? (isAr ? `تأكيد الدفع بمدى • ${totalAmount.toFixed(2)} ر.س` : `Pay with MADA • ${totalAmount.toFixed(2)} SAR`)
                                                        : (isAr ? `تأكيد الدفع • ${totalAmount.toFixed(2)} ر.س` : `Confirm Payment • ${totalAmount.toFixed(2)} SAR`)}
                                            </span>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                                    <ShieldCheck className="w-4 h-4 text-[#007A3D]" />
                                    <span>
                                        {isAr
                                            ? "معتمد بنكياً وفق معايير البنك المركزي السعودي (SAMA) وشهادة PCI-DSS"
                                            : "Encrypted & Certified with Saudi Central Bank (SAMA) & PCI-DSS Level 1"}
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
