import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS in the API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, universityId, universityName, locale = 'en' } = body;

    if (!fullName || !email || !phone || !universityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert into Supabase 'university_leads' table
    // (If the table doesn't exist, Supabase will return an error, which we catch. 
    // In a real production scenario, you'd ensure the table is created first).
    const { error: insertError } = await supabase
      .from('university_leads')
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          university_id: universityId,
          university_name: universityName,
          locale: locale,
          status: 'new'
        }
      ]);

    if (insertError) {
      console.warn("Could not insert into university_leads (table might not exist). Error:", insertError);
      // We don't fail completely if the table doesn't exist, we still want to send the email alert.
    }

    // 2. Trigger Email Automation
    // The base URL must be determined based on the incoming request to call our own API
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    try {
      await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'request-info',
          locale,
          data: {
            full_name: fullName,
            email: email,
            phone: phone,
            university_name: universityName
          }
        })
      });
    } catch (emailErr) {
      console.error("Failed to trigger request-info email automation:", emailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Request Info API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
