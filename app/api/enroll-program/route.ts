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
      userId,
      paymentMethod = 'mada',
    } = body;

    if (!firstName || !lastName || !email || !phone || !age || !school || !programId || !motivation) {
      return NextResponse.json({ success: false, error: 'Missing required application fields' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'You must be logged in to enroll in a program.' }, { status: 401 });
    }

    // Validate that no existing record matches (user_id, program_id)
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .maybeSingle();

    const { data: existingApp } = await supabase
      .from('program_applications')
      .select('id')
      .eq('student_id', userId)
      .eq('program_id', programId)
      .maybeSingle();

    if (existingEnrollment || existingApp) {
      return NextResponse.json({
        success: false,
        alreadyEnrolled: true,
        error: 'Already enrolled in this program',
        redirectUrl: `/${locale}/programs/${programId}/play`
      }, { status: 400 });
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
          payment_gateway: paymentMethod,
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

    // 4. Enroll in course (direct access since they paid)
    const { error: enrollError } = await supabase
      .from('program_applications')
      .insert([{
          student_id: userId,
          program_id: programId,
          status: 'accepted'
      }]);
      
    if (enrollError) {
      console.error('Supabase enrollment insert error:', enrollError);
      return NextResponse.json({ success: false, error: 'Enrollment failed. Please try again.' }, { status: 500 });
    }

    // Also record in enrollments table
    try {
      await supabase
        .from('enrollments')
        .upsert([{
            user_id: userId,
            program_id: programId,
        }], { onConflict: 'user_id,program_id' });
    } catch {}

    return NextResponse.json({
      success: true,
      paymentId: paymentRecord.id,
      transactionId: fakeTransactionId,
      redirectUrl: `/${locale}/apply/success?id=${paymentRecord.id}`,
    });
  } catch (error) {
    console.error('Enroll Program API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
