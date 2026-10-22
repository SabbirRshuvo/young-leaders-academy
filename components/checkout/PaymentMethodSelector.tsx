"use client";

import React, { useState } from "react";
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { PaymentMethodType, MadaCardDetails, isMadaCard } from "@/lib/payments/mada-applepay";

interface PaymentMethodSelectorProps {
    amount: number;
    currency?: string;
    selectedMethod: PaymentMethodType;
    onSelectMethod: (method: PaymentMethodType) => void;
    cardDetails: MadaCardDetails;
    onCardDetailsChange: (details: MadaCardDetails) => void;
    isApplePayAvailable?: boolean;
    isProcessing?: boolean;
    locale?: string;
}

export default function PaymentMethodSelector({
    amount,
    currency = "SAR",
    selectedMethod,
    onSelectMethod,
    cardDetails,
    onCardDetailsChange,
    isApplePayAvailable = true,
    isProcessing = false,
    locale = "en",
}: PaymentMethodSelectorProps) {
    const isAr = locale === "ar";
    const [cardIsMada, setCardIsMada] = useState(false);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Format with spaces: 0000 0000 0000 0000
        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
        
        setCardIsMada(isMadaCard(raw));
        onCardDetailsChange({
            ...cardDetails,
            cardNumber: formatted,
        });
    };

    const vatAmount = amount * 0.15;
    const totalAmount = amount + vatAmount;

    return (
        <div className="space-y-6" dir="ltr">
            {/* Header */}
            <div>
                <h3 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    {isAr ? "اختر طريقة الدفع" : "Select Payment Method"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                    {isAr
                        ? "دفع آمن متوافق مع شبكة المدفوعات السعودية ومعايير الحماية 3D Secure 2.0"
                        : "Secure payment compliant with Saudi Payments Switch (MADA) & 3D Secure 2.0"}
                </p>
            </div>

            {/* Payment Method Badges / Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. MADA Card */}
                <button
                    type="button"
                    onClick={() => onSelectMethod("mada")}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        selectedMethod === "mada"
                            ? "border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <div className="flex items-center justify-between w-full mb-3">
                        {/* MADA Green/Yellow badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#007A3D] text-white font-extrabold text-xs tracking-wider">
                            <span>mada</span>
                            <span className="text-[#FFC72C]">مدى</span>
                        </div>
                        {selectedMethod === "mada" && (
                            <CheckCircle2 className="w-5 h-5 text-[#0B2545]" />
                        )}
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-[#0B2545]">
                            {isAr ? "بطاقة مدى البنكية" : "MADA Debit Card"}
                        </span>
                        <span className="block text-[11px] text-gray-500">
                            {isAr ? "جميع البنوك السعودية" : "All Saudi Banks"}
                        </span>
                    </div>
                </button>

                {/* 2. Apple Pay */}
                <button
                    type="button"
                    onClick={() => onSelectMethod("apple_pay")}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        selectedMethod === "apple_pay"
                            ? "border-black bg-black/5 ring-2 ring-black/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <div className="flex items-center justify-between w-full mb-3">
                        <div className="h-6 px-2.5 bg-black text-white rounded flex items-center justify-center font-semibold text-xs gap-1">
                            <span></span>
                            <span>Pay</span>
                        </div>
                        {selectedMethod === "apple_pay" && (
                            <CheckCircle2 className="w-5 h-5 text-black" />
                        )}
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-900">Apple Pay</span>
                        <span className="block text-[11px] text-gray-500">
                            {isAr ? "دفع فوري بلمسة واحدة" : "Instant 1-Touch Checkout"}
                        </span>
                    </div>
                </button>

                {/* 3. Credit Card */}
                <button
                    type="button"
                    onClick={() => onSelectMethod("card")}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        selectedMethod === "card"
                            ? "border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                    <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <CreditCard className="w-5 h-5 text-[#0B2545]" />
                            <span>Visa / MC</span>
                        </div>
                        {selectedMethod === "card" && (
                            <CheckCircle2 className="w-5 h-5 text-[#0B2545]" />
                        )}
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-[#0B2545]">
                            {isAr ? "بطاقة ائتمانية" : "Credit Card"}
                        </span>
                        <span className="block text-[11px] text-gray-500">Visa / Mastercard</span>
                    </div>
                </button>
            </div>

            {/* MADA / Card Input Fields */}
            {(selectedMethod === "mada" || selectedMethod === "card") && (
                <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-5 space-y-4">
                    {/* Card Number */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-[#0B2545] uppercase">
                                {isAr ? "رقم البطاقة" : "Card Number"} *
                            </label>
                            {cardIsMada && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#007A3D]/10 text-[#007A3D] border border-[#007A3D]/20">
                                    ✓ Verified MADA
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={cardDetails.cardNumber}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                                required
                                disabled={isProcessing}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm text-[#0B2545] font-mono tracking-wider outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                            />
                            <CreditCard className={`absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none`} />
                        </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                        <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                            {isAr ? "اسم حامل البطاقة (كما هو مدون)" : "Cardholder Name (as on card)"} *
                        </label>
                        <input
                            type="text"
                            placeholder="AHMED AL-SAUD"
                            value={cardDetails.cardHolderName}
                            onChange={(e) => onCardDetailsChange({ ...cardDetails, cardHolderName: e.target.value.toUpperCase() })}
                            required
                            disabled={isProcessing}
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm text-[#0B2545] uppercase outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
                        />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                {isAr ? "تاريخ الانتهاء" : "Expiry Date"} (MM/YY) *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="MM"
                                    maxLength={2}
                                    value={cardDetails.expiryMonth}
                                    onChange={(e) => onCardDetailsChange({ ...cardDetails, expiryMonth: e.target.value.replace(/\D/g, "") })}
                                    required
                                    disabled={isProcessing}
                                    className="w-full h-12 px-3 text-center rounded-xl border border-gray-200 bg-white text-sm text-[#0B2545] font-mono outline-none focus:border-[#0B2545]"
                                />
                                <input
                                    type="text"
                                    placeholder="YY"
                                    maxLength={2}
                                    value={cardDetails.expiryYear}
                                    onChange={(e) => onCardDetailsChange({ ...cardDetails, expiryYear: e.target.value.replace(/\D/g, "") })}
                                    required
                                    disabled={isProcessing}
                                    className="w-full h-12 px-3 text-center rounded-xl border border-gray-200 bg-white text-sm text-[#0B2545] font-mono outline-none focus:border-[#0B2545]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B2545] mb-1.5 uppercase">
                                CVV (رمز الأمان) *
                            </label>
                            <input
                                type="password"
                                placeholder="123"
                                maxLength={4}
                                value={cardDetails.cvv}
                                onChange={(e) => onCardDetailsChange({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })}
                                required
                                disabled={isProcessing}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm text-[#0B2545] font-mono text-center outline-none focus:border-[#0B2545]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                            {isAr
                                ? "ستتم إعادة توجيهك إلى صفحة التحقق الآمن من البنك الخاص بك (3D Secure OTP)."
                                : "You will receive an OTP code on your mobile via your Saudi Bank 3D Secure verification."}
                        </span>
                    </div>
                </div>
            )}

            {/* Apple Pay View */}
            {selectedMethod === "apple_pay" && (
                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                        
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-gray-900">
                            {isAr ? "ادفع بواسطة Apple Pay" : "Pay with Apple Pay"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            {isAr
                                ? "استخدم بصمة الإصبع أو FaceID لتأكيد الدفع بأمان وسرعة مباشرة من جهازك."
                                : "Authorize payment securely using Face ID or Touch ID configured with your MADA or Credit Card."}
                        </p>
                    </div>

                    <div className="py-2">
                        <button
                            type="button"
                            disabled={isProcessing}
                            className="w-full max-w-sm h-12 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md mx-auto"
                        >
                            <span></span>
                            <span>{isAr ? "الدفع باستخدام Apple Pay" : "Pay with Apple Pay"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Price Summary Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                    <span>{isAr ? "رسوم الدورة / البرنامج:" : "Program Tuition Fee:"}</span>
                    <span className="font-semibold text-gray-800">{amount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>{isAr ? "ضريبة القيمة المضافة (15%):" : "Saudi VAT (15%):"}</span>
                    <span className="font-semibold text-gray-800">{vatAmount.toLocaleString()} {currency}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-[#0B2545]">
                    <span>{isAr ? "المجموع الكلي:" : "Total Amount:"}</span>
                    <span className="text-base text-[#0B2545]">{totalAmount.toLocaleString()} {currency}</span>
                </div>
            </div>
        </div>
    );
}
