const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: st, error: stErr } = await supabase.from('student_profiles').select('*').limit(1);
  if (st) console.log('Student Profiles columns:', Object.keys(st[0] || {}));
  
  const { data: p, error: pErr } = await supabase.from('payments').select('*').limit(1);
  if (p) console.log('Payments columns:', Object.keys(p[0] || {}));
}

test();
