/*
  SETUP TRIAL REMINDER CRON JOB

  Run this SQL script in the Supabase SQL Editor to schedule automatic trial reminder emails.

  BEFORE RUNNING:
  1. Make sure pg_cron extension is enabled in pg_catalog schema
  2. Replace YOUR_PROJECT_ID with your actual Supabase project reference

  SCHEDULE: Runs daily at 9:00 AM UTC
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing job if it exists (allows re-running this script)
DO $$
BEGIN
  PERFORM cron.unschedule('send-trial-reminders-daily');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule the trial reminder job
-- IMPORTANT: Replace 'YOUR_PROJECT_ID' with your actual Supabase project reference
-- Example: If your project URL is https://abcdefgh.supabase.co, use 'abcdefgh'
SELECT cron.schedule(
  'send-trial-reminders-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-trial-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    ) AS request_id;
  $$
);

-- Verify the job was created
SELECT * FROM cron.job WHERE jobname = 'send-trial-reminders-daily';

-- To view job run history later, use:
-- SELECT * FROM cron.job_run_details WHERE jobname = 'send-trial-reminders-daily' ORDER BY start_time DESC LIMIT 10;

-- To manually unschedule this job later, use:
-- SELECT cron.unschedule('send-trial-reminders-daily');
