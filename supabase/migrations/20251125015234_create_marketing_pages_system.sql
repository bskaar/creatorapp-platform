/*
  # Marketing Pages System

  1. New Tables
    - `marketing_pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier (e.g., 'about', 'privacy-policy')
      - `title` (text) - Page title
      - `content` (text) - HTML/Markdown content
      - `meta_description` (text) - SEO description
      - `published` (boolean) - Whether page is live
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid) - References auth.users
      - `updated_by` (uuid) - References auth.users

  2. Security
    - Enable RLS on `marketing_pages` table
    - Public can read published pages
    - Only authenticated users can create/update pages
    
  3. Default Pages
    - Creates default pages: About, Blog, Contact, Documentation, Privacy Policy, Terms of Service
*/

CREATE TABLE IF NOT EXISTS marketing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  meta_description text DEFAULT '',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE marketing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published marketing pages"
  ON marketing_pages
  FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all marketing pages"
  ON marketing_pages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert marketing pages"
  ON marketing_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update marketing pages"
  ON marketing_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = updated_by);

CREATE POLICY "Authenticated users can delete marketing pages"
  ON marketing_pages
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default marketing pages
INSERT INTO marketing_pages (slug, title, content, meta_description, published)
VALUES 
  (
    'about',
    'About CreatorApp',
    '<h1>About CreatorApp</h1><p>CreatorApp is the complete solution for modern creator businesses. We help thousands of creators build, grow, and monetize their digital empires.</p><h2>Our Mission</h2><p>To empower creators with the tools they need to succeed in the digital economy.</p>',
    'Learn about CreatorApp and our mission to empower creators worldwide.',
    true
  ),
  (
    'blog',
    'Blog',
    '<h1>Blog</h1><p>Welcome to the CreatorApp blog. Stay updated with the latest tips, trends, and insights for creator businesses.</p>',
    'Stay updated with creator business tips, trends, and insights from CreatorApp.',
    true
  ),
  (
    'contact',
    'Contact Us',
    '<h1>Contact Us</h1><p>Have questions? We''d love to hear from you.</p><h2>Email</h2><p>support@creatorapp.com</p><h2>Support Hours</h2><p>Monday - Friday: 9am - 6pm EST</p>',
    'Get in touch with the CreatorApp team. We''re here to help.',
    true
  ),
  (
    'documentation',
    'Documentation',
    '<h1>Documentation</h1><p>Welcome to CreatorApp documentation. Find guides, tutorials, and resources to help you get the most out of the platform.</p><h2>Getting Started</h2><p>Learn the basics of CreatorApp.</p><h2>Advanced Features</h2><p>Explore powerful features to grow your business.</p>',
    'Complete documentation and guides for using CreatorApp.',
    true
  ),
  (
    'privacy-policy',
    'Privacy Policy',
    '<h1>Privacy Policy</h1><p><strong>Last Updated:</strong> January 2025</p><h2>Information We Collect</h2><p>We collect information you provide directly to us when you create an account, use our services, or communicate with us.</p><h2>How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services.</p><h2>Data Security</h2><p>We implement appropriate security measures to protect your personal information.</p>',
    'CreatorApp privacy policy - Learn how we protect your data.',
    true
  ),
  (
    'terms-of-service',
    'Terms of Service',
    '<h1>Terms of Service</h1><p><strong>Last Updated:</strong> January 2025</p><h2>Acceptance of Terms</h2><p>By accessing and using CreatorApp, you accept and agree to be bound by these Terms of Service.</p><h2>Account Registration</h2><p>You must register for an account to use certain features of our service.</p><h2>User Responsibilities</h2><p>You are responsible for maintaining the security of your account and all activities that occur under your account.</p>',
    'CreatorApp terms of service - Read our terms and conditions.',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_marketing_pages_slug ON marketing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_pages_published ON marketing_pages(published);
