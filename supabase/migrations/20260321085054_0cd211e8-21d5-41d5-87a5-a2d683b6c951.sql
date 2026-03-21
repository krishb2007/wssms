-- Remove duplicate and legacy webhook triggers causing repeated sync calls and insert latency
DROP TRIGGER IF EXISTS trigger_sync_google_sheets ON public.visitor_registrations;
DROP TRIGGER IF EXISTS notify_make_trigger ON public.visitor_registrations;
DROP TRIGGER IF EXISTS send_to_make ON public.visitor_registrations;
DROP TRIGGER IF EXISTS trigger_notify_make_webhook ON public.visitor_registrations;
DROP TRIGGER IF EXISTS "Woodstock" ON public.visitor_registrations;

-- Ensure exactly one Google Sheets trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'visitor_registrations'
      AND t.tgname = 'on_visitor_registration_change'
      AND NOT t.tgisinternal
  ) THEN
    DROP TRIGGER on_visitor_registration_change ON public.visitor_registrations;
  END IF;

  CREATE TRIGGER on_visitor_registration_change
    AFTER INSERT OR UPDATE ON public.visitor_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_google_sheets();
END $$;