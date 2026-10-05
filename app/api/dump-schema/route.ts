import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    return NextResponse.json({
        profilesCount,
        authUsersCount: authUsers?.users?.length || 0,
        authUsersError: error?.message || null
    });
}
