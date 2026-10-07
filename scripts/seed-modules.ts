import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedModules() {
  console.log('Fetching programs...');
  
  const { data: programs, error: progError } = await supabase
    .from('programs')
    .select('id, title');
    
  if (progError) {
    console.error('Error fetching programs:', progError);
    return;
  }
  
  if (!programs || programs.length === 0) {
    console.log('No programs found.');
    return;
  }
  
  console.log(`Found ${programs.length} programs. Checking for missing modules...`);
  
  let addedCount = 0;
  
  for (const prog of programs) {
    // Check if this program already has modules
    const { data: existingModules, error: modError } = await supabase
      .from('modules')
      .select('id')
      .eq('program_id', prog.id);
      
    if (modError) {
      console.error(`Error checking modules for program ${prog.id}:`, modError);
      continue;
    }
    
    if (!existingModules || existingModules.length === 0) {
      console.log(`Adding 3 dummy modules to program: ${prog.title}`);
      
      const dummyModules = [
        {
          program_id: prog.id,
          title: 'Module 1: Introduction & Fundamentals',
          description: 'A comprehensive overview of the core concepts, setting expectations, and building a strong foundation for the rest of the program.',
          order_index: 1
        },
        {
          program_id: prog.id,
          title: 'Module 2: Advanced Strategies & Execution',
          description: 'Deep dive into practical methodologies, frameworks, and real-world execution strategies that drive measurable impact.',
          order_index: 2
        },
        {
          program_id: prog.id,
          title: 'Module 3: Final Project & Certification',
          description: 'Apply everything you have learned in a capstone project. Present your work to industry leaders and receive your official certification.',
          order_index: 3
        }
      ];
      
      const { error: insertError } = await supabase
        .from('modules')
        .insert(dummyModules);
        
      if (insertError) {
        console.error(`Failed to add modules to program ${prog.id}:`, insertError);
      } else {
        addedCount++;
      }
    }
  }
  
  console.log(`Finished! Successfully added dummy modules to ${addedCount} programs.`);
}

seedModules().catch(console.error);
