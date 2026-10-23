import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get("coachId");
    const studentId = searchParams.get("studentId");

    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read only */ },
            },
        }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        let query = supabaseAdmin.from("one_on_one_bookings").select(`
            id,
            slot_id,
            coach_id,
            student_id,
            program_id,
            status,
            zoom_link,
            student_notes,
            coach_feedback,
            meeting_date,
            start_time,
            end_time,
            created_at,
            coach:coach_id(id, first_name, last_name, phone),
            student:student_id(id, first_name, last_name, phone)
        `);

        if (coachId) query = query.eq("coach_id", coachId);
        else if (studentId) query = query.eq("student_id", studentId);
        else {
            query = query.or(`coach_id.eq.${user.id},student_id.eq.${user.id}`);
        }

        const { data: dbBookings, error: dbErr } = await query
            .order("meeting_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (!dbErr && dbBookings) {
            const formatted = (dbBookings || []).map((b: any) => ({
                ...b,
                meeting_time: b.meeting_date && b.start_time
                    ? `${b.meeting_date}T${b.start_time.includes("T") ? b.start_time.split("T")[1] : (b.start_time.length === 5 ? b.start_time + ":00" : b.start_time)}`
                    : b.created_at
            }));
            return NextResponse.json({ bookings: formatted });
        }

        console.error("GET /api/coach/bookings error:", dbErr);
        return NextResponse.json({ bookings: [] });

    } catch (error: any) {
        console.error("GET /api/coach/bookings error:", error);
        return NextResponse.json({ bookings: [] });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read only */ },
            },
        }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const { slotId, coachId, programId, studentNotes, meetingDate, startTime, endTime, customZoomLink } = body;

        if (!coachId) {
            return NextResponse.json({ error: "Missing coachId" }, { status: 400 });
        }

        // If slotId is provided, get the slot details
        let dateVal = meetingDate || new Date().toISOString().split("T")[0];
        let startVal = startTime || "16:00";
        let endVal = endTime || "16:45";
        let finalZoomLink = customZoomLink;

        if (slotId) {
            const { data: slot } = await supabaseAdmin
                .from("coach_availability")
                .select("*")
                .eq("id", slotId)
                .single();

            if (slot) {
                dateVal = slot.date;
                startVal = slot.start_time;
                endVal = slot.end_time;
                if (!finalZoomLink) finalZoomLink = slot.zoom_link;
            }

            // Mark slot as booked
            await supabaseAdmin
                .from("coach_availability")
                .update({ is_booked: true })
                .eq("id", slotId);
        }

        if (!finalZoomLink) {
            const meetingCode = Math.floor(100000000 + Math.random() * 900000000);
            const meetingPasscode = Math.random().toString(36).substring(2, 8).toUpperCase();
            finalZoomLink = `https://zoom.us/j/${meetingCode}?pwd=${meetingPasscode}`;
        }

        const { data: dbBooking, error: dbErr } = await supabaseAdmin
            .from("one_on_one_bookings")
            .insert({
                slot_id: slotId || null,
                coach_id: coachId,
                student_id: user.id,
                program_id: programId || null,
                status: "confirmed",
                zoom_link: finalZoomLink,
                student_notes: studentNotes || "Session scheduled via student portal",
                meeting_date: dateVal,
                start_time: startVal,
                end_time: endVal,
            })
            .select()
            .single();

        if (dbErr) {
            console.error("DB insert error for one_on_one_bookings:", dbErr);
            return NextResponse.json({ error: dbErr.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "1-on-1 session booked successfully!",
            booking: dbBooking
        });

    } catch (error: any) {
        console.error("POST /api/coach/bookings error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
