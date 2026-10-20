import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    const status = searchParams.get("status") || searchParams.get("tap_id");
    const moyasarId = searchParams.get("id"); // Moyasar passes payment ID

    if (!paymentId) {
        return NextResponse.redirect(`${origin}/?payment=error`);
    }

    try {
        // Fetch payment record
        const { data: payment } = await supabase
            .from("payments")
            .select("*")
            .eq("id", paymentId)
            .single();

        if (payment) {
            // Update to paid
            await supabase
                .from("payments")
                .update({
                    payment_status: "paid",
                    transaction_id: moyasarId || payment.transaction_id || `3ds_${Date.now()}`,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", paymentId);

            // Auto enroll user if user_id exists on record or profiles
            if (payment.program_id) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("email", payment.parent_email)
                    .maybeSingle();

                const userId = profile?.id;
                if (userId) {
                    await supabase
                        .from("enrollments")
                        .upsert([{
                            user_id: userId,
                            program_id: payment.program_id,
                            status: "active"
                        }], { onConflict: "user_id,program_id" })
                        .catch(() => {});
                }
            }
        }

        return NextResponse.redirect(`${origin}/en/apply/success?id=${paymentId}`);
    } catch (err) {
        console.error("Payment callback error:", err);
        return NextResponse.redirect(`${origin}/?payment=failed`);
    }
}
