import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get("coachId");
    const all = searchParams.get("all") === "true"; // if coach wants all, else only unbooked

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        let query = supabaseAdmin.from("coach_availability").select(`
            id,
            coach_id,
            date,
            start_time,
            end_time,
            duration_minutes,
            is_booked,
            zoom_link,
            notes,
            created_at,
            coach:coach_id(first_name, last_name, avatar_url)
        `);

        if (coachId) query = query.eq("coach_id", coachId);
        if (!all) query = query.eq("is_booked", false);

        const { data: dbSlots, error: dbErr } = await query
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        if (!dbErr && dbSlots) {
            return NextResponse.json({ slots: dbSlots });
        }

        console.error("GET /api/coach/availability DB error:", dbErr);
        return NextResponse.json({ slots: [] });
    } catch (error: any) {
        console.error("GET /api/coach/availability error:", error);
        return NextResponse.json({ slots: [] });
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
        const { startTime, endTime, date, zoomLink, notes, duration = 45 } = body;

        if (!startTime || !endTime) {
            return NextResponse.json({ error: "Start time and end time are required" }, { status: 400 });
        }

        const finalZoomLink = (zoomLink && zoomLink.trim()) || `https://zoom.us/j/yla-${user.id.slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;

        let slotDate = date || new Date().toISOString().split("T")[0];
        let slotStart = startTime;
        let slotEnd = endTime;

        if (startTime.includes("T")) {
            slotDate = startTime.split("T")[0];
            slotStart = startTime.split("T")[1].slice(0, 5);
        }
        if (endTime.includes("T")) {
            slotEnd = endTime.split("T")[1].slice(0, 5);
        }

        const { data: inserted, error: dbErr } = await supabaseAdmin
            .from("coach_availability")
            .insert({
                coach_id: user.id,
                date: slotDate,
                start_time: slotStart,
                end_time: slotEnd,
                duration_minutes: Number(duration),
                is_booked: false,
                zoom_link: finalZoomLink,
                notes: notes || "1-on-1 Academic & Leadership Coaching"
            })
            .select()
            .single();

        if (dbErr) {
            console.error("DB insert error for slots:", dbErr);
            return NextResponse.json({ error: dbErr.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, slot: inserted });

    } catch (error: any) {
        console.error("POST /api/coach/availability error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get("slotId");
    if (!slotId) return NextResponse.json({ error: "Missing slotId" }, { status: 400 });

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
        .from("coach_availability")
        .delete()
        .eq("id", slotId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
