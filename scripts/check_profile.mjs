import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function checkProfile() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing SUPABASE ENV VARS");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
        console.error("Error fetching users:", userError);
        return;
    }

    const targetUser = users.users.find(u => u.email === 'sabbirstudent@gmail.com');
    if (!targetUser) {
        console.log("User sabbirstudent@gmail.com not found in auth.users.");
        return;
    }

    console.log("User found:", targetUser.id);

    // 2. Get profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .maybeSingle();

    if (profileError) {
        console.error("Error fetching profile:", profileError);
    } else {
        console.log("Profile data:", profile);
    }

    // 3. Get user_roles
    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUser.id);

    if (rolesError) {
        console.error("Error fetching user_roles:", rolesError);
    } else {
        console.log("User roles:", roles);
    }
}

checkProfile();
