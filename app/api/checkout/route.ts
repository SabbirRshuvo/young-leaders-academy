import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
    isMadaCard,
    validateCardNumberLuhn,
    MadaCardDetails
} from "@/lib/payments/mada-applepay";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            method = "mada",
            amount,
            vatAmount: customVat,
            totalAmount: customTotal,
            currency = "SAR",
            studentName,
            parentEmail,
            phone,
            programId,
            programTitle,
            userId,
            locale = "en",
            cardDetails,
            applePayToken,
            entityType = "course",
        } = body;

        // ----------------------------------------
        // 1. Validation
        // ----------------------------------------
        if (!studentName || !parentEmail || !programId || !amount) {
            return NextResponse.json({
                success: false,
                error: "Missing required enrollment & billing details"
            }, { status: 400 });
        }

        const baseAmount = Number(amount);
        const vat = customVat !== undefined ? Number(customVat) : baseAmount * 0.15;
        const total = customTotal !== undefined ? Number(customTotal) : baseAmount + vat;

        // Validate MADA card inputs if method is MADA
        if (method === "mada" && cardDetails) {
            const cleanCard = (cardDetails.cardNumber || "").replace(/\s+/g, "");
            if (cleanCard.length >= 6 && !isMadaCard(cleanCard)) {
                // If it's a Visa/Mastercard processed via MADA tab, allow it but classify as card
                console.log("Card is standard Visa/MasterCard rather than MADA BIN");
            }
        }

        // Check for double enrollment
        if (userId && programId) {
            const { data: existingEnrollment } = await supabase
                .from("enrollments")
                .select("id")
                .eq("user_id", userId)
                .eq("program_id", programId)
                .maybeSingle();

            if (existingEnrollment) {
                return NextResponse.json({
                    success: false,
                    alreadyEnrolled: true,
                    redirectUrl: `/${locale}/programs/${programId}/play`,
                    error: "You are already enrolled in this program."
                }, { status: 400 });
            }
        }

        // ----------------------------------------
        // 2. Create Pending Payment in Supabase
        // ----------------------------------------
        const { data: paymentRecord, error: paymentInsertError } = await supabase
            .from("payments")
            .insert([{
                student_name: studentName,
                parent_email: parentEmail,
                phone: phone || null,
                program_id: programId,
                program_title: programTitle || programId,
                amount: baseAmount,
                vat_amount: vat,
                total_amount: total,
                currency: currency,
                payment_status: "pending",
                payment_gateway: method, // 'mada' | 'apple_pay' | 'card'
            }])
            .select()
            .single();

        if (paymentInsertError) {
            console.error("Supabase payment insert error:", paymentInsertError);
            return NextResponse.json({
                success: false,
                error: "Failed to initialize payment record in database",
            }, { status: 500 });
        }

        // ----------------------------------------
        // 3. Gateway Processing (Moyasar / Tap / Dev Mock)
        // ----------------------------------------
        const moyasarKey = process.env.MOYASAR_SECRET_KEY || process.env.MOYASAR_API_KEY;
        const tapKey = process.env.TAP_SECRET_KEY;
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        let transactionId = `txn_${method}_${Date.now()}`;
        let redirect3dsUrl: string | null = null;
        let isPaid = false;

        // --- Option A: Moyasar Payment Gateway (KSA Gold Standard for MADA) ---
        if (moyasarKey) {
            try {
                // Amount in halalas (1 SAR = 100 Halalas)
                const amountInHalalas = Math.round(total * 100);

                let sourcePayload: any = {};

                if (method === "mada" || method === "card") {
                    const cleanNumber = (cardDetails?.cardNumber || "").replace(/\s+/g, "");
                    const [expMonth, expYear] = (cardDetails?.expiryMonth && cardDetails?.expiryYear)
                        ? [cardDetails.expiryMonth, cardDetails.expiryYear]
                        : ["12", "28"];

                    sourcePayload = {
                        type: "creditcard",
                        name: cardDetails?.cardHolderName || studentName,
                        number: cleanNumber,
                        cvc: cardDetails?.cvv || "123",
                        month: expMonth,
                        year: expYear.length === 4 ? expYear.slice(-2) : expYear,
                    };
                } else if (method === "apple_pay" && applePayToken) {
                    sourcePayload = {
                        type: "applepay",
                        token: typeof applePayToken === "string" ? applePayToken : JSON.stringify(applePayToken),
                    };
                }

                const moyasarRes = await fetch("https://api.moyasar.com/v1/payments", {
                    method: "POST",
                    headers: {
                        "Authorization": `Basic ${Buffer.from(moyasarKey + ":").toString("base64")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: amountInHalalas,
                        currency: "SAR",
                        description: `YLA Enrollment - ${programTitle}`,
                        callback_url: `${origin}/api/payments/callback?paymentId=${paymentRecord.id}`,
                        source: sourcePayload,
                    }),
                });

                const moyasarData = await moyasarRes.json();

                if (moyasarData.id) {
                    transactionId = moyasarData.id;
                    if (moyasarData.status === "paid") {
                        isPaid = true;
                    } else if (moyasarData.source?.transaction_url) {
                        // 3D Secure SMS OTP challenge URL from Saudi Bank
                        redirect3dsUrl = moyasarData.source.transaction_url;
                    }
                } else if (moyasarData.message) {
                    throw new Error(moyasarData.message);
                }
            } catch (moyasarErr: any) {
                console.error("Moyasar payment error:", moyasarErr);
                return NextResponse.json({
                    success: false,
                    error: moyasarErr.message || "Failed to process payment via Moyasar",
                }, { status: 400 });
            }
        }
        // --- Option B: Tap Payments Gateway (GCC Standard) ---
        else if (tapKey) {
            try {
                const tapRes = await fetch("https://api.tap.company/v2/charges", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${tapKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: total,
                        currency: "SAR",
                        customer: {
                            first_name: studentName.split(" ")[0] || "Student",
                            last_name: studentName.split(" ").slice(1).join(" ") || "YLA",
                            email: parentEmail,
                            phone: { country_code: "966", number: (phone || "500000000").replace(/\D/g, "").slice(-9) },
                        },
                        source: { id: method === "apple_pay" ? "src_apple_pay" : "src_card" },
                        redirect: { url: `${origin}/api/payments/callback?paymentId=${paymentRecord.id}` },
                    }),
                });
                const tapData = await tapRes.json();
                if (tapData.transaction?.url) {
                    redirect3dsUrl = tapData.transaction.url;
                    transactionId = tapData.id;
                } else if (tapData.status === "CAPTURED") {
                    isPaid = true;
                    transactionId = tapData.id;
                }
            } catch (tapErr: any) {
                console.warn("Tap Gateway call skipped or failed:", tapErr);
            }
        }
        // --- Option C: Sandbox / Dev Mode (when no live gateway key is set yet) ---
        else {
            // Simulate 3D Secure / token authorization verification
            await new Promise((resolve) => setTimeout(resolve, 1000));
            isPaid = true;
        }

        // ----------------------------------------
        // 4. Update Payment & Auto-Enroll If Paid
        // ----------------------------------------
        if (isPaid && !redirect3dsUrl) {
            await supabase
                .from("payments")
                .update({
                    payment_status: "paid",
                    transaction_id: transactionId,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", paymentRecord.id);

            // Auto-enroll user in program / course
            if (userId) {
                // Course enrollment
                try {
                    await supabase
                        .from("enrollments")
                        .upsert([{
                            user_id: userId,
                            program_id: programId,
                        }], { onConflict: "user_id,program_id" });

                    // Also record in course_enrollments if used
                    await supabase
                        .from("course_enrollments")
                        .upsert([{
                            user_id: userId,
                            course_id: programId,
                            status: "active",
                        }], { onConflict: "user_id,course_id" });
                } catch {
                    // Ignore duplicate or schema variation errors
                }
            }
        }

        // ----------------------------------------
        // 5. Response
        // ----------------------------------------
        return NextResponse.json({
            success: true,
            paymentId: paymentRecord.id,
            transactionId,
            redirect3dsUrl,
            status: redirect3dsUrl ? "3ds_required" : "paid",
            redirectUrl: `/${locale}/apply/success?id=${paymentRecord.id}`,
            totalAmount: total,
            currency,
        });

    } catch (error: any) {
        console.error("Checkout API error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal Server Error during checkout",
        }, { status: 500 });
    }
}
