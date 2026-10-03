import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mrbwdrwqfskfvkgirrkf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYndkcndxZnNrZnZrZ2lycmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5Mjg1NywiZXhwIjoyMTA0NzY4ODU3fQ.rWLSmpG4bP_0aEx-tQxNDazXYBCtFOB6Z6jQke83wZ4'
);

async function main() {
  const coursesToInsert = [
    { 
      title: { en: "Global Mentorship Program", ar: "برنامج الإرشاد العالمي" }, 
      description: { en: "Get guidance from industry leaders and alumni.", ar: "احصل على إرشادات من قادة الصناعة والخريجين." }
    },
    { 
      title: { en: "Future Skills & Executive Program", ar: "برنامج المهارات المستقبلية والتنفيذية" }, 
      description: { en: "Master the skills needed to thrive in tomorrow's workplace.", ar: "إتقان المهارات اللازمة للنجاح في مكان عمل الغد." }
    },
    { 
      title: { en: "Summer Leadership Camp", ar: "مخيم القيادة الصيفي" }, 
      description: { en: "An intensive summer camp designed to build resilience and leadership skills.", ar: "مخيم صيفي مكثف مصمم لبناء المرونة ومهارات القيادة." }
    }
  ];

  for (const course of coursesToInsert) {
    const { data, error } = await supabase
      .from("courses")
      .insert(course)
      .select("id, title")
      .single();

    if (error) {
      console.error('Error inserting course:', error);
    } else {
      console.log(`Created: ${(data.title as any).en} -> UUID: ${data.id}`);
    }
  }
}

main();
