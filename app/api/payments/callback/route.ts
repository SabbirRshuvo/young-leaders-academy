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

            // Auto enroll user if user_id exists on record or via parent_email
            if (payment.program_id) {
                let userId = payment.user_id;
                if (!userId && payment.parent_email) {
                    const { data: authUsers } = await supabase.auth.admin.listUsers();
                    const matchingUser = authUsers?.users?.find(
                        (u) => u.email?.toLowerCase() === payment.parent_email.toLowerCase()
                    );
                    if (matchingUser) {
                        userId = matchingUser.id;
                    }
                }

                if (userId) {
                    try {
                        await supabase
                            .from("enrollments")
                            .upsert([{
                                user_id: userId,
                                program_id: payment.program_id,
                            }], { onConflict: "user_id,program_id" });
                    } catch {
                        // Ignore duplicate or schema variation errors
                    }
                }
            }
        }

        return NextResponse.redirect(`${origin}/en/apply/success?id=${paymentId}`);
    } catch (err) {
        console.error("Payment callback error:", err);
        return NextResponse.redirect(`${origin}/?payment=failed`);
    }
}
