import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthenticatedUser(req: Request) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (token) {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
            return user;
        }
    }

    // Fallback to session cookies
    try {
        const cookieStore = await cookies();
        const serverClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );
        const { data: { user } } = await serverClient.auth.getUser();
        if (user) return user;
    } catch (e) {
        console.warn("Failed to retrieve user from cookies:", e);
    }

    return null;
}

export async function GET(req: Request) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
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
            .eq("student_id", user.id)
            .eq("status", "pending");

        if (requestsError) {
            console.error("Error fetching incoming requests:", requestsError);
            return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
        }

        // Fetch parent emails
        const parentIds = requests?.map(r => r.parent_id) || [];
        let parentUsers: { id: string; email?: string }[] = [];
        if (parentIds.length > 0) {
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            parentUsers = (users || []).filter(u => parentIds.includes(u.id)).map(u => ({ id: u.id, email: u.email }));
        }

        return NextResponse.json({ requests: requests || [], parentUsers });
    } catch (error) {
        console.error("GET /api/student/requests error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { requestId, status } = body;

        // Support both "approved" (from UI) and "accepted" (DB constraint) as well as "rejected"
        const isApprove = status === "approved" || status === "accepted";
        const isReject = status === "rejected";

        if (!requestId || (!isApprove && !isReject)) {
            return NextResponse.json(
                { error: "Invalid request data. Status must be approved/accepted or rejected." },
                { status: 400 }
            );
        }

        const dbStatus = isApprove ? "accepted" : "rejected";

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
            return NextResponse.json({
                success: true,
                message: `Request is already ${request.status}`,
                status: request.status
            });
        }

        // If approving, ensure both parent_profiles and student_profiles exist to satisfy FK constraints
        if (isApprove) {
            // 1. Ensure parent exists in parent_profiles
            const { error: parentProfileErr } = await supabaseAdmin
                .from("parent_profiles")
                .upsert(
                    { id: request.parent_id }, 
                    { onConflict: "id", ignoreDuplicates: true }
                );

            if (parentProfileErr) {
                console.warn("parent_profiles upsert note:", parentProfileErr);
            }

            // 2. Ensure student exists in student_profiles
            const { error: studentProfileErr } = await supabaseAdmin
                .from("student_profiles")
                .upsert(
                    { id: request.student_id }, 
                    { onConflict: "id", ignoreDuplicates: true }
                );

            if (studentProfileErr) {
                console.warn("student_profiles upsert note:", studentProfileErr);
            }

            // 3. Ensure no duplicate relationship in parent_student_relationships
            const { data: existing } = await supabaseAdmin
                .from("parent_student_relationships")
                .select("id")
                .eq("parent_id", request.parent_id)
                .eq("student_id", request.student_id);

            if (!existing || existing.length === 0) {
                const { error: insertError } = await supabaseAdmin
                    .from("parent_student_relationships")
                    .insert([
                        {
                            parent_id: request.parent_id,
                            student_id: request.student_id,
                            relationship: "parent",
                            is_primary_guardian: true
                        }
                    ]);

                if (insertError) {
                    console.error("Failed to insert parent_student_relationship:", insertError);
                    return NextResponse.json(
                        { error: "Failed to create relationship", details: insertError.message },
                        { status: 500 }
                    );
                }
            }
        }

        // Update request status in parent_child_requests
        const { error: updateError } = await supabaseAdmin
            .from("parent_child_requests")
            .update({
                status: dbStatus,
                responded_at: new Date().toISOString()
            })
            .eq("id", requestId);

        if (updateError) {
            console.error("Failed to update parent_child_requests:", updateError);
            return NextResponse.json(
                { error: "Failed to update request", details: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, status: dbStatus });
    } catch (error: any) {
        console.error("PATCH /api/student/requests error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
