import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrbwdrwqfskfvkgirrkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYndkcndxZnNrZnZrZ2lycmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5Mjg1NywiZXhwIjoyMTA0NzY4ODU3fQ.rWLSmpG4bP_0aEx-tQxNDazXYBCtFOB6Z6jQke83wZ4'
);

async function main() {
  const { data, error } = await supabase.from('applications').select('id').limit(1);
  console.log("applications:", error ? error.message : "Exists");
  
  const { data: data2, error: error2 } = await supabase.from('university_applications').select('id').limit(1);
  console.log("university_applications:", error2 ? error2.message : "Exists");
}

main();
