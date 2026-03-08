/*
  # Enhanced AI Usage Tracking for Multi-Provider Support

  1. Changes to ai_usage_tracking table
    - Add `provider` column to track which AI provider was used (anthropic, openai)
    - Add `input_tokens` and `output_tokens` columns for granular token tracking
    - Add `task_type` column for more granular task classification
    - Add `tier_at_request` column to snapshot user's subscription tier when request was made
    - Add `latency_ms` column to track response time for performance monitoring
    - Add `model_version` column for full model identifier

  2. Security
    - No changes to RLS policies (existing policies cover the new columns)

  3. Performance
    - Add indexes for common query patterns (provider, task_type, tier analysis)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'provider'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN provider text DEFAULT 'anthropic';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'input_tokens'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN input_tokens integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'output_tokens'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN output_tokens integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'task_type'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN task_type text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'tier_at_request'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN tier_at_request text DEFAULT 'starter';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'latency_ms'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN latency_ms integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_usage_tracking' AND column_name = 'model_version'
  ) THEN
    ALTER TABLE ai_usage_tracking ADD COLUMN model_version text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_provider 
  ON ai_usage_tracking(provider);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_task_type 
  ON ai_usage_tracking(task_type);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_tier_at_request 
  ON ai_usage_tracking(tier_at_request);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_created_at_provider 
  ON ai_usage_tracking(created_at, provider);
