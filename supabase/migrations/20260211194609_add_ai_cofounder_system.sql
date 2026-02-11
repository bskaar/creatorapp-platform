/*
  # AI Co-Founder System

  1. New Tables
    - `ai_conversations`
      - `id` (uuid, primary key)
      - `site_id` (uuid, foreign key to sites)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - conversation title
      - `status` (text) - active, archived
      - `last_message_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ai_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to ai_conversations)
      - `role` (text) - user, assistant, system
      - `content` (text) - message content
      - `metadata` (jsonb) - additional data (tokens used, model, etc.)
      - `created_at` (timestamptz)

    - `ai_gameplans`
      - `id` (uuid, primary key)
      - `site_id` (uuid, foreign key to sites)
      - `user_id` (uuid, references auth.users)
      - `conversation_id` (uuid, nullable, foreign key to ai_conversations)
      - `title` (text) - gameplan title
      - `description` (text) - detailed description
      - `status` (text) - active, completed, archived
      - `progress_percentage` (integer) - 0-100
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ai_task_items`
      - `id` (uuid, primary key)
      - `gameplan_id` (uuid, foreign key to ai_gameplans)
      - `description` (text) - task description
      - `priority` (text) - high, medium, low
      - `status` (text) - pending, in_progress, completed
      - `phase` (text) - Foundation, Growth, Optimization
      - `estimated_time` (text) - time estimate
      - `order_index` (integer) - display order
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `ai_usage_tracking`
      - `id` (uuid, primary key)
      - `site_id` (uuid, foreign key to sites)
      - `user_id` (uuid, references auth.users)
      - `request_type` (text) - chat, gameplan, content_generation
      - `model_used` (text) - haiku, sonnet
      - `tokens_used` (integer)
      - `cost_cents` (integer)
      - `created_at` (timestamptz)

    - `ai_feedback`
      - `id` (uuid, primary key)
      - `message_id` (uuid, foreign key to ai_messages)
      - `user_id` (uuid, references auth.users)
      - `rating` (text) - positive, negative
      - `comment` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_site_user ON ai_conversations(site_id, user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status, last_message_at DESC);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- AI Gameplans Table
CREATE TABLE IF NOT EXISTS ai_gameplans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES ai_conversations(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_gameplans_site_user ON ai_gameplans(site_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_gameplans_status ON ai_gameplans(status, created_at DESC);

ALTER TABLE ai_gameplans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gameplans"
  ON ai_gameplans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create gameplans"
  ON ai_gameplans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gameplans"
  ON ai_gameplans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own gameplans"
  ON ai_gameplans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- AI Task Items Table
CREATE TABLE IF NOT EXISTS ai_task_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gameplan_id uuid NOT NULL REFERENCES ai_gameplans(id) ON DELETE CASCADE,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  phase text CHECK (phase IN ('Foundation', 'Growth', 'Optimization')),
  estimated_time text,
  order_index integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_task_items_gameplan ON ai_task_items(gameplan_id, order_index);
CREATE INDEX IF NOT EXISTS idx_ai_task_items_status ON ai_task_items(status, completed_at DESC);

ALTER TABLE ai_task_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their gameplans"
  ON ai_task_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_gameplans
      WHERE ai_gameplans.id = ai_task_items.gameplan_id
      AND ai_gameplans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their gameplans"
  ON ai_task_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_gameplans
      WHERE ai_gameplans.id = ai_task_items.gameplan_id
      AND ai_gameplans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their gameplans"
  ON ai_task_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_gameplans
      WHERE ai_gameplans.id = ai_task_items.gameplan_id
      AND ai_gameplans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_gameplans
      WHERE ai_gameplans.id = ai_task_items.gameplan_id
      AND ai_gameplans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their gameplans"
  ON ai_task_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_gameplans
      WHERE ai_gameplans.id = ai_task_items.gameplan_id
      AND ai_gameplans.user_id = auth.uid()
    )
  );

-- AI Usage Tracking Table
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('chat', 'gameplan', 'content_generation', 'color_palette', 'visual_theme', 'text_generation')),
  model_used text NOT NULL CHECK (model_used IN ('haiku', 'sonnet')),
  tokens_used integer NOT NULL DEFAULT 0,
  cost_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_tracking(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_site_date ON ai_usage_tracking(site_id, created_at DESC);

ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON ai_usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert usage tracking"
  ON ai_usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- AI Feedback Table
CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('positive', 'negative')),
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_message ON ai_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_rating ON ai_feedback(rating, created_at DESC);

ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON ai_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create feedback"
  ON ai_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to update gameplan progress based on task completion
CREATE OR REPLACE FUNCTION update_gameplan_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_gameplans
  SET
    progress_percentage = (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100
      )::integer
      FROM ai_task_items
      WHERE gameplan_id = COALESCE(NEW.gameplan_id, OLD.gameplan_id)
    ),
    status = CASE
      WHEN (
        SELECT COUNT(*) = COUNT(*) FILTER (WHERE status = 'completed')
        FROM ai_task_items
        WHERE gameplan_id = COALESCE(NEW.gameplan_id, OLD.gameplan_id)
      ) THEN 'completed'
      ELSE 'active'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.gameplan_id, OLD.gameplan_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gameplan_progress ON ai_task_items;

CREATE TRIGGER trigger_update_gameplan_progress
  AFTER INSERT OR UPDATE OR DELETE ON ai_task_items
  FOR EACH ROW
  EXECUTE FUNCTION update_gameplan_progress();
