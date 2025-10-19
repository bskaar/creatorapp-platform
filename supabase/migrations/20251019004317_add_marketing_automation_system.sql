/*
  # Marketing Automation System

  ## Overview
  This migration creates a comprehensive marketing automation system with:
  - Visual workflow builder support
  - Trigger-based automation
  - Multi-step sequences
  - Conditional logic
  - Action execution tracking

  ## New Tables

  ### `automation_workflows`
  - `id` (uuid, primary key) - Workflow identifier
  - `site_id` (uuid, foreign key) - Links to sites
  - `name` (text) - Workflow name
  - `description` (text) - Workflow description
  - `trigger_type` (text) - What starts the workflow
  - `trigger_config` (jsonb) - Trigger configuration
  - `workflow_data` (jsonb) - Visual workflow structure (nodes/edges)
  - `status` (text) - draft, active, paused, archived
  - `subscribers_count` (integer) - Active subscribers
  - `completion_count` (integer) - Completed workflows
  - `created_by` (uuid)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `workflow_enrollments`
  - `id` (uuid, primary key)
  - `workflow_id` (uuid, foreign key)
  - `contact_id` (uuid, foreign key)
  - `status` (text) - active, completed, stopped, failed
  - `current_step` (integer) - Current step index
  - `enrolled_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `stopped_at` (timestamptz)
  - `stop_reason` (text)
  - `context_data` (jsonb) - Workflow-specific data

  ### `workflow_step_executions`
  - `id` (uuid, primary key)
  - `enrollment_id` (uuid, foreign key)
  - `workflow_id` (uuid, foreign key)
  - `step_index` (integer)
  - `step_type` (text) - email, wait, condition, tag, webhook
  - `status` (text) - pending, executed, failed, skipped
  - `executed_at` (timestamptz)
  - `execution_data` (jsonb) - Step results
  - `error_message` (text)

  ### `contact_segments`
  - `id` (uuid, primary key)
  - `site_id` (uuid, foreign key)
  - `name` (text) - Segment name
  - `description` (text)
  - `conditions` (jsonb) - Segment rules
  - `contact_count` (integer) - Cached count
  - `is_dynamic` (boolean) - Auto-update membership
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `segment_memberships`
  - `id` (uuid, primary key)
  - `segment_id` (uuid, foreign key)
  - `contact_id` (uuid, foreign key)
  - `added_at` (timestamptz)

  ## Trigger Types
  - tag_added: When contact gets a tag
  - form_submitted: Form submission
  - product_purchased: Product purchase
  - page_visited: Specific page visit
  - link_clicked: Email link click
  - date_based: Anniversary, birthday
  - manual: Manually enrolled

  ## Step Types
  - send_email: Send email to contact
  - wait: Delay for duration
  - add_tag: Add tag to contact
  - remove_tag: Remove tag from contact
  - conditional: Branch based on criteria
  - webhook: Call external API
  - update_field: Update contact field

  ## Security
  - RLS enabled on all tables
  - Site-based isolation
  - Role-based access control
*/

-- Create automation_workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'tag_added', 'form_submitted', 'product_purchased', 'page_visited',
    'link_clicked', 'date_based', 'manual', 'segment_entered'
  )),
  trigger_config jsonb DEFAULT '{}'::jsonb,
  workflow_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  subscribers_count integer DEFAULT 0,
  completion_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow_enrollments table
CREATE TABLE IF NOT EXISTS workflow_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'stopped', 'failed')),
  current_step integer DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  stopped_at timestamptz,
  stop_reason text,
  context_data jsonb DEFAULT '{}'::jsonb,
  UNIQUE(workflow_id, contact_id)
);

-- Create workflow_step_executions table
CREATE TABLE IF NOT EXISTS workflow_step_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES workflow_enrollments(id) ON DELETE CASCADE,
  workflow_id uuid NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  step_type text NOT NULL CHECK (step_type IN (
    'send_email', 'wait', 'add_tag', 'remove_tag', 'conditional',
    'webhook', 'update_field', 'send_notification'
  )),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
  executed_at timestamptz,
  execution_data jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create contact_segments table
CREATE TABLE IF NOT EXISTS contact_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_count integer DEFAULT 0,
  is_dynamic boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create segment_memberships table
CREATE TABLE IF NOT EXISTS segment_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid NOT NULL REFERENCES contact_segments(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(segment_id, contact_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_workflows_site ON automation_workflows(site_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(site_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger ON automation_workflows(trigger_type);

CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_workflow ON workflow_enrollments(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_contact ON workflow_enrollments(contact_id);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_active ON workflow_enrollments(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_enrollment ON workflow_step_executions(enrollment_id, step_index);
CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_workflow ON workflow_step_executions(workflow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_pending ON workflow_step_executions(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_contact_segments_site ON contact_segments(site_id);
CREATE INDEX IF NOT EXISTS idx_segment_memberships_segment ON segment_memberships(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_memberships_contact ON segment_memberships(contact_id);

-- Enable RLS
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_workflows
CREATE POLICY "Site members can view workflows"
  ON automation_workflows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = automation_workflows.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage workflows"
  ON automation_workflows FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = automation_workflows.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- RLS Policies for workflow_enrollments
CREATE POLICY "Site members can view enrollments"
  ON workflow_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM automation_workflows aw
      INNER JOIN site_members sm ON sm.site_id = aw.site_id
      WHERE aw.id = workflow_enrollments.workflow_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage enrollments"
  ON workflow_enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM automation_workflows aw
      INNER JOIN site_members sm ON sm.site_id = aw.site_id
      WHERE aw.id = workflow_enrollments.workflow_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer')
    )
  );

-- RLS Policies for workflow_step_executions
CREATE POLICY "Site members can view executions"
  ON workflow_step_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM automation_workflows aw
      INNER JOIN site_members sm ON sm.site_id = aw.site_id
      WHERE aw.id = workflow_step_executions.workflow_id
      AND sm.user_id = auth.uid()
    )
  );

-- RLS Policies for contact_segments
CREATE POLICY "Site members can view segments"
  ON contact_segments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = contact_segments.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage segments"
  ON contact_segments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = contact_segments.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- RLS Policies for segment_memberships
CREATE POLICY "Site members can view memberships"
  ON segment_memberships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contact_segments cs
      INNER JOIN site_members sm ON sm.site_id = cs.site_id
      WHERE cs.id = segment_memberships.segment_id
      AND sm.user_id = auth.uid()
    )
  );

-- Function to update workflow subscriber count
CREATE OR REPLACE FUNCTION update_workflow_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE automation_workflows
    SET subscribers_count = subscribers_count + 1
    WHERE id = NEW.workflow_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE automation_workflows
      SET subscribers_count = subscribers_count - 1
      WHERE id = NEW.workflow_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE automation_workflows
      SET subscribers_count = subscribers_count + 1
      WHERE id = NEW.workflow_id;
    END IF;
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE automation_workflows
      SET completion_count = completion_count + 1
      WHERE id = NEW.workflow_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_enrollment_count_update
  AFTER INSERT OR UPDATE ON workflow_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_subscriber_count();

-- Function to update segment contact count
CREATE OR REPLACE FUNCTION update_segment_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contact_segments
    SET contact_count = contact_count + 1
    WHERE id = NEW.segment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contact_segments
    SET contact_count = contact_count - 1
    WHERE id = OLD.segment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER segment_membership_count_update
  AFTER INSERT OR DELETE ON segment_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_segment_contact_count();