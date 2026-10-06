import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id;
    const cookieStore = await cookies();
    
    // Check client session
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
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

    // Initialize Admin client to bypass RLS for fetching user details
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Fetch Profile for Status
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // Fetch Enrollments gracefully
        let enrollments: any[] = [];
        try {
            const { data } = await supabaseAdmin
                .from('enrollments')
                .select(`id, status, created_at, program:programs (id, title, status)`)
                .eq('student_id', userId);
            if (data) enrollments = data;
        } catch (e) {
            console.warn("Enrollments fetch failed for user", userId, e);
        }

        // Fetch User Progress gracefully
        let progress: any[] = [];
        try {
            const { data } = await supabaseAdmin
                .from('user_progress')
                .select('*')
                .eq('student_id', userId);
            if (data) progress = data;
        } catch (e) {
            console.warn("Progress fetch failed for user", userId, e);
        }

        // Return aggregated data
        return NextResponse.json({ 
            profile: profile || null,
            enrollments, 
            progress
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
