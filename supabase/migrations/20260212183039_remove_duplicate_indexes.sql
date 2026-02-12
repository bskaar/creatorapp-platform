/*
  # Remove Duplicate Indexes

  ## Overview
  Removes duplicate indexes that provide no benefit but consume storage
  and slow down write operations.

  ## Duplicates Removed (keeping the better-named version)
  
  1. orders table:
     - Drop idx_orders_created (keep idx_orders_created_at)
     - Drop idx_orders_site (keep idx_orders_site_id)
  
  2. pages table:
     - Drop idx_pages_site (keep idx_pages_site_id)
     - Drop idx_pages_status (keep idx_pages_site_id_status - composite is better)
  
  3. products table:
     - Drop idx_products_site (keep idx_products_site_id)
  
  4. site_members table:
     - Drop idx_site_members_site (keep idx_site_members_site_id)
     - Drop idx_site_members_user (keep idx_site_members_user_id)
  
  5. sites table:
     - Drop idx_sites_owner (keep idx_sites_owner_id)
  
  6. webhook_events table:
     - Drop idx_webhook_events_event_id (keep webhook_events_event_id_key - unique constraint)
  
  ## Performance Impact
  - Reduces storage usage
  - Improves INSERT/UPDATE performance
  - No impact on query performance (identical indexes)
*/

-- orders table
DROP INDEX IF EXISTS idx_orders_created;
DROP INDEX IF EXISTS idx_orders_site;

-- pages table
DROP INDEX IF EXISTS idx_pages_site;
DROP INDEX IF EXISTS idx_pages_status;

-- products table
DROP INDEX IF EXISTS idx_products_site;

-- site_members table
DROP INDEX IF EXISTS idx_site_members_site;
DROP INDEX IF EXISTS idx_site_members_user;

-- sites table
DROP INDEX IF EXISTS idx_sites_owner;

-- webhook_events table
DROP INDEX IF EXISTS idx_webhook_events_event_id;
