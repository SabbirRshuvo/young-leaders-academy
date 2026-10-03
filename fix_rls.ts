import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrbwdrwqfskfvkgirrkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYndkcndxZnNrZnZrZ2lycmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5Mjg1NywiZXhwIjoyMTA0NzY4ODU3fQ.rWLSmpG4bP_0aEx-tQxNDazXYBCtFOB6Z6jQke83wZ4'
);

async function main() {
  const query = `
    DO $$ 
    BEGIN
      -- Create SELECT policies for courses, modules, lessons, course_progress
      
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public courses are viewable by everyone' AND tablename = 'courses') THEN
        CREATE POLICY "Public courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public modules are viewable by everyone' AND tablename = 'modules') THEN
        CREATE POLICY "Public modules are viewable by everyone" ON public.modules FOR SELECT USING (true);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public lessons are viewable by everyone' AND tablename = 'lessons') THEN
        CREATE POLICY "Public lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
      END IF;

    END $$;
  `;
  // We can't run raw SQL easily without RPC, but let's just create an RPC function or just check if it's an RLS issue.
}

main();
