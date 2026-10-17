import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Extract payment identifier and status from gateway payload
        // Compatible with Tap Payments and Moyasar webhook structures
        const transactionId = body.id || body.data?.id;
        const status = (body.status || body.data?.status || "").toLowerCase();
        const paymentId = body.metadata?.payment_id || body.data?.metadata?.payment_id;

        console.log(`Payment Webhook Received: txn=${transactionId}, status=${status}, paymentId=${paymentId}`);

        if (status === "captured" || status === "paid" || status === "succeeded") {
            let query = supabase.from("payments").update({
                payment_status: "paid",
                transaction_id: transactionId,
                updated_at: new Date().toISOString()
            });

            if (paymentId) {
                query = query.eq("id", paymentId);
            } else if (transactionId) {
                query = query.eq("transaction_id", transactionId);
            }

            const { data: updatedPayment, error: updateErr } = await query.select().single();

            if (!updateErr && updatedPayment) {
                // Check if user should be enrolled in program
                if (updatedPayment.program_id) {
                    console.log(`Payment confirmed for ${updatedPayment.student_name}. Enrolling student.`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Webhook processing error:", err);
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }
}
