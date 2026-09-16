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
    const { firstName, lastName, email, phone, programId, programTitle, locale = 'en' } = body;

    // Default to a mock base amount of 1500 if we didn't extract it
    const amount = body.baseAmount || 1500;
    const vatAmount = amount * 0.15;
    const totalAmount = amount + vatAmount;
    const studentName = `${firstName} ${lastName}`;

    // 1. Insert into Supabase with payment_status 'pending'
    const { data: paymentRecord, error: insertError } = await supabase
      .from('payments')
      .insert([
        {
          student_name: studentName,
          parent_email: email,
          phone: phone,
          program_id: programId,
          program_title: programTitle || programId,
          amount: amount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          payment_status: 'pending'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to initialize payment", details: insertError }, { status: 500 });
    }

    // 2. MOCK PAYMENT SIMULATION (Delay 1.5s to mimic API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fakeTransactionId = `txn_mock_${Math.floor(Math.random() * 1000000)}`;

    // 3. Update status to 'paid'
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: 'paid',
        transaction_id: fakeTransactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to complete payment" }, { status: 500 });
    }

    // Return success redirect URL
    return NextResponse.json({
      success: true,
      redirectUrl: `/${locale}/apply/success?id=${paymentRecord.id}`
    });

  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

