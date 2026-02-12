/*
  # Fix Remaining Function Search Path Issues

  ## Overview
  Fixes search_path for log_audit_event and record_consent functions
  if they exist in the database.

  ## Security Impact
  Prevents potential search path manipulation attacks on these functions.
*/

-- Fix log_audit_event if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event') THEN
    EXECUTE 'ALTER FUNCTION public.log_audit_event SET search_path TO pg_catalog, public';
  END IF;
END $$;

-- Fix record_consent if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_consent') THEN
    EXECUTE 'ALTER FUNCTION public.record_consent SET search_path TO pg_catalog, public';
  END IF;
END $$;
