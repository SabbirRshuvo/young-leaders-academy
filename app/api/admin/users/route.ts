import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    
    // Check client session
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // ignore
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== "admin" && user.email !== "adminsabbir@gmail.com") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Initialize Admin client to get all users
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: authUsersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

    const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('*');
    if (profError) return NextResponse.json({ error: profError.message }, { status: 500 });

    const { data: userRoles, error: rolesError } = await supabaseAdmin.from('user_roles').select('*, roles(name)');
    if (rolesError) return NextResponse.json({ error: rolesError.message }, { status: 500 });

    const users = authUsersData.users.map((u) => {
        const profile = profiles.find(p => p.id === u.id);
        const roles = userRoles.filter(ur => ur.user_id === u.id).map(ur => ur.roles?.name);
        // Fallback to metadata if no role in db
        const effectiveRoles = roles.length > 0 ? roles : [u.user_metadata?.role || "student"];
        
        return {
            id: u.id,
            email: u.email,
            first_name: profile?.first_name || "",
            last_name: profile?.last_name || "",
            roles: effectiveRoles,
            created_at: u.created_at
        };
    });

    return NextResponse.json({ users });
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

    const { userId, action } = await request.json();
    if (!userId || !action) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the admin role ID
    const { data: adminRole } = await supabaseAdmin.from('roles').select('id').eq('name', 'admin').single();
    const { data: studentRole } = await supabaseAdmin.from('roles').select('id').eq('name', 'student').single();

    if (!adminRole || !studentRole) return NextResponse.json({ error: "Role definitions missing" }, { status: 500 });

    if (action === "make_admin") {
        // Remove existing roles
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
        // Insert admin role
        await supabaseAdmin.from('user_roles').insert({ user_id: userId, role_id: adminRole.id });
        // Update metadata
        await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { role: "admin" } });
        return NextResponse.json({ success: true, message: "User is now an Admin" });
    } else if (action === "remove_admin") {
        // Remove existing roles
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
        // Insert student role
        await supabaseAdmin.from('user_roles').insert({ user_id: userId, role_id: studentRole.id });
        // Update metadata
        await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { role: "student" } });
        return NextResponse.json({ success: true, message: "Admin rights removed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
