import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedModuleContents() {
  console.log('Fetching modules...');
  
  const { data: modules, error: modError } = await supabase
    .from('modules')
    .select('id, title');
    
  if (modError) {
    console.error('Error fetching modules:', modError);
    return;
  }
  
  if (!modules || modules.length === 0) {
    console.log('No modules found.');
    return;
  }
  
  console.log(`Found ${modules.length} modules. Seeding dummy contents...`);
  
  let addedCount = 0;
  
  for (const mod of modules) {
    // Check if this module already has contents
    const { data: existingContents, error: contentError } = await supabase
      .from('module_contents')
      .select('id')
      .eq('module_id', mod.id);
      
    if (contentError) {
      console.error(`Error checking contents for module ${mod.id}:`, contentError);
      continue;
    }
    
    // Only seed if empty
    if (!existingContents || existingContents.length === 0) {
      
      const dummyContents = [
        {
          module_id: mod.id,
          title: 'Introduction Video',
          content_type: 'video',
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Sample video
          order_index: 1
        },
        {
          module_id: mod.id,
          title: 'Reading Material',
          content_type: 'text',
          body_text: 'This is a dynamic text content loaded from the database. Here you can write rich text, explanations, or instructions for the students.',
          order_index: 2
        },
        {
          module_id: mod.id,
          title: 'Module Quiz',
          content_type: 'quiz',
          quiz_data: [
            {
              question: "What is the primary goal of this module?",
              options: ["Learn Leadership", "Sleep", "Play Video Games"],
              correctIndex: 0
            }
          ],
          order_index: 3
        }
      ];
      
      const { error: insertError } = await supabase
        .from('module_contents')
        .insert(dummyContents);
        
      if (insertError) {
        console.error(`Failed to add contents to module ${mod.id}:`, insertError);
      } else {
        addedCount++;
      }
    }
  }
  
  console.log(`Finished! Successfully added dummy contents to ${addedCount} modules.`);
}

seedModuleContents().catch(console.error);
