import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        const { data: { user }, error: userError } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();
            
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: requests, error: requestsError } = await supabaseAdmin
            .from("parent_child_requests")
            .select(`
                *,
                parent:profiles!parent_id(
                    id, first_name, last_name, avatar_url, phone, country
                )
            `)
            .eq("student_id", user.id);

        if (requestsError) {
            console.error("Error fetching incoming requests:", requestsError);
            return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
        }

        // We can optionally fetch parent emails
        const parentIds = requests?.map(r => r.parent_id) || [];
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const parentUsers = users.filter(u => parentIds.includes(u.id)).map(u => ({ id: u.id, email: u.email }));

        return NextResponse.json({ requests: requests || [], parentUsers });
    } catch (error) {
        console.error("GET /api/student/requests error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        const { data: { user }, error: userError } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();
            
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { requestId, status } = body; // status can be "accepted" or "rejected"

        if (!requestId || !["accepted", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Verify the request belongs to this student
        const { data: request, error: fetchError } = await supabaseAdmin
            .from("parent_child_requests")
            .select("*")
            .eq("id", requestId)
            .single();

        if (fetchError || !request || request.student_id !== user.id) {
            return NextResponse.json({ error: "Request not found or unauthorized" }, { status: 404 });
        }

        if (request.status !== "pending") {
            return NextResponse.json({ error: "Request is already processed" }, { status: 400 });
        }

        // Update request status
        const { error: updateError } = await supabaseAdmin
            .from("parent_child_requests")
            .update({ status })
            .eq("id", requestId);

        if (updateError) {
            require('fs').appendFileSync('.error.log', JSON.stringify({ point: 'updateError', details: updateError }) + '\n');
            return NextResponse.json({ error: "Failed to update request", details: updateError }, { status: 500 });
        }

        // If accepted, create relationship
        if (status === "accepted") {
            // Ensure parent exists in parent_profiles to satisfy foreign key constraint
            await supabaseAdmin.from("parent_profiles").upsert(
                { id: request.parent_id }, 
                { onConflict: "id", ignoreDuplicates: true }
            );

            // Ensure no duplicate relationship
            const { data: existing } = await supabaseAdmin
                .from("parent_student_relationships")
                .select("*")
                .eq("parent_id", request.parent_id)
                .eq("student_id", request.student_id);

            if (!existing || existing.length === 0) {
                const { error: insertError } = await supabaseAdmin
                    .from("parent_student_relationships")
                    .insert([
                        {
                            parent_id: request.parent_id,
                            student_id: request.student_id
                        }
                    ]);
                if (insertError) {
                    require('fs').appendFileSync('.error.log', JSON.stringify({ point: 'insertError', details: insertError }) + '\n');
                    return NextResponse.json({ error: "Failed to create relationship", details: insertError }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error("PATCH /api/student/requests error:", error);
        require('fs').appendFileSync('.error.log', JSON.stringify({ point: 'catchError', message: error?.message, stack: error?.stack }) + '\n');
        return NextResponse.json({ error: "Internal server error", details: error?.message || String(error) }, { status: 500 });
    }
}
