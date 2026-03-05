/*
  # Enable Realtime for Team Collaboration

  1. Purpose
    - Enable Supabase Realtime on key tables to support team collaboration features
    - Growth tier and above users can receive instant updates when team members make changes

  2. Tables Added to Realtime Publication
    - `in_app_notifications` - Real-time notification delivery to team members
    - `site_members` - Instant updates when team members are added/removed/changed
    - `pages` - Collaborative editing awareness (see when others modify pages)
    - `products` - Real-time commerce updates across team
    - `contacts` - Instant contact/lead updates for sales teams
    - `orders` - Real-time order notifications

  3. Notes
    - RLS policies still apply to realtime subscriptions
    - Each user only receives updates for data they have permission to see
    - This enables WebSocket connections that were previously failing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'in_app_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE in_app_notifications;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE site_members;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pages;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'contacts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
