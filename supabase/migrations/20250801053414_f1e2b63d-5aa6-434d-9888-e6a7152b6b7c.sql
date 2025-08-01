-- Enable pg_cron extension for scheduling jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule monthly cleanup function to run on the 1st day of every month at 2 AM
SELECT cron.schedule(
  'monthly-cleanup-visitor-data',
  '0 2 1 * *', -- At 2:00 AM on the 1st day of every month
  $$
  SELECT
    net.http_post(
        url:='https://efxeohyxpnwewhqwlahw.supabase.co/functions/v1/monthly-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeGVvaHl4cG53ZXdocXdsYWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTQ5MzgsImV4cCI6MjA2MjQzMDkzOH0.sJd48tkyK2GSaFxT8aRBLr9S1j4CJSaLxP_C3dp_pr0"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);