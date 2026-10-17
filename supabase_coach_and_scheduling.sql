-- ============================================================================
-- YOUNG LEADERS ACADEMY (YLA)
-- COACH MANAGEMENT, MODULE ASSIGNMENTS & 1-ON-1 SCHEDULING SYSTEM MIGRATION
-- ============================================================================

-- 1. Ensure 'coach' role exists in roles table
INSERT INTO public.roles (name, description)
SELECT 'coach', 'Coach or Expert account'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'coach');

-- 2. Coach Module Assignments Table
-- Links approved coaches to the specific program modules they are certified to teach / coach
CREATE TABLE IF NOT EXISTS public.coach_module_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(coach_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_cma_coach ON public.coach_module_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_cma_module ON public.coach_module_assignments(module_id);

-- 3. Coach Availability Calendar Slots
-- Allows coaches to publish available 1-on-1 calendar slots for their assigned modules
CREATE TABLE IF NOT EXISTS public.coach_availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 45,
    is_booked BOOLEAN DEFAULT FALSE,
    zoom_link TEXT,
    location_type TEXT DEFAULT 'zoom', -- 'zoom', 'in_person', etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cas_coach ON public.coach_availability_slots(coach_id);
CREATE INDEX IF NOT EXISTS idx_cas_module ON public.coach_availability_slots(module_id);
CREATE INDEX IF NOT EXISTS idx_cas_time ON public.coach_availability_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_cas_booked ON public.coach_availability_slots(is_booked);

-- 4. 1-on-1 Coaching Bookings Table
-- Tracks booked sessions between enrolled module students and assigned coaches
CREATE TABLE IF NOT EXISTS public.coaching_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.coach_availability_slots(id) ON DELETE SET NULL,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    zoom_link TEXT,
    student_notes TEXT,
    coach_feedback TEXT,
    meeting_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cb_coach ON public.coaching_bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_cb_student ON public.coaching_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_cb_slot ON public.coaching_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_cb_status ON public.coaching_bookings(status);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.coach_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated reads for active slots and assignments
CREATE POLICY "Public read for coach assignments" ON public.coach_module_assignments
    FOR SELECT USING (true);

CREATE POLICY "Public read for available coach slots" ON public.coach_availability_slots
    FOR SELECT USING (true);

CREATE POLICY "Coaches can manage own slots" ON public.coach_availability_slots
    FOR ALL USING (auth.uid() = coach_id);

CREATE POLICY "Students and coaches can view their bookings" ON public.coaching_bookings
    FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = student_id);

CREATE POLICY "Students can create bookings" ON public.coaching_bookings
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Coaches and students can update their bookings" ON public.coaching_bookings
    FOR UPDATE USING (auth.uid() = coach_id OR auth.uid() = student_id);

-- Service role bypass for backend APIs
CREATE POLICY "Service role full access on coach_module_assignments" ON public.coach_module_assignments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on coach_availability_slots" ON public.coach_availability_slots
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on coaching_bookings" ON public.coaching_bookings
    FOR ALL USING (auth.role() = 'service_role');
