import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // In a real app we'd get the token and verify the user via supabase.auth.getUser(token)
    // Here we'll rely on the client passing the student_id for simplicity (or we can extract it from headers)
    const body = await req.json();
    const { studentId, programId, lessonModule, isCompleted, currentLesson } = body;

    if (!studentId || !programId) {
      return NextResponse.json({ success: false, error: 'Missing studentId or programId' }, { status: 400 });
    }

    // Fetch existing progress
    const { data: existingProgress, error: fetchError } = await supabase
      .from('course_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('program_id', programId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is not found
      throw fetchError;
    }

    let completed_lessons = existingProgress?.completed_lessons || [];

    if (lessonModule) {
      if (isCompleted && !completed_lessons.includes(lessonModule)) {
        completed_lessons.push(lessonModule);
      } else if (!isCompleted && completed_lessons.includes(lessonModule)) {
        completed_lessons = completed_lessons.filter((m: string) => m !== lessonModule);
      }
    }

    const payload = {
      student_id: studentId,
      program_id: programId,
      completed_lessons,
      current_lesson: currentLesson || existingProgress?.current_lesson || null,
      updated_at: new Date().toISOString(),
    };

    if (existingProgress) {
      const { error: updateError } = await supabase
        .from('course_progress')
        .update(payload)
        .eq('id', existingProgress.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('course_progress')
        .insert([payload]);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, completed_lessons });
  } catch (error) {
    console.error('Course progress API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
