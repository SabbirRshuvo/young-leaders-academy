import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create the universities table if it doesn't exist
    const { error: uniError } = await supabase.rpc('execute_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS public.universities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                country VARCHAR(100),
                description TEXT,
                website_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `
    });

    // If RPC doesn't exist, we can't run raw SQL from client directly. 
    // Wait, let's just insert a dummy record and see if it fails.
    const { data, error: insertError } = await supabase
        .from('universities')
        .insert({ name: 'Harvard University', country: 'USA' })
        .select()
        .single();

    return NextResponse.json({
        uniError: uniError?.message || "none",
        insertError: insertError?.message || "none",
        data
    });
}
