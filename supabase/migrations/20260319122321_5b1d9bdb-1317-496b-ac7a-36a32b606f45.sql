-- Create a function that calls the sync-google-sheets edge function via http_post
CREATE OR REPLACE FUNCTION public.notify_google_sheets()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  payload json;
  supabase_url text := 'https://efxeohyxpnwewhqwlahw.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeGVvaHl4cG53ZXdocXdsYWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTQ5MzgsImV4cCI6MjA2MjQzMDkzOH0.sJd48tkyK2GSaFxT8aRBLr9S1j4CJSaLxP_C3dp_pr0';
BEGIN
  payload = json_build_object('record', row_to_json(NEW));
  
  PERFORM http(
    ('POST',
     supabase_url || '/functions/v1/sync-google-sheets',
     ARRAY[http_header('Authorization', 'Bearer ' || anon_key), http_header('Content-Type', 'application/json')],
     'application/json',
     payload::text
    )::http_request
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger on visitor_registrations for INSERT and UPDATE
CREATE TRIGGER trigger_sync_google_sheets
  AFTER INSERT OR UPDATE ON public.visitor_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_google_sheets();