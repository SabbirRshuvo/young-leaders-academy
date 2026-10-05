import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = "adminsabbir@gmail.com";
    const password = "11223344";

    // 2. Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Master", last_name: "Admin" },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        // If already registered, let's still try to fix their profile just in case
        console.log("User already exists, attempting to ensure profile is set up...");
      } else {
        return NextResponse.json(
          { error: "Auth creation failed", details: authError.message },
          { status: 400 }
        );
      }
    }

    // Determine the user ID
    let userId = authData?.user?.id;

    if (!userId) {
      // Find the existing user ID if they were already registered
      const { data: existingUsers, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
      if (fetchError) {
         return NextResponse.json(
           { error: "Could not fetch existing users.", details: fetchError.message },
           { status: 500 }
         );
      }
      
      const existingUser = existingUsers.users.find((u) => u.email === email);
      if (!existingUser) {
        return NextResponse.json(
          { error: "User already registered but could not find them in the list." },
          { status: 500 }
        );
      }
      userId = existingUser.id;
    }

    // 3. Upsert into public.profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      first_name: "Master",
      last_name: "Admin",
      role: "admin",
      country: "US",
      preferred_language: "english",
      is_active: true,
    });

    if (profileError) {
      return NextResponse.json(
        { error: "Profile creation failed", details: profileError.message },
        { status: 500 }
      );
    }

    // 4. Also ensure user_roles has the right role_id for admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (roleData && !roleError) {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role_id: roleData.id,
      });
    }

    return NextResponse.json({
      message: "Master Admin seeded successfully!",
      email,
      password,
      note: "You can now log in with these credentials.",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Unexpected error occurred", details: error.message },
      { status: 500 }
    );
  }
}
