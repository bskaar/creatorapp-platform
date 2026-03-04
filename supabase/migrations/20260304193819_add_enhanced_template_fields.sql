/*
  # Enhanced Template Fields for AI Personalization

  1. New Columns on `funnel_templates`
    - `tone_suggestions` (jsonb) - Array of recommended tones for this template type
    - `ai_prompt_context` (text) - Industry-specific AI generation instructions  
    - `placeholder_map` (jsonb) - Documentation of all replaceable placeholders
    - `difficulty_level` (text) - beginner, intermediate, or advanced

  2. Purpose
    - Enable richer AI content generation with tone awareness
    - Help users understand template complexity before selection
    - Document placeholders for the AI system to properly replace
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_templates' AND column_name = 'tone_suggestions'
  ) THEN
    ALTER TABLE funnel_templates ADD COLUMN tone_suggestions jsonb DEFAULT '["professional", "friendly"]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_templates' AND column_name = 'ai_prompt_context'
  ) THEN
    ALTER TABLE funnel_templates ADD COLUMN ai_prompt_context text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_templates' AND column_name = 'placeholder_map'
  ) THEN
    ALTER TABLE funnel_templates ADD COLUMN placeholder_map jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'funnel_templates' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE funnel_templates ADD COLUMN difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

COMMENT ON COLUMN funnel_templates.tone_suggestions IS 'Array of recommended tones for AI generation (professional, friendly, authoritative, conversational, luxury)';
COMMENT ON COLUMN funnel_templates.ai_prompt_context IS 'Industry-specific instructions for the AI content generator';
COMMENT ON COLUMN funnel_templates.placeholder_map IS 'Map of placeholder names to their descriptions and example values';
COMMENT ON COLUMN funnel_templates.difficulty_level IS 'Template complexity level to help users choose appropriate templates';