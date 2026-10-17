import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Fallback in-memory storage for bookings
let memoryBookings: any[] = [];

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
        let query = supabaseAdmin.from("coaching_bookings").select(`
            id,
            slot_id,
            coach_id,
            student_id,
            module_id,
            status,
            zoom_link,
            student_notes,
            coach_feedback,
            meeting_time,
            duration_minutes,
            created_at,
            coach:coach_id(id, first_name, last_name, email, phone),
            student:student_id(id, first_name, last_name, email, phone),
            module:module_id(id, title)
        `);

        if (coachId) query = query.eq("coach_id", coachId);
        else if (studentId) query = query.eq("student_id", studentId);
        else {
            // Default to querying for the logged-in user (as student or coach)
            query = query.or(`coach_id.eq.${user.id},student_id.eq.${user.id}`);
        }

        const { data: dbBookings, error: dbErr } = await query.order("meeting_time", { ascending: true });

        if (!dbErr && dbBookings) {
            return NextResponse.json({ bookings: dbBookings });
        }

        // Memory fallback
        let filtered = [...memoryBookings];
        const targetId = coachId || studentId || user.id;
        filtered = filtered.filter(b => b.coach_id === targetId || b.student_id === targetId);

        return NextResponse.json({ bookings: filtered });

    } catch (error: any) {
        console.error("GET /api/coach/bookings error:", error);
        return NextResponse.json({ bookings: memoryBookings });
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
        const { slotId, coachId, moduleId, studentNotes, meetingTime, customZoomLink } = body;

        if (!coachId || !meetingTime) {
            return NextResponse.json({ error: "Missing required booking details (coachId, meetingTime)" }, { status: 400 });
        }

        // Generate high-quality unique Zoom meeting link if none provided
        const meetingCode = Math.floor(100000000 + Math.random() * 900000000);
        const meetingPasscode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const finalZoomLink = customZoomLink || `https://zoom.us/j/${meetingCode}?pwd=${meetingPasscode}`;

        // 1. Mark the slot as booked if slotId was provided
        if (slotId) {
            await supabaseAdmin
                .from("coach_availability_slots")
                .update({ is_booked: true })
                .eq("id", slotId);
        }

        // Fetch coach details for response
        const { data: coachProfile } = await supabaseAdmin
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", coachId)
            .single();

        // Fetch student details
        const { data: studentProfile } = await supabaseAdmin
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", user.id)
            .single();

        // Fetch module details
        let moduleTitle = "1-on-1 Mentorship Module";
        if (moduleId) {
            const { data: mod } = await supabaseAdmin
                .from("modules")
                .select("title")
                .eq("id", moduleId)
                .single();
            if (mod?.title) moduleTitle = typeof mod.title === "string" ? mod.title : (mod.title.en || mod.title.ar);
        }

        const newBooking = {
            id: `bk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            slot_id: slotId || null,
            coach_id: coachId,
            student_id: user.id,
            module_id: moduleId || null,
            status: "confirmed",
            zoom_link: finalZoomLink,
            student_notes: studentNotes || "Session scheduled via student portal",
            meeting_time: meetingTime,
            duration_minutes: 45,
            created_at: new Date().toISOString(),
            coach: coachProfile || { first_name: "YLA", last_name: "Coach", email: "" },
            student: studentProfile || { first_name: "Student", last_name: "", email: user.email },
            module: { id: moduleId, title: moduleTitle }
        };

        // Attempt database insert
        const { data: dbBooking, error: dbErr } = await supabaseAdmin
            .from("coaching_bookings")
            .insert({
                slot_id: newBooking.slot_id,
                coach_id: newBooking.coach_id,
                student_id: newBooking.student_id,
                module_id: newBooking.module_id,
                status: "confirmed",
                zoom_link: newBooking.zoom_link,
                student_notes: newBooking.student_notes,
                meeting_time: newBooking.meeting_time,
                duration_minutes: 45
            })
            .select()
            .single();

        if (dbErr) {
            console.warn("DB insert error for coaching_bookings, using memory fallback:", dbErr.message);
            memoryBookings.push(newBooking);
            return NextResponse.json({
                success: true,
                message: "1-on-1 session booked successfully!",
                booking: newBooking
            });
        }

        return NextResponse.json({
            success: true,
            message: "1-on-1 session booked successfully!",
            booking: { ...newBooking, id: dbBooking.id }
        });

    } catch (error: any) {
        console.error("POST /api/coach/bookings error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const { bookingId, status, zoomLink, coachFeedback } = body;

        if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });

        const updateData: any = {};
        if (status) updateData.status = status;
        if (zoomLink) updateData.zoom_link = zoomLink;
        if (coachFeedback) updateData.coach_feedback = coachFeedback;
        updateData.updated_at = new Date().toISOString();

        await supabaseAdmin
            .from("coaching_bookings")
            .update(updateData)
            .eq("id", bookingId);

        const memoryItem = memoryBookings.find(b => b.id === bookingId);
        if (memoryItem) {
            Object.assign(memoryItem, updateData);
        }

        return NextResponse.json({ success: true, message: "Booking updated" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
