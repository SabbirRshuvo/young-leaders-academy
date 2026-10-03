import { createClient } from "@supabase/supabase-js";
import { programsData } from "./data/programs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to generate a random UUID if needed (but we'll just rely on PG crypto for lessons/modules if not provided)
// Actually we can just let Supabase generate UUIDs for modules and lessons by omitting the 'id' field if we want, 
// but we want deterministic seeds so they don't duplicate on re-runs.
const generateId = (courseId: string, index: number, prefix: string) => {
    // A deterministic pseudo-UUID based on courseId and index
    const base = courseId.substring(0, 24);
    const suffix = String(index).padStart(12, '0');
    // For valid UUID, we must only use hex chars 0-9 a-f
    const hexPrefix = prefix === "mod" ? "1111" : "2222";
    const customBase = base.substring(0, 19) + hexPrefix + "-";
    return customBase + suffix;
};

async function seed() {
  console.log("Starting seed script...");
  
  for (const program of programsData) {
    if (!program.courseDbId) {
      console.log(`Skipping ${program.id}, no courseDbId defined.`);
      continue;
    }

    console.log(`\nProcessing program: ${program.id} (DB ID: ${program.courseDbId})`);

    // 1. Insert or update the course
    const { error: courseError } = await supabase
      .from("courses")
      .upsert({
        id: program.courseDbId,
        title: program.title,
        description: program.overview,
      }, { onConflict: "id" });

    if (courseError) {
      console.error(`Failed to insert course ${program.id}:`, courseError.message);
      continue;
    }
    console.log(`✅ Course inserted/updated: ${program.id}`);

    // 2. Insert modules and lessons
    let moduleIndex = 1;
    for (const module of program.curriculum) {
      const moduleId = generateId(program.courseDbId, moduleIndex, "mod");
      
      const { error: moduleError } = await supabase
        .from("modules")
        .upsert({
          id: moduleId,
          course_id: program.courseDbId,
          title: module.title,
          description: module.description,
          serial_number: moduleIndex
        }, { onConflict: "id" });

      if (moduleError) {
        console.error(`  ❌ Failed to insert module ${module.module}:`, moduleError.message);
        continue;
      }
      console.log(`  ✅ Module inserted: ${module.module}`);

      // Generate 2 dummy lessons per module
      for (let lessonIndex = 1; lessonIndex <= 2; lessonIndex++) {
        const lessonId = generateId(program.courseDbId, (moduleIndex * 10) + lessonIndex, "les");
        const { error: lessonError } = await supabase
          .from("lessons")
          .upsert({
            id: lessonId,
            module_id: moduleId,
            title: { 
                en: `Lesson ${lessonIndex}: ${module.title.en}`, 
                ar: `الدرس ${lessonIndex}: ${module.title.ar}` 
            },
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            serial_number: lessonIndex
          }, { onConflict: "id" });

        if (lessonError) {
          console.error(`    ❌ Failed to insert lesson ${lessonIndex}:`, lessonError.message);
        } else {
          console.log(`    ✅ Lesson inserted: ${lessonIndex}`);
        }
      }
      moduleIndex++;
    }
  }

  console.log("\n🎉 Seeding complete!");
}

seed().catch(console.error);
