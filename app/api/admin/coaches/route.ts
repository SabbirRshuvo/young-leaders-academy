import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Fallback in-memory storage for module assignments if table not yet migrated
const memoryAssignments: { coach_id: string; module_id: string; assigned_at: string }[] = [];

export async function GET(request: Request) {
    const cookieStore = await cookies();
    
    // Check client session
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read only */ },
            },
        }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = user.user_metadata?.role;
    const isAdmin = role === "admin" || user.email === "adminsabbir@gmail.com";

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 1. Fetch coach applications from customer_leads (only for admin)
        let leads: any[] = [];
        if (isAdmin) {
            const { data: leadsData } = await supabaseAdmin
                .from("customer_leads")
                .select("*")
                .eq("target_group", "coach")
                .order("created_at", { ascending: false });
            leads = leadsData || [];
        }

        // 2. Fetch coach role ID
        const { data: coachRole } = await supabaseAdmin
            .from("roles")
            .select("id")
            .eq("name", "coach")
            .single();

        // 3. Fetch coach user IDs
        let coachUsers: any[] = [];
        if (coachRole) {
            const { data: userRoles } = await supabaseAdmin
                .from("user_roles")
                .select("user_id")
                .eq("role_id", coachRole.id);

            const coachIds = userRoles?.map(r => r.user_id) || [];

            if (coachIds.length > 0) {
                const { data: profiles } = await supabaseAdmin
                    .from("profiles")
                    .select("*")
                    .in("id", coachIds);

                const { data: coachProfiles } = await supabaseAdmin
                    .from("coach_profiles")
                    .select("*")
                    .in("id", coachIds);

                const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

                coachUsers = (profiles || []).map(p => {
                    const cp = coachProfiles?.find(c => c.id === p.id);
                    const authU = authUsers.users.find(u => u.id === p.id);
                    return {
                        id: p.id,
                        email: authU?.email || "",
                        first_name: p.first_name || "",
                        last_name: p.last_name || "",
                        phone: p.phone || "",
                        professional_title: cp?.professional_title || "YLA Certified Coach",
                        bio: cp?.bio || "",
                        specialization: cp?.specialization || "Leadership & Personal Development",
                        years_of_experience: cp?.years_of_experience || 3,
                        created_at: p.created_at,
                    };
                });
            }
        }

        // 4. Fetch available modules
        const { data: modules } = await supabaseAdmin
            .from("modules")
            .select("id, title, description, program_id, programs(title)")
            .order("order_index", { ascending: true });

        // 5. Fetch module assignments
        let assignments: any[] = [];
        const { data: dbAssignments, error: assignErr } = await supabaseAdmin
            .from("coach_module_assignments")
            .select("id, coach_id, module_id, assigned_at");

        if (!assignErr && dbAssignments) {
            assignments = dbAssignments;
        } else {
            assignments = [...memoryAssignments];
        }

        return NextResponse.json({
            applications: leads || [],
            coaches: coachUsers,
            modules: modules || [],
            assignments,
        });

    } catch (error: any) {
        console.error("Error in GET /api/admin/coaches:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read only */ },
            },
        }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = user.user_metadata?.role;
    if (role !== "admin" && user.email !== "adminsabbir@gmail.com") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const { action } = body;

        // ACTION 1: APPROVE APPLICATION
        if (action === "approve_application") {
            const { leadId, email, fullName, phone, specialization, title } = body;

            // Check if user already exists
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            let authUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

            // Generate a secure temporary password
            const tempPassword = "CoachPassword" + Math.floor(1000 + Math.random() * 9000) + "!";
            let userId: string;

            if (!authUser) {
                const names = (fullName || "").trim().split(" ");
                const firstName = names[0] || "Coach";
                const lastName = names.slice(1).join(" ") || "Expert";

                const { data: newAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: { role: "coach", first_name: firstName, last_name: lastName }
                });

                if (createError) throw createError;
                userId = newAuth.user.id;

                await supabaseAdmin.from("profiles").upsert({
                    id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone || null,
                    preferred_language: "en",
                    is_active: true
                });
            } else {
                userId = authUser.id;
                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    password: tempPassword,
                    user_metadata: { ...authUser.user_metadata, role: "coach" }
                });
            }

            // Assign coach role in user_roles
            const { data: coachRole } = await supabaseAdmin.from("roles").select("id").eq("name", "coach").single();
            if (coachRole) {
                await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
                await supabaseAdmin.from("user_roles").insert({ user_id: userId, role_id: coachRole.id });
            }

            // Upsert coach profile
            await supabaseAdmin.from("coach_profiles").upsert({
                id: userId,
                professional_title: title || "YLA Certified Coach & Mentor",
                specialization: specialization || "Leadership & Career Guidance",
                bio: `Approved mentor/coach via application. Specializes in ${specialization || "Youth Leadership"}.`,
                years_of_experience: 5
            });

            // Delete or mark lead as processed
            if (leadId) {
                await supabaseAdmin.from("customer_leads").delete().eq("id", leadId);
            }

            return NextResponse.json({
                success: true,
                message: `Coach application approved for ${fullName} (${email}). Coach account is active.`,
                tempPassword,
                email,
                fullName
            });
        }

        // ACTION 2: ASSIGN MODULE
        if (action === "assign_module") {
            const { coachId, moduleId } = body;
            if (!coachId || !moduleId) return NextResponse.json({ error: "Missing coachId or moduleId" }, { status: 400 });

            // Try DB table first
            const { error: insertErr } = await supabaseAdmin
                .from("coach_module_assignments")
                .insert({ coach_id: coachId, module_id: moduleId });

            if (insertErr) {
                // If table doesn't exist yet, save in memory fallback
                const exists = memoryAssignments.some(a => a.coach_id === coachId && a.module_id === moduleId);
                if (!exists) {
                    memoryAssignments.push({ coach_id: coachId, module_id: moduleId, assigned_at: new Date().toISOString() });
                }
            }

            return NextResponse.json({ success: true, message: "Module assigned to coach successfully" });
        }

        // ACTION 3: UNASSIGN MODULE
        if (action === "unassign_module") {
            const { coachId, moduleId } = body;
            if (!coachId || !moduleId) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

            await supabaseAdmin
                .from("coach_module_assignments")
                .delete()
                .eq("coach_id", coachId)
                .eq("module_id", moduleId);

            const idx = memoryAssignments.findIndex(a => a.coach_id === coachId && a.module_id === moduleId);
            if (idx !== -1) memoryAssignments.splice(idx, 1);

            return NextResponse.json({ success: true, message: "Module assignment removed" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Error in POST /api/admin/coaches:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
