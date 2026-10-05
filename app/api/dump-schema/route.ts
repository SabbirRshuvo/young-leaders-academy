import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: courses } = await supabase.from('courses').select('*').limit(1);
    const { data: universities } = await supabase.from('universities').select('*').limit(1);

    return NextResponse.json({
        courses: courses?.[0] || "No courses",
        universities: universities?.[0] || "No universities"
    });
}
