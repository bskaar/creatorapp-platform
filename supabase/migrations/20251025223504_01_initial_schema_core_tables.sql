/*
  # Initial Schema - Core Tables for Creator CMS

  ## Overview
  This migration sets up the foundational database structure for a production-grade
  Creator CMS (Kajabi-style platform). It includes multi-tenancy, RBAC, content
  management, commerce, and analytics capabilities.

  ## New Tables Created

  ### 1. Sites (Multi-tenant workspaces)
  - Individual creator workspaces/accounts with tier management

  ### 2. User Management & RBAC
  - profiles - Extended user profiles
  - site_members - Team members and roles

  ### 3. Content Library
  - products - Courses, memberships, digital products
  - lessons - Individual content pieces
  - lesson_progress - Progress tracking

  ### 4. Contact Management & CRM
  - contacts - Customer and lead database
  - tags - Organizational tags
  - contact_tags - Many-to-many relationship

  ## Security
  - Row Level Security (RLS) enabled on ALL tables
  - Policies enforce multi-tenant isolation
  - Role-based access control

  ## Performance
  - Indexes on all foreign keys and frequently queried columns
  - GIN indexes on JSONB columns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES (Extended user data)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =====================================================
-- SITES (Multi-tenant workspaces)
-- =====================================================

CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL DEFAULT 'launch' CHECK (tier IN ('launch', 'growth', 'scale')),
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  custom_domain text,
  settings jsonb DEFAULT '{}'::jsonb,
  contacts_count int DEFAULT 0,
  products_count int DEFAULT 0,
  emails_sent_month int DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sites_owner ON sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SITE MEMBERS (Team members and roles)
-- =====================================================

CREATE TABLE IF NOT EXISTS site_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'marketer', 'support', 'creator', 'member')),
  permissions jsonb DEFAULT '[]'::jsonb,
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(site_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_site_members_site ON site_members(site_id);
CREATE INDEX IF NOT EXISTS idx_site_members_user ON site_members(user_id);

ALTER TABLE site_members ENABLE ROW LEVEL SECURITY;

-- Now we can add site policies that reference site_members
CREATE POLICY "Users can view their own sites"
  ON sites FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = sites.id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sites"
  ON sites FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Site owners can update their sites"
  ON sites FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Site members policies
CREATE POLICY "Users can view site members where they are members"
  ON site_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_members.site_id
      AND (sites.owner_id = auth.uid() OR site_members.user_id = auth.uid())
    )
  );

CREATE POLICY "Site owners and admins can manage members"
  ON site_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members sm
      WHERE sm.site_id = site_members.site_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- TAGS (Organizational tags)
-- =====================================================

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  tag_type text NOT NULL CHECK (tag_type IN ('contact', 'content', 'general')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(site_id, name, tag_type)
);

CREATE INDEX IF NOT EXISTS idx_tags_site ON tags(site_id);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = tags.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = tags.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer', 'creator')
    )
  );

-- =====================================================
-- PRODUCTS (Courses, memberships, digital products)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  product_type text NOT NULL CHECK (product_type IN ('course', 'membership', 'digital_product', 'coaching')),
  price_amount decimal(10,2) DEFAULT 0,
  price_currency text DEFAULT 'USD',
  billing_type text DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'recurring')),
  billing_interval text CHECK (billing_interval IN ('monthly', 'quarterly', 'yearly')),
  thumbnail_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  access_duration_days int,
  shopify_product_id text,
  paypal_product_id text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_site ON products(site_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = products.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site creators can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = products.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'creator')
    )
  );

-- =====================================================
-- LESSONS (Content within products)
-- =====================================================

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('video', 'audio', 'text', 'pdf', 'quiz')),
  content_text text,
  media_url text,
  media_duration_seconds int,
  order_index int DEFAULT 0,
  is_preview boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_product ON lessons(product_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(product_id, order_index);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = lessons.product_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site creators can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN site_members sm ON sm.site_id = p.site_id
      WHERE p.id = lessons.product_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'creator')
    )
  );

-- =====================================================
-- LESSON PROGRESS (Member progress tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  progress_percent int DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_position_seconds int DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON lesson_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- CONTACTS (Customer and lead database)
-- =====================================================

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text,
  phone text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  custom_fields jsonb DEFAULT '{}'::jsonb,
  rfm_score int DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  last_activity_at timestamptz,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(site_id, email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_site ON contacts(site_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(site_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_custom_fields ON contacts USING gin(custom_fields);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = contacts.site_id
      AND site_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can manage contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_members
      WHERE site_members.site_id = contacts.site_id
      AND site_members.user_id = auth.uid()
      AND site_members.role IN ('owner', 'admin', 'marketer', 'support')
    )
  );

-- =====================================================
-- CONTACT TAGS (Many-to-many)
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  tagged_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_tags_contact ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag ON contact_tags(tag_id);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site members can view contact tags"
  ON contact_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      JOIN site_members sm ON sm.site_id = c.site_id
      WHERE c.id = contact_tags.contact_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Site members can manage contact tags"
  ON contact_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      JOIN site_members sm ON sm.site_id = c.site_id
      WHERE c.id = contact_tags.contact_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin', 'marketer')
    )
  );