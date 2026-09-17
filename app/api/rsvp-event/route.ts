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
    const { eventId, eventTitle, fullName, email, phone, role, preferredProgram, pdplConsent, locale = 'en' } = body;

    if (!eventId || !fullName || !email || !pdplConsent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert into Supabase 'event_registrations' table
    const { error: insertError } = await supabase
      .from('event_registrations')
      .insert([
        {
          event_title: eventTitle,
          full_name: fullName,
          email: email,
          phone: phone,
          role: role,
          pdpl_consent: pdplConsent
        }
      ]);

    if (insertError) {
      console.warn("Could not insert into event_registrations (table might not exist). Error:", insertError);
    }

    // 2. Trigger Email Automation (Optional, using existing route)
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    try {
      await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'request-info', // Using request-info template as fallback, ideally create 'rsvp-event' template later
          locale,
          data: {
            full_name: fullName,
            email: email,
            phone: phone,
            university_name: eventTitle // reusing field
          }
        })
      });
    } catch (emailErr) {
      console.error("Failed to trigger RSVP email automation:", emailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("RSVP API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
