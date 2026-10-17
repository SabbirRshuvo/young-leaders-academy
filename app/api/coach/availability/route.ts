import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Fallback in-memory storage for slots if table is not yet migrated in Supabase
let memorySlots: any[] = [];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get("coachId");
    const moduleId = searchParams.get("moduleId");
    const all = searchParams.get("all") === "true"; // if coach wants all, else only unbooked

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        let query = supabaseAdmin.from("coach_availability_slots").select(`
            id,
            coach_id,
            module_id,
            start_time,
            end_time,
            duration_minutes,
            is_booked,
            zoom_link,
            notes,
            created_at,
            coach:coach_id(first_name, last_name, email, avatar_url),
            module:module_id(id, title)
        `);

        if (coachId) query = query.eq("coach_id", coachId);
        if (moduleId) query = query.eq("module_id", moduleId);
        if (!all) query = query.eq("is_booked", false);

        const { data: dbSlots, error: dbErr } = await query.order("start_time", { ascending: true });

        if (!dbErr && dbSlots) {
            return NextResponse.json({ slots: dbSlots });
        }

        // Fallback to memory slots
        let filtered = [...memorySlots];
        if (coachId) filtered = filtered.filter(s => s.coach_id === coachId);
        if (moduleId) filtered = filtered.filter(s => s.module_id === moduleId);
        if (!all) filtered = filtered.filter(s => !s.is_booked);

        return NextResponse.json({ slots: filtered });
    } catch (error: any) {
        console.error("GET /api/coach/availability error:", error);
        return NextResponse.json({ slots: memorySlots });
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
        const { moduleId, startTime, endTime, zoomLink, notes, duration = 45 } = body;

        if (!startTime || !endTime) {
            return NextResponse.json({ error: "Start time and end time are required" }, { status: 400 });
        }

        // Ensure zoom link has default format if not provided
        const finalZoomLink = (zoomLink && zoomLink.trim()) || `https://zoom.us/j/yla-${user.id.slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newSlot = {
            id: `slot_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            coach_id: user.id,
            module_id: moduleId || null,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: Number(duration),
            is_booked: false,
            zoom_link: finalZoomLink,
            notes: notes || "1-on-1 Academic & Leadership Coaching",
            created_at: new Date().toISOString()
        };

        const { data: inserted, error: dbErr } = await supabaseAdmin
            .from("coach_availability_slots")
            .insert({
                coach_id: newSlot.coach_id,
                module_id: newSlot.module_id,
                start_time: newSlot.start_time,
                end_time: newSlot.end_time,
                duration_minutes: newSlot.duration_minutes,
                is_booked: false,
                zoom_link: newSlot.zoom_link,
                notes: newSlot.notes
            })
            .select()
            .single();

        if (dbErr) {
            console.warn("DB insert error for slots, using memory fallback:", dbErr.message);
            memorySlots.push(newSlot);
            return NextResponse.json({ success: true, slot: newSlot });
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

    try {
        await supabaseAdmin.from("coach_availability_slots").delete().eq("id", slotId);
        memorySlots = memorySlots.filter(s => s.id !== slotId);
        return NextResponse.json({ success: true, message: "Slot deleted" });
    } catch (err: any) {
        memorySlots = memorySlots.filter(s => s.id !== slotId);
        return NextResponse.json({ success: true, message: "Slot removed" });
    }
}
