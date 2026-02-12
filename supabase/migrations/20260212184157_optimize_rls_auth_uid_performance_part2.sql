/*
  # Optimize RLS Policy Performance - Part 2

  ## Continuation of auth.uid() optimization
  Covers remaining tables: page_variants, page_submissions, email_templates,
  email_campaigns, email_sequences, email_sequence_steps, email_sends,
  orders, subscriptions, product_access, webinars, webinar_registrations,
  analytics tables, and more.
*/

-- ============================================================================
-- PAGE_VARIANTS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view page variants" ON page_variants;
CREATE POLICY "Site members can view page variants"
  ON page_variants FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage page variants" ON page_variants;
CREATE POLICY "Site marketers can manage page variants"
  ON page_variants FOR ALL
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer')
      )
    )
  );

-- ============================================================================
-- PAGE_SUBMISSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view page submissions" ON page_submissions;
CREATE POLICY "Site members can view page submissions"
  ON page_submissions FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage page submissions" ON page_submissions;
CREATE POLICY "Site marketers can manage page submissions"
  ON page_submissions FOR ALL
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer')
      )
    )
  );

-- ============================================================================
-- EMAIL_TEMPLATES
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view email templates" ON email_templates;
CREATE POLICY "Site members can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage email templates" ON email_templates;
CREATE POLICY "Site marketers can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- EMAIL_CAMPAIGNS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view email campaigns" ON email_campaigns;
CREATE POLICY "Site members can view email campaigns"
  ON email_campaigns FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage email campaigns" ON email_campaigns;
CREATE POLICY "Site marketers can manage email campaigns"
  ON email_campaigns FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- EMAIL_SEQUENCES
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view email sequences" ON email_sequences;
CREATE POLICY "Site members can view email sequences"
  ON email_sequences FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage email sequences" ON email_sequences;
CREATE POLICY "Site marketers can manage email sequences"
  ON email_sequences FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- EMAIL_SEQUENCE_STEPS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view email sequence steps" ON email_sequence_steps;
CREATE POLICY "Site members can view email sequence steps"
  ON email_sequence_steps FOR SELECT
  TO authenticated
  USING (
    sequence_id IN (
      SELECT id FROM email_sequences
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage email sequence steps" ON email_sequence_steps;
CREATE POLICY "Site marketers can manage email sequence steps"
  ON email_sequence_steps FOR ALL
  TO authenticated
  USING (
    sequence_id IN (
      SELECT id FROM email_sequences
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer')
      )
    )
  );

-- ============================================================================
-- EMAIL_SENDS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view email sends" ON email_sends;
CREATE POLICY "Site members can view email sends"
  ON email_sends FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage email sends" ON email_sends;
CREATE POLICY "Site marketers can manage email sends"
  ON email_sends FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- ORDERS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view orders" ON orders;
CREATE POLICY "Site members can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site admins can manage orders" ON orders;
CREATE POLICY "Site admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view subscriptions" ON subscriptions;
CREATE POLICY "Site members can view subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site admins can manage subscriptions" ON subscriptions;
CREATE POLICY "Site admins can manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PRODUCT_ACCESS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own access" ON product_access;
CREATE POLICY "Users can view their own access"
  ON product_access FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Site admins can manage product access" ON product_access;
CREATE POLICY "Site admins can manage product access"
  ON product_access FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- WEBINARS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view webinars" ON webinars;
CREATE POLICY "Site members can view webinars"
  ON webinars FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage webinars" ON webinars;
CREATE POLICY "Site marketers can manage webinars"
  ON webinars FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- WEBINAR_REGISTRATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view webinar registrations" ON webinar_registrations;
CREATE POLICY "Site members can view webinar registrations"
  ON webinar_registrations FOR SELECT
  TO authenticated
  USING (
    webinar_id IN (
      SELECT id FROM webinars
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Site members can manage webinar registrations" ON webinar_registrations;
CREATE POLICY "Site members can manage webinar registrations"
  ON webinar_registrations FOR ALL
  TO authenticated
  USING (
    webinar_id IN (
      SELECT id FROM webinars
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer')
      )
    )
  );
