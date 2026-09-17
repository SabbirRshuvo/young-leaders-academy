import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gradeLevel, focusArea, preferredDestination, fullName, email, phone, pdplConsent, readinessScore, locale = 'en' } = body;

    if (!fullName || !email || !phone || !pdplConsent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into Supabase 'quiz_leads' table
    const { error: insertError } = await supabase
      .from('quiz_leads')
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          grade_level: gradeLevel,
          field_of_interest: focusArea,
          target_destination: preferredDestination,
          readiness_score: readinessScore,
          pdpl_consent: pdplConsent
        }
      ]);

    if (insertError) {
      console.warn("Could not insert into quiz_leads (table might not exist). Error:", insertError);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Submit Quiz API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
