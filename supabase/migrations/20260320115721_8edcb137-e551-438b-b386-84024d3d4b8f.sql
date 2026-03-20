
-- Enable pg_net for async HTTP
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_visitor_registration_change ON public.visitor_registrations;

-- Replace the function to use async pg_net
CREATE OR REPLACE FUNCTION public.notify_google_sheets()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  payload text;
  supabase_url text := 'https://efxeohyxpnwewhqwlahw.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeGVvaHl4cG53ZXdocXdsYWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTQ5MzgsImV4cCI6MjA2MjQzMDkzOH0.sJd48tkyK2GSaFxT8aRBLr9S1j4CJSaLxP_C3dp_pr0';
BEGIN
  payload := json_build_object('record', row_to_json(NEW))::text;
  
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/sync-google-sheets',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    ),
    body := payload::jsonb
  );
  
  RETURN NEW;
END;
$function$;

-- Recreate trigger for INSERT and UPDATE
CREATE TRIGGER on_visitor_registration_change
  AFTER INSERT OR UPDATE ON public.visitor_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_google_sheets();
