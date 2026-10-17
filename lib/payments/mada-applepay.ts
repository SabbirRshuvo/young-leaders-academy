/**
 * Young Leaders Academy - MADA & Apple Pay Gateway Integration Module
 * Built for Saudi Arabian (KSA) & GCC regulatory compliance (SAMA, MADA, 3D Secure 2.0).
 * Compatible with Tap Payments and Moyasar gateway standards.
 */

// Saudi National Switch (MADA) Bank Identification Numbers (BINs)
export const MADA_BINS = [
    // Al Rajhi Bank
    "588845", "588846", "588847", "588848", "588849", "588850", "588851",
    "458838", "457865", "457997", "968208", "968201", "968202", "968203",
    // Saudi National Bank (SNB / AlAhli)
    "529415", "535825", "543357", "524130", "524514", "554180", "557606",
    "968204", "968205", "417633", "409201", "484783",
    // Riyad Bank
    "400861", "401757", "422817", "422818", "422819", "428331", "521076",
    "968206", "968207",
    // Alinma Bank
    "589005", "589206", "440647", "440795", "446404", "446393",
    // Bank AlJazira & Arab National Bank & SABB
    "407197", "407395", "412565", "428671", "428672", "428673", "535989"
];

export type PaymentMethodType = "mada" | "apple_pay" | "card";

export interface MadaCardDetails {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

export interface ApplePayPaymentData {
    token: {
        paymentData: any;
        paymentMethod: {
            displayName: string;
            network: string;
            type: string;
        };
        transactionIdentifier: string;
    };
}

export interface InitiatePaymentParams {
    method: PaymentMethodType;
    amount: number;
    vatAmount?: number;
    totalAmount: number;
    currency?: string; // Default: SAR
    studentName: string;
    parentEmail: string;
    phone: string;
    programId: string;
    programTitle: string;
    userId?: string | null;
    locale?: string;
    cardDetails?: MadaCardDetails;
    applePayData?: ApplePayPaymentData;
}

/**
 * Checks if a given card number matches a Saudi MADA debit card BIN
 */
export function isMadaCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (cleaned.length < 6) return false;
    const bin6 = cleaned.substring(0, 6);
    return MADA_BINS.includes(bin6);
}

/**
 * Standard Luhn validation algorithm for payment cards
 */
export function validateCardNumberLuhn(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

/**
 * Returns standard Apple Pay Session request parameters for Saudi Arabia
 */
export function getApplePaySessionConfiguration(amount: number, programTitle: string) {
    return {
        countryCode: "SA",
        currencyCode: "SAR",
        merchantCapabilities: ["supports3DS", "supportsDebit", "supportsCredit"],
        supportedNetworks: ["mada", "visa", "masterCard"],
        total: {
            label: "Young Leaders Academy - " + programTitle,
            amount: (amount * 1.15).toFixed(2), // Amount including 15% Saudi VAT
            type: "final"
        }
    };
}

/**
 * Normalizes payment gateway responses for both Tap Payments & Moyasar
 */
export function formatGatewayTransaction(gateway: "tap" | "moyasar" | "direct", response: any) {
    if (gateway === "tap") {
        return {
            transactionId: response.id || `tap_${Date.now()}`,
            status: response.status === "CAPTURED" ? "paid" : "pending",
            redirectUrl: response.transaction?.url || null,
            gateway: "tap",
        };
    } else if (gateway === "moyasar") {
        return {
            transactionId: response.id || `moy_${Date.now()}`,
            status: response.status === "paid" ? "paid" : "pending",
            redirectUrl: response.source?.transaction_url || null,
            gateway: "moyasar",
        };
    }

    // Direct / Mock fallback
    return {
        transactionId: `txn_sa_${Math.floor(100000 + Math.random() * 900000)}`,
        status: "paid",
        redirectUrl: null,
        gateway: "direct",
    };
}
