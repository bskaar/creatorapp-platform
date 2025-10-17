/*
  # Funnels, Pages, and Email Marketing Schema

  ## Overview
  This migration adds funnel/page builder capabilities and email marketing
  infrastructure for the Creator CMS.

  ## New Tables Created

  ### 1. Funnels & Pages
  - `funnels` - Multi-step customer journey flows
    - id, site_id, name, description, goal_type, status
  - `pages` - Landing pages, sales pages, checkout pages
    - id, site_id, funnel_id, title, slug, page_type
    - content (JSON blocks for page builder), SEO fields, custom CSS
  - `page_variants` - A/B test variants (Growth+ tier)
    - id, page_id, name, content, traffic_percent, conversions
  - `page_submissions` - Form submissions from pages
    - id, page_id, contact_id, form_data, submitted_at

  ### 2. Email Marketing
  - `email_campaigns` - Broadcast and sequence campaigns
    - id, site_id, name, subject, content, type, status
  - `email_sequences` - Automated drip campaigns
    - id, site_id, name, trigger_type, trigger_config
  - `email_sequence_steps` - Individual emails in sequences
    - id, sequence_id, subject, content, delay
  - `email_sends` - Individual email delivery tracking
    - id, campaign_id, contact_id, status, sent_at, opened_at, clicked_at
  - `email_templates` - Reusable email templates
    - id, site_id, name, subject, content, thumbnail

  ## Security
  - RLS enabled on all tables
  - Multi-tenant isolation via site_id
  - Role-based permissions

  ## Performance
  - Indexes on foreign keys
  - Composite indexes for common queries
  - GIN index on JSONB content
*/

-- =====================================================
-- FUNNELS (Customer journey flows)
-- =====================================================

CREATE TABLE IF NOT EXISTS funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  goal_type text CHECK (goal_type IN ('lead_generation', 'product_sale', 'webinar_registration', 'membership_signup')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funnels_site ON funnels(site_id);
CREATE INDEX IF NOT EXISTS idx_funnels_status ON funnels(site_id, status);

ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view funnels"
  ON funnels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = funnels.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage funnels"
  ON funnels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = funnels.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- PAGES (Landing pages, sales pages, etc.)
-- =====================================================

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  funnel_id uuid REFERENCES funnels(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  page_type text NOT NULL CHECK (page_type IN ('landing', 'sales', 'checkout', 'thank_you', 'webinar_registration', 'custom')),
  content jsonb DEFAULT '{"blocks": []}'::jsonb,
  seo_title text,
  seo_description text,
  seo_image_url text,
  custom_css text,
  custom_js text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  views_count int DEFAULT 0,
  conversions_count int DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_site ON pages(site_id);
CREATE INDEX IF NOT EXISTS idx_pages_funnel ON pages(funnel_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(site_id, slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(site_id, status);
CREATE INDEX IF NOT EXISTS idx_pages_content ON pages USING gin(content);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view pages"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = pages.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- PAGE VARIANTS (A/B testing)
-- =====================================================

CREATE TABLE IF NOT EXISTS page_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  content jsonb DEFAULT '{"blocks": []}'::jsonb,
  traffic_percent int DEFAULT 0 CHECK (traffic_percent >= 0 AND traffic_percent <= 100),
  is_control boolean DEFAULT false,
  views_count int DEFAULT 0,
  conversions_count int DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'winner')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_variants_page ON page_variants(page_id);

ALTER TABLE page_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view page variants"
  ON page_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_variants.page_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage page variants"
  ON page_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_variants.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- PAGE SUBMISSIONS (Form submissions)
-- =====================================================

CREATE TABLE IF NOT EXISTS page_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  form_data jsonb NOT NULL,
  ip_address text,
  user_agent text,
  referrer_url text,
  submitted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_submissions_page ON page_submissions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_submissions_contact ON page_submissions(contact_id);
CREATE INDEX IF NOT EXISTS idx_page_submissions_date ON page_submissions(submitted_at DESC);

ALTER TABLE page_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view page submissions"
  ON page_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_submissions.page_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage page submissions"
  ON page_submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = page_submissions.page_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer', 'support')
    )
  );

-- =====================================================
-- EMAIL TEMPLATES (Reusable templates)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text,
  preview_text text,
  content jsonb DEFAULT '{"blocks": []}'::jsonb,
  thumbnail_url text,
  template_type text CHECK (template_type IN ('broadcast', 'automation', 'transactional')),
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_site ON email_templates(site_id);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_templates.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_templates.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- EMAIL CAMPAIGNS (Broadcasts)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  preview_text text,
  content jsonb DEFAULT '{"blocks": []}'::jsonb,
  from_name text,
  from_email text,
  reply_to text,
  campaign_type text DEFAULT 'broadcast' CHECK (campaign_type IN ('broadcast', 'sequence')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count int DEFAULT 0,
  sent_count int DEFAULT 0,
  delivered_count int DEFAULT 0,
  opened_count int DEFAULT 0,
  clicked_count int DEFAULT 0,
  unsubscribed_count int DEFAULT 0,
  bounced_count int DEFAULT 0,
  segment_config jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_site ON email_campaigns(site_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(site_id, status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view email campaigns"
  ON email_campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_campaigns.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage email campaigns"
  ON email_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_campaigns.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- EMAIL SEQUENCES (Automated drip campaigns)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('tag_added', 'product_purchased', 'page_visited', 'funnel_entered', 'webinar_registered', 'manual')),
  trigger_config jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  subscribers_count int DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_sequences_site ON email_sequences(site_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(site_id, status);

ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view email sequences"
  ON email_sequences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_sequences.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage email sequences"
  ON email_sequences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_sequences.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- EMAIL SEQUENCE STEPS (Individual emails)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES email_sequences(id) ON DELETE CASCADE NOT NULL,
  step_order int NOT NULL,
  subject text NOT NULL,
  preview_text text,
  content jsonb DEFAULT '{"blocks": []}'::jsonb,
  delay_days int DEFAULT 0,
  delay_hours int DEFAULT 0,
  from_name text,
  from_email text,
  reply_to text,
  sent_count int DEFAULT 0,
  opened_count int DEFAULT 0,
  clicked_count int DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sequence_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_email_sequence_steps_sequence ON email_sequence_steps(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_steps_order ON email_sequence_steps(sequence_id, step_order);

ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view email sequence steps"
  ON email_sequence_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_sequences es
      JOIN site_members sm ON sm.site_id = es.site_id
      WHERE es.id = email_sequence_steps.sequence_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage email sequence steps"
  ON email_sequence_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_sequences es
      JOIN site_members sm ON sm.site_id = es.site_id
      WHERE es.id = email_sequence_steps.sequence_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer')
    )
  );

-- =====================================================
-- EMAIL SENDS (Individual email tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE SET NULL,
  sequence_id uuid REFERENCES email_sequences(id) ON DELETE SET NULL,
  step_id uuid REFERENCES email_sequence_steps(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  subject text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  unsubscribed_at timestamptz,
  bounced_at timestamptz,
  bounce_reason text,
  opens_count int DEFAULT 0,
  clicks_count int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_site ON email_sends(site_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_sequence ON email_sends(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_contact ON email_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at DESC);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view email sends"
  ON email_sends FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_sends.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site marketers can manage email sends"
  ON email_sends FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = email_sends.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer')
    )
  );