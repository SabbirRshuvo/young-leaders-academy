import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      school,
      programId,
      programTitle,
      motivation,
      locale = 'en',
      baseAmount = 1500,
    } = body;

    if (!firstName || !lastName || !email || !phone || !age || !school || !programId || !motivation) {
      return NextResponse.json({ success: false, error: 'Missing required application fields' }, { status: 400 });
    }

    const resolvedUniversityId = body.universityId || programId;
    const resolvedProgramId = programId || body.programId || 'university-pathway';

    // Validate that no existing application matches (user_id, university_id) before inserting
    if (body.userId && resolvedUniversityId) {
      const { data: existingApp } = await supabase
        .from('university_applications')
        .select('id')
        .eq('user_id', body.userId)
        .or(`university_id.eq.${resolvedUniversityId},program_id.eq.${resolvedUniversityId}`)
        .maybeSingle();

      if (existingApp) {
        return NextResponse.json(
          {
            success: false,
            alreadyApplied: true,
            error: 'Application already submitted',
          },
          { status: 400 }
        );
      }
    }

    const amount = Number(baseAmount);
    const vatAmount = amount * 0.15;
    const totalAmount = amount + vatAmount;
    const studentName = `${firstName} ${lastName}`;

    // 1. Create pending payment
    const { data: paymentRecord, error: paymentInsertError } = await supabase
      .from('payments')
      .insert([{
          student_name: studentName,
          parent_email: email,
          phone,
          program_id: programId,
          program_title: programTitle || programId,
          amount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
      }])
      .select()
      .single();

    if (paymentInsertError) {
      console.error('Supabase payment insert error:', paymentInsertError);
      return NextResponse.json({ success: false, error: 'Failed to initialize payment' }, { status: 500 });
    }

    // 2. MOCK PAYMENT
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const fakeTransactionId = `txn_mock_${Math.floor(Math.random() * 1000000)}`;

    // 3. Mark payment as paid
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: 'paid',
        transaction_id: fakeTransactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id);

    if (updateError) {
      console.error('Supabase payment update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to complete payment' }, { status: 500 });
    }

    // 4. Save University Application
    const { data: application, error: applicationError } = await supabase
      .from('university_applications')
      .insert([{
          user_id: body.userId || null,
          university_id: resolvedUniversityId,
          program_id: resolvedProgramId,
          status: 'pending',
          payment_status: 'paid',
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          age: Number(age),
          school,
          motivation,
      }])
      .select()
      .single();

    if (applicationError) {
      console.error('Supabase university application insert error:', applicationError);
      return NextResponse.json({ success: false, error: 'Payment completed, but application could not be saved.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      paymentId: paymentRecord.id,
      transactionId: fakeTransactionId,
      redirectUrl: `/${locale}/apply/success?id=${paymentRecord.id}`,
    });
  } catch (error) {
    console.error('Apply University API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
