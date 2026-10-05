// removed dotenv
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  console.log("Setting up master admin and roles...");

  // 1. Ensure roles exist
  console.log("Checking roles table...");
  const rolesToEnsure = ["admin", "pending_admin"];

  for (const roleName of rolesToEnsure) {
    const { data: roleData, error: roleSearchError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (!roleData) {
      console.log(`Role '${roleName}' not found. Creating...`);
      const { error: insertError } = await supabase
        .from("roles")
        .insert({ name: roleName, description: `Role for ${roleName}` });
      if (insertError) {
        console.error(`Error creating role ${roleName}:`, insertError);
      } else {
        console.log(`Role '${roleName}' created successfully.`);
      }
    } else {
      console.log(`Role '${roleName}' already exists.`);
    }
  }

  // 2. Create the master admin user
  const adminEmail = "adminsabbir@gmail.com";
  const adminPassword = "11223344";

  console.log(`Checking if master admin user (${adminEmail}) exists...`);

  // Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { role: "admin", first_name: "Master", last_name: "Admin" }
  });

  let userId;

  if (authError) {
    if (authError.message.includes("already registered") || authError.code === 'email_exists') {
      console.log(`User ${adminEmail} already exists. Getting ID...`);
      // User exists, find them
      const { data: listData } = await supabase.auth.admin.listUsers();
      const user = listData.users.find(u => u.email === adminEmail);
      if (user) {
        userId = user.id;

        // Update their password and metadata just in case
        await supabase.auth.admin.updateUserById(userId, {
          password: adminPassword,
          user_metadata: { role: "admin", first_name: "Master", last_name: "Admin" }
        });
      }
    } else {
      console.error("Error creating auth user:", authError);
      process.exit(1);
    }
  } else {
    console.log("Auth user created successfully.");
    userId = authData.user.id;
  }

  // 3. Upsert into profiles
  if (userId) {
    console.log("Upserting profile data...");
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        first_name: "Master",
        last_name: "Admin",
        preferred_language: "english"
      });

    if (profileError) {
      console.error("Error upserting profile:", profileError);
    } else {
      console.log("Profile data saved.");
    }

    // 4. Assign role in user_roles
    const { data: adminRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (adminRole) {
      console.log("Checking user_roles...");

      const { data: existingUserRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role_id", adminRole.id)
        .single();

      if (!existingUserRole) {
        console.log("Assigning admin role to user...");
        const { error: userRoleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role_id: adminRole.id
          });

        if (userRoleError) {
          console.error("Error assigning user role:", userRoleError);
        } else {
          console.log("Admin role assigned successfully.");
        }
      } else {
        console.log("User already has admin role assigned.");
      }
    }
  }

  console.log("Setup complete!");
}

setupAdmin();
