/*
  # Add Missing Foreign Key Indexes

  ## Overview
  Adds indexes to all foreign key columns that were missing covering indexes.
  This dramatically improves query performance, especially for JOIN operations
  and cascade deletes/updates.

  ## Performance Impact
  Without these indexes:
  - JOIN queries perform table scans
  - Foreign key constraint checks are slow
  - DELETE/UPDATE cascades cause performance issues

  ## Tables Updated (23 total)
  - ai_conversations, ai_feedback, ai_gameplans
  - analytics_conversions
  - automation_workflows
  - contact_activities
  - email_sends
  - error_logs
  - global_sections
  - inventory_transactions
  - invitation_codes
  - marketing_pages
  - page_versions
  - payment_failures
  - platform_admins
  - product_access
  - site_members
  - subscriptions
  - webinars (2 foreign keys)
*/

-- ai_conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id 
  ON ai_conversations(user_id);

-- ai_feedback
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id 
  ON ai_feedback(user_id);

-- ai_gameplans
CREATE INDEX IF NOT EXISTS idx_ai_gameplans_conversation_id 
  ON ai_gameplans(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_gameplans_user_id 
  ON ai_gameplans(user_id);

-- analytics_conversions
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_order_id 
  ON analytics_conversions(order_id);

CREATE INDEX IF NOT EXISTS idx_analytics_conversions_page_id 
  ON analytics_conversions(page_id);

-- automation_workflows
CREATE INDEX IF NOT EXISTS idx_automation_workflows_created_by 
  ON automation_workflows(created_by);

-- contact_activities
CREATE INDEX IF NOT EXISTS idx_contact_activities_created_by 
  ON contact_activities(created_by);

-- email_sends
CREATE INDEX IF NOT EXISTS idx_email_sends_step_id 
  ON email_sends(step_id);

-- error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved_by 
  ON error_logs(resolved_by);

-- global_sections
CREATE INDEX IF NOT EXISTS idx_global_sections_created_by 
  ON global_sections(created_by);

-- inventory_transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_by 
  ON inventory_transactions(created_by);

-- invitation_codes
CREATE INDEX IF NOT EXISTS idx_invitation_codes_created_by 
  ON invitation_codes(created_by);

-- marketing_pages
CREATE INDEX IF NOT EXISTS idx_marketing_pages_created_by 
  ON marketing_pages(created_by);

CREATE INDEX IF NOT EXISTS idx_marketing_pages_updated_by 
  ON marketing_pages(updated_by);

-- page_versions
CREATE INDEX IF NOT EXISTS idx_page_versions_created_by 
  ON page_versions(created_by);

-- payment_failures
CREATE INDEX IF NOT EXISTS idx_payment_failures_order_id 
  ON payment_failures(order_id);

-- platform_admins
CREATE INDEX IF NOT EXISTS idx_platform_admins_created_by 
  ON platform_admins(created_by);

-- product_access
CREATE INDEX IF NOT EXISTS idx_product_access_order_id 
  ON product_access(order_id);

-- site_members
CREATE INDEX IF NOT EXISTS idx_site_members_invited_by 
  ON site_members(invited_by);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id 
  ON subscriptions(order_id);

-- webinars
CREATE INDEX IF NOT EXISTS idx_webinars_registration_page_id 
  ON webinars(registration_page_id);

CREATE INDEX IF NOT EXISTS idx_webinars_thank_you_page_id 
  ON webinars(thank_you_page_id);
