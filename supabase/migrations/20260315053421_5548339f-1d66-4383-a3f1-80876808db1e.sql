
ALTER TABLE public.visitor_registrations
  ADD COLUMN IF NOT EXISTS meeting_staff_start_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS meeting_staff_end_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS entry_location text;
