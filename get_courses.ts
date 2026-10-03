import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrbwdrwqfskfvkgirrkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYndkcndxZnNrZnZrZ2lycmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5Mjg1NywiZXhwIjoyMTA0NzY4ODU3fQ.rWLSmpG4bP_0aEx-tQxNDazXYBCtFOB6Z6jQke83wZ4'
);

async function main() {
  const { data, error } = await supabase.from('courses').select('id, title');
  if (error) {
    console.error('Error fetching courses:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
