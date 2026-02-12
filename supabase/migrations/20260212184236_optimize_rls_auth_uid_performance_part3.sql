/*
  # Optimize RLS Policy Performance - Part 3

  ## Continuation of auth.uid() optimization
  Covers: analytics tables, automation workflows, page versions, custom blocks,
  global sections, product variants, inventory, discount codes, contact segments,
  and admin tables.
*/

-- ============================================================================
-- ANALYTICS_EVENTS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view analytics events" ON analytics_events;
CREATE POLICY "Site members can view analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site members can insert analytics events" ON analytics_events;
CREATE POLICY "Site members can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- FUNNEL_ANALYTICS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view funnel analytics" ON funnel_analytics;
CREATE POLICY "Site members can view funnel analytics"
  ON funnel_analytics FOR SELECT
  TO authenticated
  USING (
    funnel_id IN (
      SELECT id FROM funnels
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Site members can manage funnel analytics" ON funnel_analytics;
CREATE POLICY "Site members can manage funnel analytics"
  ON funnel_analytics FOR ALL
  TO authenticated
  USING (
    funnel_id IN (
      SELECT id FROM funnels
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer')
      )
    )
  );

-- ============================================================================
-- CONTACT_ACTIVITIES
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view contact activities" ON contact_activities;
CREATE POLICY "Site members can view contact activities"
  ON contact_activities FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site members can manage contact activities" ON contact_activities;
CREATE POLICY "Site members can manage contact activities"
  ON contact_activities FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- PAGE_VERSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view page versions in their sites" ON page_versions;
CREATE POLICY "Users can view page versions in their sites"
  ON page_versions FOR SELECT
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

DROP POLICY IF EXISTS "Users can create versions for pages they can edit" ON page_versions;
CREATE POLICY "Users can create versions for pages they can edit"
  ON page_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer', 'editor')
      )
    )
  );

DROP POLICY IF EXISTS "Users can update versions in their sites" ON page_versions;
CREATE POLICY "Users can update versions in their sites"
  ON page_versions FOR UPDATE
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer', 'editor')
      )
    )
  );

-- ============================================================================
-- CUSTOM_BLOCKS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view custom blocks in their sites" ON custom_blocks;
CREATE POLICY "Users can view custom blocks in their sites"
  ON custom_blocks FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create custom blocks in their sites" ON custom_blocks;
CREATE POLICY "Users can create custom blocks in their sites"
  ON custom_blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Users can update their own custom blocks" ON custom_blocks;
CREATE POLICY "Users can update their own custom blocks"
  ON custom_blocks FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own custom blocks" ON custom_blocks;
CREATE POLICY "Users can delete their own custom blocks"
  ON custom_blocks FOR DELETE
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================================================
-- ANALYTICS_SESSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view sessions" ON analytics_sessions;
CREATE POLICY "Site members can view sessions"
  ON analytics_sessions FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- GLOBAL_SECTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view global sections in their sites" ON global_sections;
CREATE POLICY "Users can view global sections in their sites"
  ON global_sections FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Editors can create global sections" ON global_sections;
CREATE POLICY "Editors can create global sections"
  ON global_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Editors can update global sections" ON global_sections;
CREATE POLICY "Editors can update global sections"
  ON global_sections FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can delete global sections" ON global_sections;
CREATE POLICY "Admins can delete global sections"
  ON global_sections FOR DELETE
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PAGE_GLOBAL_SECTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view page global sections" ON page_global_sections;
CREATE POLICY "Users can view page global sections"
  ON page_global_sections FOR SELECT
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

DROP POLICY IF EXISTS "Editors can insert page global sections" ON page_global_sections;
CREATE POLICY "Editors can insert page global sections"
  ON page_global_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'editor')
      )
    )
  );

DROP POLICY IF EXISTS "Editors can update page global sections" ON page_global_sections;
CREATE POLICY "Editors can update page global sections"
  ON page_global_sections FOR UPDATE
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'editor')
      )
    )
  );

DROP POLICY IF EXISTS "Editors can delete page global sections" ON page_global_sections;
CREATE POLICY "Editors can delete page global sections"
  ON page_global_sections FOR DELETE
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'editor')
      )
    )
  );

-- ============================================================================
-- PRODUCT_VARIANTS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view all variants" ON product_variants;
CREATE POLICY "Site members can view all variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Site admins can manage variants" ON product_variants;
CREATE POLICY "Site admins can manage variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin')
      )
    )
  );

-- ============================================================================
-- INVENTORY_TRANSACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view inventory transactions" ON inventory_transactions;
CREATE POLICY "Site members can view inventory transactions"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (
    variant_id IN (
      SELECT id FROM product_variants
      WHERE product_id IN (
        SELECT id FROM products
        WHERE site_id IN (
          SELECT site_id FROM site_members
          WHERE user_id = (select auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS "Site admins can manage inventory" ON inventory_transactions;
CREATE POLICY "Site admins can manage inventory"
  ON inventory_transactions FOR ALL
  TO authenticated
  USING (
    variant_id IN (
      SELECT id FROM product_variants
      WHERE product_id IN (
        SELECT id FROM products
        WHERE site_id IN (
          SELECT site_id FROM site_members
          WHERE user_id = (select auth.uid())
          AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- ============================================================================
-- DISCOUNT_CODES
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view discount codes" ON discount_codes;
CREATE POLICY "Site members can view discount codes"
  ON discount_codes FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site admins can manage discount codes" ON discount_codes;
CREATE POLICY "Site admins can manage discount codes"
  ON discount_codes FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- AUTOMATION_WORKFLOWS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view workflows" ON automation_workflows;
CREATE POLICY "Site members can view workflows"
  ON automation_workflows FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage workflows" ON automation_workflows;
CREATE POLICY "Site marketers can manage workflows"
  ON automation_workflows FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- WORKFLOW_ENROLLMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view enrollments" ON workflow_enrollments;
CREATE POLICY "Site members can view enrollments"
  ON workflow_enrollments FOR SELECT
  TO authenticated
  USING (
    workflow_id IN (
      SELECT id FROM automation_workflows
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "System can manage enrollments" ON workflow_enrollments;
CREATE POLICY "System can manage enrollments"
  ON workflow_enrollments FOR ALL
  TO authenticated
  USING (
    workflow_id IN (
      SELECT id FROM automation_workflows
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
        AND role IN ('owner', 'admin', 'marketer')
      )
    )
  );

-- ============================================================================
-- WORKFLOW_STEP_EXECUTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view executions" ON workflow_step_executions;
CREATE POLICY "Site members can view executions"
  ON workflow_step_executions FOR SELECT
  TO authenticated
  USING (
    workflow_id IN (
      SELECT id FROM automation_workflows
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );

-- ============================================================================
-- CONTACT_SEGMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view segments" ON contact_segments;
CREATE POLICY "Site members can view segments"
  ON contact_segments FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Site marketers can manage segments" ON contact_segments;
CREATE POLICY "Site marketers can manage segments"
  ON contact_segments FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members
      WHERE user_id = (select auth.uid())
      AND role IN ('owner', 'admin', 'marketer')
    )
  );

-- ============================================================================
-- SEGMENT_MEMBERSHIPS
-- ============================================================================

DROP POLICY IF EXISTS "Site members can view memberships" ON segment_memberships;
CREATE POLICY "Site members can view memberships"
  ON segment_memberships FOR SELECT
  TO authenticated
  USING (
    segment_id IN (
      SELECT id FROM contact_segments
      WHERE site_id IN (
        SELECT site_id FROM site_members
        WHERE user_id = (select auth.uid())
      )
    )
  );
