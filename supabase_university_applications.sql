-- ============================================================================
-- YOUNG LEADERS ACADEMY (YLA)
-- UNIVERSITY APPLICATIONS SCHEMA FIX
-- Makes 'program_id' nullable for university-only applications
-- ============================================================================

ALTER TABLE public.university_applications 
ALTER COLUMN program_id DROP NOT NULL;

-- Optional: ensure university_id column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'university_applications' 
      AND column_name = 'university_id'
  ) THEN
    ALTER TABLE public.university_applications ADD COLUMN university_id TEXT;
  END IF;
END $$;
