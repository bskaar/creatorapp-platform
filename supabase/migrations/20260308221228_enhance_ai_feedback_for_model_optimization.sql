/*
  # Enhanced AI Feedback for Model Optimization

  1. Changes to ai_feedback table
    - Add `task_type` column to link feedback to specific task types
    - Add `model_used` column to track which model generated the response
    - Add `tier_at_feedback` column to understand tier-based quality perception
    - Add `provider` column to track AI provider

  2. Security
    - No changes to RLS policies (existing policies cover the new columns)

  3. Purpose
    - Enable analysis of feedback by task type and model
    - Build foundation for data-driven model routing decisions
    - Track quality perception across different subscription tiers
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_feedback' AND column_name = 'task_type'
  ) THEN
    ALTER TABLE ai_feedback ADD COLUMN task_type text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_feedback' AND column_name = 'model_used'
  ) THEN
    ALTER TABLE ai_feedback ADD COLUMN model_used text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_feedback' AND column_name = 'tier_at_feedback'
  ) THEN
    ALTER TABLE ai_feedback ADD COLUMN tier_at_feedback text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_feedback' AND column_name = 'provider'
  ) THEN
    ALTER TABLE ai_feedback ADD COLUMN provider text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_feedback_task_type 
  ON ai_feedback(task_type);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_model_used 
  ON ai_feedback(model_used);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_rating 
  ON ai_feedback(rating);
