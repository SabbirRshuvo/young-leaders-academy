"use client";

import { useState, useEffect } from "react";
import {
    PaymentMethodType,
    MadaCardDetails,
    isMadaCard,
    validateCardNumberLuhn
} from "@/lib/payments/mada-applepay";

export interface InitiatePaymentHookParams {
    method: PaymentMethodType;
    amount: number;
    studentName: string;
    parentEmail: string;
    phone: string;
    programId: string;
    programTitle: string;
    userId?: string | null;
    locale?: string;
    cardDetails?: MadaCardDetails;
}

export function usePaymentGateway() {
    const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Detect Apple Pay capability in Safari / iOS / macOS
        if (typeof window !== "undefined") {
            const hasApplePay = !!(window as any).ApplePaySession && (window as any).ApplePaySession.canMakePayments();
            setIsApplePayAvailable(hasApplePay);
        }
    }, []);

    const processPayment = async (params: InitiatePaymentHookParams) => {
        setLoading(true);
        setError(null);

        try {
            // Validation for MADA card
            if (params.method === "mada") {
                if (!params.cardDetails) {
                    throw new Error("MADA debit card details are required");
                }
                const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } = params.cardDetails;
                if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
                    throw new Error("Please complete all card details");
                }
                if (!validateCardNumberLuhn(cardNumber)) {
                    throw new Error("Invalid card number format");
                }
            }

            const res = await fetch("/api/payments/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params)
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Payment processing failed");
            }

            // If 3D Secure verification is required by Saudi bank
            if (data.redirect3dsUrl) {
                window.location.href = data.redirect3dsUrl;
                return data;
            }

            return data;
        } catch (err: any) {
            setError(err.message || "An error occurred during payment");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        isApplePayAvailable,
        processPayment,
        isMadaCard,
        loading,
        error
    };
}
