import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// Initialize a service role client to query auth.users if needed
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        // Get the current user
        const { data: { user }, error: userError } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();
            
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch parent's child requests and approved connections
        const { data: requests, error: requestsError } = await supabaseAdmin
            .from("parent_child_requests")
            .select(`
                *,
                student:profiles!student_id(
                    id, first_name, last_name, avatar_url
                )
            `)
            .eq("parent_id", user.id);

        if (requestsError) {
            console.error("Error fetching child requests:", requestsError);
            return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
        }

        // Also fetch from parent_student_relationships for any approved connections
        const { data: relationships, error: relError } = await supabaseAdmin
            .from("parent_student_relationships")
            .select(`
                *,
                student:profiles!student_id(
                    id, first_name, last_name, avatar_url
                )
            `)
            .eq("parent_id", user.id);

        if (relError) {
            console.error("Error fetching relationships:", relError);
        }

        // Fetch student profiles for school/grade info
        const studentIds = [
            ...(requests || []).map(r => r.student_id),
            ...(relationships || []).map(r => r.student_id)
        ];

        let studentProfiles: any[] = [];
        if (studentIds.length > 0) {
            const { data: sp } = await supabaseAdmin
                .from("student_profiles")
                .select("id, school_name, grade_level, city")
                .in("id", studentIds);
            if (sp) studentProfiles = sp;
        }

        // Fetch applications for these students to count them
        let studentApplications: any[] = [];
        // Applications are tied by email, so we need the emails of students
        // We will do our best by fetching all applications and mapping (if we can find the emails)
        // Since we don't have emails directly from the join, we can fetch users by ID
        const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
        const studentEmails = allUsers
            .filter(u => studentIds.includes(u.id))
            .map(u => u.email)
            .filter(Boolean);

        if (studentEmails.length > 0) {
            const { data: apps } = await supabaseAdmin
                .from("university_applications")
                .select("id, email, program_id")
                .in("email", studentEmails);
            if (apps) studentApplications = apps;
        }

        return NextResponse.json({
            requests: requests || [],
            relationships: relationships || [],
            studentProfiles,
            studentApplications,
            users: allUsers.filter(u => studentIds.includes(u.id)).map(u => ({ id: u.id, email: u.email }))
        });
    } catch (error) {
        console.error("GET /api/parent/children error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
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
        const { studentEmail } = body;

        if (!studentEmail) {
            return NextResponse.json({ error: "Student email is required" }, { status: 400 });
        }

        // Find student by email
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const studentUser = users.find(u => u.email?.toLowerCase() === studentEmail.toLowerCase());

        if (!studentUser) {
            return NextResponse.json({ error: "Student not found with that email address" }, { status: 404 });
        }

        if (studentUser.id === user.id) {
            return NextResponse.json({ error: "You cannot add yourself as a child" }, { status: 400 });
        }

        // Check if request already exists
        const { data: existingRequests } = await supabaseAdmin
            .from("parent_child_requests")
            .select("*")
            .eq("parent_id", user.id)
            .eq("student_id", studentUser.id);

        if (existingRequests && existingRequests.length > 0) {
            const req = existingRequests[0];
            
            if (req.status === "pending" || req.status === "accepted") {
                return NextResponse.json({ error: "A connection or pending request already exists for this student" }, { status: 400 });
            }
            
            if (req.status === "rejected") {
                // If previously rejected, update it to pending so they can try again
                const { data: updatedRequest, error: updateError } = await supabaseAdmin
                    .from("parent_child_requests")
                    .update({ status: "pending", created_at: new Date().toISOString() })
                    .eq("id", req.id)
                    .select()
                    .single();
                    
                if (updateError) {
                    console.error("Error updating rejected request:", updateError);
                    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
                }
                
                return NextResponse.json({ success: true, request: updatedRequest });
            }
        }

        // Create a brand new request
        const { data: newRequest, error: insertError } = await supabaseAdmin
            .from("parent_child_requests")
            .insert([
                {
                    parent_id: user.id,
                    student_id: studentUser.id,
                    status: "pending"
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting request:", insertError);
            return NextResponse.json({ error: "Failed to create request", details: insertError }, { status: 500 });
        }

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        console.error("POST /api/parent/children error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
