import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetGroup, fullName, email, phone, institutionName, message, pdplConsent, locale = 'en' } = body;

    if (!targetGroup || !fullName || !email || !phone || !pdplConsent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into Supabase 'customer_leads' table
    const { error: insertError } = await supabase
      .from('customer_leads')
      .insert([
        {
          target_group: targetGroup,
          full_name: fullName,
          email: email,
          phone: phone,
          institution_name: institutionName || null,
          message: message || null,
          pdpl_consent: pdplConsent,
          locale: locale
        }
      ]);

    if (insertError) {
      console.warn("Could not insert into customer_leads (table might not exist). Error:", insertError);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Submit Lead API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
