import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: usersData } = await supabase.auth.admin.listUsers();
    const users = usersData?.users || [];
    let results = [];

    // Find any user containing 'employeewixsabbir'
    const targetUsers = users.filter(u => u.email?.includes('employeewixsabbir'));

    if (targetUsers.length === 0) {
        return NextResponse.json({ message: "No user with 'employeewixsabbir' found at all." });
    }

    for (const targetUser of targetUsers) {
        // 1. Delete from user_roles
        const { error: rolesError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', targetUser.id);

        // 2. Delete from profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', targetUser.id);

        // 3. Delete from Supabase Auth completely
        const { error: authError } = await supabase.auth.admin.deleteUser(targetUser.id);

        results.push({
            email: targetUser.email,
            status: "deleted permanently",
            rolesError: rolesError?.message || "none",
            profileError: profileError?.message || "none",
            authError: authError?.message || "none"
        });
    }

    return NextResponse.json({ results });
}
