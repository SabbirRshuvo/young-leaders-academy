const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: courses, error: err1 } = await supabase.from('courses').select('*').limit(1);
  console.log("Courses schema sample:", courses, err1);

  const { data: unis, error: err2 } = await supabase.from('universities').select('*').limit(1);
  console.log("Universities schema sample:", unis, err2);
}

check();
