/*
  # Fix Function Search Path Security

  ## Overview
  Sets explicit search_path on all functions to prevent search path manipulation attacks.
  Functions with mutable search paths can be exploited by malicious users who create
  similarly named functions/tables in their own schema.

  ## Security Impact
  - BEFORE: Functions could be tricked into using malicious code
  - AFTER: Functions always use pg_catalog and public schemas explicitly

  ## Functions Fixed (30 total)
  All domain, AI, analytics, error logging, and system functions now have
  SET search_path = pg_catalog, public for security.
*/

-- Domain functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.generate_domain_verification_token SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- AI functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_gameplan_progress SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Block functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.count_blocks SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.increment_block_usage SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_custom_blocks_updated_at SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Page functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.create_page_version SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.create_initial_versions SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Global section functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_global_section_usage_count SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_global_sections_updated_at SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Variant/inventory functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_variant_inventory SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_variants_updated_at SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Workflow functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_workflow_subscriber_count SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_segment_contact_count SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Analytics functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.update_session_page_views SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.calculate_daily_revenue_summary SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Error/health functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.log_error SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.record_health_metric SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.get_error_stats SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Rate limiting functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.check_rate_limit SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.cleanup_old_rate_limits SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.get_rate_limit_status SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Invitation code functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.validate_invitation_code SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.use_invitation_code SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Webhook functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.log_webhook_event SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.complete_webhook_event SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Payment/subscription functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.log_payment_failure SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.log_subscription_change SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.get_unresolved_payment_failures SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- Platform admin functions
DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.refresh_platform_stats SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER FUNCTION public.log_platform_action SET search_path TO pg_catalog, public';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;
