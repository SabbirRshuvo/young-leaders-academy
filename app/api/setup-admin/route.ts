import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ 
            error: "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file." 
        }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const adminEmail = "adminsabbir@gmail.com";
        const adminPassword = "123445678";

        // 1. Create or update the master admin user in auth.users
        let userId;
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true, // Force confirm email
            user_metadata: { role: "admin", first_name: "Master", last_name: "Admin" }
        });

        if (authError) {
            // If the user already exists, update their password and force confirm their email
            if (authError.message.includes("already registered") || authError.code === 'email_exists') {
                const { data: listData } = await supabase.auth.admin.listUsers();
                const user = listData.users.find((u: any) => u.email === adminEmail);
                if (user) {
                    userId = user.id;
                    await supabase.auth.admin.updateUserById(userId, {
                        password: adminPassword,
                        email_confirm: true,
                    });
                } else {
                    return NextResponse.json({ error: "User exists but could not be found" }, { status: 500 });
                }
            } else {
                return NextResponse.json({ error: "Failed to create user in auth.users", details: authError }, { status: 500 });
            }
        } else {
            userId = authData.user.id;
        }

        // 2. Update the profiles table
        if (userId) {
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: userId,
                    first_name: "Master",
                    last_name: "Admin",
                    role: "admin", // Explicitly setting the role in the profiles table as requested
                    is_active: true
                });

            if (profileError) {
                return NextResponse.json({ error: "Failed to upsert profile", details: profileError }, { status: 500 });
            }

            // 3. (Optional but recommended) Also ensure the user_roles table is populated correctly 
            // since your login page checks the user_roles table for "admin".
            const { data: roleData } = await supabase
                .from("roles")
                .select("id")
                .eq("name", "admin")
                .single();

            if (roleData) {
                const roleId = roleData.id;
                const { data: existingUserRole } = await supabase
                    .from("user_roles")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("role_id", roleId)
                    .single();

                if (!existingUserRole) {
                    await supabase
                        .from("user_roles")
                        .insert({
                            user_id: userId,
                            role_id: roleId
                        });
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Admin user created successfully! The email is confirmed and the password is set. You can now log in.",
            email: adminEmail,
            userId: userId
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Unexpected error occurred", details: error.message }, { status: 500 });
    }
}
