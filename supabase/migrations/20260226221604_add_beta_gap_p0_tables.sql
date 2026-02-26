/*
  # Beta Gap P0 - Critical Tables and Fields

  1. New Tables
    - `dunning_attempts` - Tracks payment retry history for failed subscriptions
    - `webinar_attendance` - Tracks webinar registrations and attendance
    - `lesson_completions` - Tracks student progress through courses
    - `certificates` - Stores issued completion certificates
    - `in_app_notifications` - In-app notification banners

  2. Table Modifications
    - `webinars` - Add replay configuration fields
    - `contacts` - Add unsubscribe token field
    - `subscriptions` - Add dunning tracking fields

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for site members and users
*/

-- =====================================================
-- DUNNING ATTEMPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dunning_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  stripe_invoice_id text,
  attempt_number int NOT NULL DEFAULT 1 CHECK (attempt_number BETWEEN 1 AND 4),
  scheduled_for timestamptz NOT NULL,
  attempted_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  error_message text,
  notification_sent boolean DEFAULT false,
  in_app_notification_shown boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dunning_attempts_site ON dunning_attempts(site_id);
CREATE INDEX IF NOT EXISTS idx_dunning_attempts_subscription ON dunning_attempts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_dunning_attempts_status ON dunning_attempts(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_dunning_attempts_stripe_sub ON dunning_attempts(stripe_subscription_id);

ALTER TABLE dunning_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view dunning attempts"
  ON dunning_attempts FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- WEBINAR ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webinar_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id uuid REFERENCES webinars(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text,
  registered_at timestamptz DEFAULT now(),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  duration_seconds int DEFAULT 0,
  source text DEFAULT 'direct' CHECK (source IN ('direct', 'email', 'social', 'affiliate', 'embed')),
  reminder_24h_sent boolean DEFAULT false,
  reminder_1h_sent boolean DEFAULT false,
  replay_viewed boolean DEFAULT false,
  replay_viewed_at timestamptz,
  registration_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(webinar_id, email)
);

CREATE INDEX IF NOT EXISTS idx_webinar_attendance_webinar ON webinar_attendance(webinar_id);
CREATE INDEX IF NOT EXISTS idx_webinar_attendance_site ON webinar_attendance(site_id);
CREATE INDEX IF NOT EXISTS idx_webinar_attendance_contact ON webinar_attendance(contact_id);
CREATE INDEX IF NOT EXISTS idx_webinar_attendance_email ON webinar_attendance(email);

ALTER TABLE webinar_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can manage webinar attendance"
  ON webinar_attendance FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can register for webinars"
  ON webinar_attendance FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Registrants can view own registration"
  ON webinar_attendance FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- LESSON COMPLETIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  time_spent_seconds int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_product ON lesson_completions(product_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_site ON lesson_completions(site_id);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark lessons complete"
  ON lesson_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Site members can view all completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- CERTIFICATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  certificate_number text UNIQUE NOT NULL,
  student_name text NOT NULL,
  course_name text NOT NULL,
  issued_at timestamptz DEFAULT now(),
  pdf_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_product ON certificates(product_id);
CREATE INDEX IF NOT EXISTS idx_certificates_site ON certificates(site_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can verify certificates"
  ON certificates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Site members can view all certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM site_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- IN-APP NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('payment_failed', 'subscription_expiring', 'subscription_cancelled', 'welcome', 'feature_announcement', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  dismissed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_unread ON in_app_notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_type ON in_app_notifications(type);

ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON in_app_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON in_app_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- WEBINARS TABLE MODIFICATIONS - Add replay settings
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webinars' AND column_name = 'replay_url'
  ) THEN
    ALTER TABLE webinars ADD COLUMN replay_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webinars' AND column_name = 'replay_enabled'
  ) THEN
    ALTER TABLE webinars ADD COLUMN replay_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webinars' AND column_name = 'replay_delay_hours'
  ) THEN
    ALTER TABLE webinars ADD COLUMN replay_delay_hours int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webinars' AND column_name = 'replay_expires_at'
  ) THEN
    ALTER TABLE webinars ADD COLUMN replay_expires_at timestamptz;
  END IF;
END $$;

-- =====================================================
-- CONTACTS TABLE MODIFICATIONS - Add unsubscribe token
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'unsubscribe_token'
  ) THEN
    ALTER TABLE contacts ADD COLUMN unsubscribe_token text UNIQUE;
  END IF;
END $$;

-- Generate unsubscribe tokens for existing contacts
UPDATE contacts
SET unsubscribe_token = encode(gen_random_bytes(32), 'hex')
WHERE unsubscribe_token IS NULL;

-- =====================================================
-- SUBSCRIPTIONS TABLE MODIFICATIONS - Add dunning fields
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'dunning_started_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN dunning_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'grace_period_ends_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN grace_period_ends_at timestamptz;
  END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number text;
  exists_check boolean;
BEGIN
  LOOP
    new_number := 'CERT-' || upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM certificates WHERE certificate_number = new_number) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION set_contact_unsubscribe_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := generate_unsubscribe_token();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_contact_unsubscribe_token ON contacts;
CREATE TRIGGER trigger_set_contact_unsubscribe_token
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_contact_unsubscribe_token();
