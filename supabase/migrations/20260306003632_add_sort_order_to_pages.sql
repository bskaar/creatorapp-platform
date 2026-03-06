/*
  # Add Sort Order to Pages Table

  1. Changes
    - Add `sort_order` column to `pages` table for funnel page ordering
    - Default value is 0, allowing pages to be reordered within funnels

  2. Purpose
    - Enables drag-and-drop reordering of pages in funnel views
    - Persists page order across sessions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE pages ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pages_funnel_sort_order ON pages(funnel_id, sort_order);
